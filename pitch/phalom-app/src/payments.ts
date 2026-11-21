/**
 * Partner-agnostic payment webhook & provider adapter layer.
 *
 * Phalom never holds merchant or tourist funds. Real payment confirmation always
 * arrives from a BOL-licensed payment partner (recommended sequence: BCEL first,
 * LOCA Pay backup, NewPay in parallel for Alipay/WeChat — see Partner_Choice_lo.md).
 *
 * Adding a signed partner requires implementing one WebhookAdapter here without
 * changing core auth, database, or UI flows.
 */
import { verifyWebhookSignature } from "./auth";

export const SUPPORTED_WALLETS = ["alipay", "wechat", "unionpay", "promptpay", "vietqr", "kakaopay", "laoqr"] as const;
export type WalletCode = (typeof SUPPORTED_WALLETS)[number];

export type PartnerCode = "payment" | "generic" | "phajay" | "bcel" | "newpay" | "loca";

export interface WebhookEnv {
  WEBHOOK_SECRET?: string;
  PHAJAY_WEBHOOK_SECRET?: string;
}

export interface VerifiedWebhookEvent {
  provider: string;
  paymentId: string;
  wallet: WalletCode;
  reference: string | null;
  status: "paid" | "ignored";
  rawStatus: string;
}

export class WebhookError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface WebhookAdapter {
  name: string;
  verifyAndParse(req: Request, rawBody: string, env: WebhookEnv): Promise<VerifiedWebhookEvent>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const enc = new TextEncoder();

function normalizeWallet(raw: unknown): WalletCode {
  const s = String(raw ?? "").trim().toLowerCase();
  if ((SUPPORTED_WALLETS as readonly string[]).includes(s)) return s as WalletCode;
  if (/alipay/.test(s)) return "alipay";
  if (/wechat|wx/.test(s)) return "wechat";
  if (/union/.test(s)) return "unionpay";
  if (/prompt|thai/.test(s)) return "promptpay";
  if (/viet/.test(s)) return "vietqr";
  if (/kakao/.test(s)) return "kakaopay";
  return "laoqr";
}

function parseUuid(raw: unknown): string {
  const s = String(raw ?? "").trim().toLowerCase();
  if (!UUID.test(s)) throw new WebhookError(400, "invalid_payment");
  return s;
}

function parseJsonObject(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not_object");
    return parsed as Record<string, unknown>;
  } catch {
    throw new WebhookError(400, "invalid_json");
  }
}

async function verifyBase64HmacSha256(secret: string, raw: string, sigBase64: string | null): Promise<boolean> {
  if (!sigBase64) return false;
  let bin: string;
  try {
    bin = atob(sigBase64.trim());
  } catch {
    return false;
  }
  if (bin.length !== 32) return false;
  const sig = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) sig[i] = bin.charCodeAt(i);
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, sig as BufferSource, enc.encode(raw));
}

/**
 * Standard Phalom HMAC-SHA256 webhook adapter (hex signature in X-Phalom-Signature).
 * Used by POST /api/webhooks/payment and /api/webhooks/generic.
 */
export const genericHmacAdapter: WebhookAdapter = {
  name: "generic",
  async verifyAndParse(req, rawBody, env) {
    if (!env.WEBHOOK_SECRET) throw new WebhookError(501, "webhook_not_configured");
    const valid = await verifyWebhookSignature(env.WEBHOOK_SECRET, rawBody, req.headers.get("x-phalom-signature"));
    if (!valid) throw new WebhookError(401, "bad_signature");
    const b = parseJsonObject(rawBody);
    const paymentId = parseUuid(b.payment_id);
    const wallet = normalizeWallet(b.wallet);
    const ref = typeof b.reference === "string" && b.reference.trim() ? b.reference.trim().slice(0, 64) : null;
    const rawStatus = String(b.status ?? "paid").toLowerCase();
    const isPaid = rawStatus === "paid" || rawStatus === "payment_completed" || rawStatus === "completed";
    return {
      provider: "generic",
      paymentId,
      wallet,
      reference: ref,
      status: isPaid ? "paid" : "ignored",
      rawStatus,
    };
  },
};

/**
 * PhaJay webhook adapter matching PhaJay's documented sandbox/production format
 * (see winner-agreement/PhaJay_Sandbox_Test.md):
 *   - Header `X-Signature`: Base64 HMAC-SHA256 of raw JSON body
 *   - Only `status === "PAYMENT_COMPLETED"` marks a payment paid
 *   - Phalom payment UUID carried in `tag1` (or `orderId` / `payment_id`)
 */
export const phajayWebhookAdapter: WebhookAdapter = {
  name: "phajay",
  async verifyAndParse(req, rawBody, env) {
    if (!env.PHAJAY_WEBHOOK_SECRET) throw new WebhookError(501, "phajay_webhook_not_configured");
    const valid = await verifyBase64HmacSha256(env.PHAJAY_WEBHOOK_SECRET, rawBody, req.headers.get("x-signature"));
    if (!valid) throw new WebhookError(401, "bad_signature");
    const b = parseJsonObject(rawBody);
    const rawStatus = String(b.status ?? "");
    const paymentId = parseUuid(b.tag1 ?? b.orderId ?? b.payment_id);
    const wallet = normalizeWallet(b.paymentMethod ?? b.wallet);
    const refRaw = b.refNo ?? b.transactionId;
    const reference = typeof refRaw === "string" && refRaw.trim() ? refRaw.trim().slice(0, 64) : null;
    return {
      provider: "phajay",
      paymentId,
      wallet,
      reference,
      status: rawStatus === "PAYMENT_COMPLETED" ? "paid" : "ignored",
      rawStatus,
    };
  },
};

function notConnectedAdapter(name: string): WebhookAdapter {
  return {
    name,
    async verifyAndParse() {
      throw new WebhookError(501, `${name}_partner_not_connected`);
    },
  };
}

const ADAPTERS: Record<PartnerCode, WebhookAdapter> = {
  payment: genericHmacAdapter,
  generic: genericHmacAdapter,
  phajay: phajayWebhookAdapter,
  // Placeholders ready for drop-in implementation once a partner signs in writing:
  bcel: notConnectedAdapter("bcel"),
  newpay: notConnectedAdapter("newpay"),
  loca: notConnectedAdapter("loca"),
};

export function resolveWebhookAdapter(provider: string | undefined): WebhookAdapter | null {
  if (!provider) return null;
  const key = provider.toLowerCase() as PartnerCode;
  return ADAPTERS[key] ?? null;
}
