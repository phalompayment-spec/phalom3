/**
 * Phalom API — Cloudflare Worker.
 *
 * Serves the merchant web app (static assets in /public) and a JSON API backed
 * by Supabase Postgres.
 *
 * Environment modes (APP_MODE):
 *   - "demo":       Enables the demo shop login (/api/auth/demo), simulated
 *                   payments (/api/payments/:id/simulate), and seeded demo shops.
 *   - "production": Default when APP_MODE is unset or "production". Disables all
 *                   demo endpoints and hides seeded demo shops; payments can only
 *                   be confirmed by a licensed partner through the signed webhook.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { recommend, shopStanding, vientianeMinute, WEIGHTS, MapShop } from "./recommend";
import { resolvePricingProfile } from "./pricing";
import { resolveWebhookAdapter, WebhookError } from "./payments";
import {
  SESSION_TTL_SECONDS,
  DEMO_SESSION_TTL_SECONDS,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_MINUTES,
  normalizePhone,
  isValidPin,
  hashPin,
  verifyPin,
  generateSessionToken,
  hashSessionToken,
  parseSessionToken,
  buildSessionCookie,
  clearSessionCookie,
} from "./auth";

export interface Env {
  ASSETS: Fetcher;
  AI?: Ai;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  APP_MODE?: string; // "demo" | "production" (defaults safely to "production")
  PRICING_PROFILE?: string; // "demo" | "v4_proposed" | "v4_card_fallback"
  SESSION_SECRET?: string; // optional pepper for hashing session tokens
  WEBHOOK_SECRET?: string; // HMAC-SHA256 secret for generic partner payment webhooks
  PHAJAY_WEBHOOK_SECRET?: string; // optional Base64 HMAC-SHA256 secret for PhaJay webhooks
  OPENROUTER_API_KEY?: string; // secret: voice alert (text-to-speech) through OpenRouter
  DEMO_MERCHANT_ID?: string;
  TOURIST_URL?: string; // the tourist app (phalom-tourist); payment QR codes open there
}

const DEMO_ID = "00000000-0000-4000-8000-000000000001";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WALLETS = ["alipay", "wechat", "unionpay", "promptpay", "vietqr", "kakaopay", "laoqr"] as const;
const CATEGORIES = ["souvenir", "food", "drinks", "silver", "coffee"] as const;
const BANKS = ["BCEL", "LDB", "APB", "JDB", "LVB", "BFL", "ST Bank"] as const;
const LANGS = ["zh", "th", "vi", "en"] as const;
const MAX_BODY_BYTES = 64 * 1024;
const DUMMY_SALT = "00112233445566778899aabbccddeeff";
export const TERMS_VERSION = "2026-11-22";

export const isDemoMode = (env: Env): boolean => env.APP_MODE === "demo";

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

const json = (data: unknown, status = 200, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });

function withSecurityHeaders(res: Response, reqId: string): Response {
  const headers = new Headers(res.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-frame-options", "SAMEORIGIN");
  headers.set("permissions-policy", "camera=(self), geolocation=(self), microphone=()");
  headers.set("x-request-id", reqId);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

function logEvent(level: "info" | "warn" | "error", event: string, fields: Record<string, unknown>) {
  const payload = JSON.stringify({ ts: new Date().toISOString(), level, event, ...fields });
  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.log(payload);
}

function db(env: Env): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new HttpError(500, "supabase_not_configured");
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function rpc<T = any>(env: Env, fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await db(env).rpc(fn, args);
  if (error) {
    const msg = error.message || "database_error";
    if (/phone_already_registered|duplicate key/.test(msg)) throw new HttpError(409, "phone_already_registered");
    if (/not_found/.test(msg)) throw new HttpError(404, msg);
    if (/required|violates check|invalid input/.test(msg)) throw new HttpError(400, msg);
    throw new HttpError(502, msg);
  }
  return data as T;
}

async function rawText(req: Request): Promise<string> {
  const lenHeader = req.headers.get("content-length");
  if (lenHeader && Number(lenHeader) > MAX_BODY_BYTES) throw new HttpError(413, "payload_too_large");
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, "payload_too_large");
  return text;
}

async function body<T = any>(req: Request): Promise<T> {
  const text = await rawText(req);
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not_object");
    return parsed as T;
  } catch {
    throw new HttpError(400, "invalid_json");
  }
}

function id(v: string | undefined, what = "id"): string {
  if (!v || !UUID.test(v)) throw new HttpError(400, `invalid_${what}`);
  return v.toLowerCase();
}

function kip(v: unknown): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n) || n < 1000 || n > 100_000_000) throw new HttpError(400, "amount_must_be_1000_to_100000000_kip");
  return n;
}

function sanitizeMerchant<T extends Record<string, unknown> | null>(m: T): T {
  if (!m) return m;
  const copy = { ...m };
  delete copy.pin_hash;
  delete copy.pin_salt;
  return copy as T;
}

// ---- Session management -----------------------------------------------------
interface MerchantSession {
  session_id: string;
  merchant_id: string;
  is_demo_session: boolean;
  merchant_is_demo: boolean;
  expires_at: string;
}

interface AuthContext {
  tokenHash: string;
  session: MerchantSession;
}

async function loadSession(req: Request, env: Env): Promise<AuthContext | null> {
  const token = parseSessionToken(req);
  if (!token) return null;
  const tokenHash = await hashSessionToken(token, env.SESSION_SECRET);
  const session = await rpc<MerchantSession | null>(env, "get_merchant_session", { p_token_hash: tokenHash });
  if (!session || !session.merchant_id) return null;
  return { tokenHash, session };
}

async function requireAuth(req: Request, env: Env): Promise<AuthContext> {
  const auth = await loadSession(req, env);
  if (!auth) throw new HttpError(401, "auth_required");
  if (!isDemoMode(env) && (auth.session.is_demo_session || auth.session.merchant_is_demo)) {
    throw new HttpError(403, "demo_disabled");
  }
  return auth;
}

async function requireMerchant(req: Request, env: Env, targetMid: string): Promise<AuthContext> {
  const auth = await requireAuth(req, env);
  if (auth.session.merchant_id.toLowerCase() !== targetMid.toLowerCase()) {
    throw new HttpError(403, "forbidden");
  }
  return auth;
}

async function issueSession(env: Env, merchantId: string, ttlSeconds: number, isDemoSession: boolean) {
  const token = generateSessionToken();
  const tokenHash = await hashSessionToken(token, env.SESSION_SECRET);
  const created = await rpc<{ session_id: string; merchant_id: string; expires_at: string }>(
    env,
    "create_merchant_session",
    { p_merchant: merchantId, p_token_hash: tokenHash, p_ttl_seconds: ttlSeconds, p_is_demo: isDemoSession },
  );
  return { token, tokenHash, expires_at: created.expires_at };
}

// ---- Auto-translation with Workers AI (m2m100 covers Lao) -------------------
async function translate(env: Env, textLo: string): Promise<{ names: Record<string, string>; by: string }> {
  if (!env.AI) return { names: {}, by: "manual" };
  try {
    const results = await Promise.all(
      LANGS.map(async (lang) => {
        const r: any = await env.AI!.run("@cf/meta/m2m100-1.2b" as any, { text: textLo, source_lang: "lo", target_lang: lang } as any);
        return [lang, String(r?.translated_text ?? "").trim()] as const;
      }),
    );
    const names = Object.fromEntries(results.filter(([, t]) => t));
    return { names, by: Object.keys(names).length ? "workers-ai" : "manual" };
  } catch {
    return { names: {}, by: "manual" };
  }
}

const touristUrl = (env: Env, url: URL) => (env.TOURIST_URL || url.origin).replace(/\/+$/, "");

// ---- Voice alert: ElevenLabs Eleven v4 Turbo through OpenRouter -------------
const VOICE_MODEL = "elevenlabs/eleven-v4-turbo";
const VOICE_NAME = "sarah";

async function voiceAlert(env: Env, ctx: ExecutionContext, amount: number): Promise<Response> {
  if (!env.OPENROUTER_API_KEY) throw new HttpError(503, "voice_not_configured");
  const text = `ໄດ້ຮັບເງິນ ${amount.toLocaleString("en-US")} ກີບ`;
  const cacheKey = new Request(`https://voice.phalom.internal/${VOICE_MODEL}/${VOICE_NAME}/${amount}`);
  const cache = (caches as any).default as Cache;
  const hit = await cache.match(cacheKey);
  if (hit) return hit;
  const r = await fetch("https://openrouter.ai/api/v1/audio/speech", {
    method: "POST",
    headers: { authorization: `Bearer ${env.OPENROUTER_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model: VOICE_MODEL, input: text, voice: VOICE_NAME, response_format: "mp3" }),
  });
  if (!r.ok) {
    logEvent("error", "voice_failed", { upstream_status: r.status });
    throw new HttpError(502, r.status === 402 ? "voice_no_credit" : "voice_failed");
  }
  const audio = await r.arrayBuffer();
  const res = new Response(audio, { headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=2592000" } });
  ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

// ---- Router -----------------------------------------------------------------
async function api(req: Request, env: Env, ctx: ExecutionContext, url: URL, reqId: string): Promise<Response> {
  const p = url.pathname.replace(/\/+$/, "").split("/").slice(2); // after /api
  const m = req.method;
  const demo = isDemoMode(env);
  const demoId = env.DEMO_MERCHANT_ID || DEMO_ID;
  const isHttps = url.protocol === "https:";

  if (m === "GET" && p[0] === "health") {
    const shops = await rpc<any[]>(env, "list_shops", { p_include_demo: demo });
    return json({
      ok: true,
      mode: demo ? "demo" : "production",
      database: "supabase",
      shops: shops.length,
      ai: !!env.AI,
      voice: !!env.OPENROUTER_API_KEY,
      time: new Date().toISOString(),
    });
  }

  if (m === "GET" && p[0] === "config") {
    return json({
      mode: demo ? "demo" : "production",
      demoEnabled: demo,
      demoMerchantId: demo ? demoId : null,
      wallets: WALLETS,
      currency: "LAK",
      pricing: resolvePricingProfile(env.PRICING_PROFILE, demo),
      touristUrl: touristUrl(env, url),
      termsVersion: TERMS_VERSION,
    });
  }

  // ---- Authentication routes ------------------------------------------------
  if (p[0] === "auth") {
    if (m === "GET" && p[1] === "me" && p.length === 2) {
      const auth = await requireAuth(req, env);
      const merchant = sanitizeMerchant(await rpc<any>(env, "get_merchant", { p_id: auth.session.merchant_id }));
      if (!merchant) throw new HttpError(404, "merchant_not_found");
      return json({
        authenticated: true,
        merchant,
        is_demo: auth.session.is_demo_session || !!merchant.is_demo,
        expires_at: auth.session.expires_at,
      });
    }

    if (m === "POST" && p[1] === "login" && p.length === 2) {
      const b = await body(req);
      const phoneNorm = normalizePhone(b.phone);
      const pin = String(b.pin ?? "");
      if (!phoneNorm || !isValidPin(pin)) throw new HttpError(400, "invalid_phone_or_pin");

      const rec = await rpc<{
        merchant_id: string;
        is_demo: boolean;
        pin_hash: string;
        pin_salt: string;
        failed_attempts: number;
        locked_until: string | null;
      } | null>(env, "get_merchant_auth_by_phone", { p_phone_normalized: phoneNorm });

      if (!rec) {
        // Equalize timing so phone enumeration is harder.
        await hashPin("000000", DUMMY_SALT);
        throw new HttpError(401, "invalid_credentials");
      }
      if (!demo && rec.is_demo) throw new HttpError(403, "demo_disabled");

      if (rec.locked_until) {
        const retryAfter = Math.ceil((new Date(rec.locked_until).getTime() - Date.now()) / 1000);
        if (retryAfter > 0) {
          throw new HttpError(429, "account_locked", { retry_after: retryAfter });
        }
      }

      const ok = await verifyPin(pin, rec.pin_hash, rec.pin_salt);
      if (!ok) {
        const fail = await rpc<{ failed_attempts: number; locked_until: string | null }>(env, "record_login_failure", {
          p_merchant: rec.merchant_id,
          p_max_attempts: MAX_LOGIN_ATTEMPTS,
          p_lock_minutes: LOCKOUT_MINUTES,
        });
        if (fail.locked_until) {
          const retryAfter = Math.max(1, Math.ceil((new Date(fail.locked_until).getTime() - Date.now()) / 1000));
          logEvent("warn", "merchant_login_locked", { reqId, merchant_id: rec.merchant_id, attempts: fail.failed_attempts });
          throw new HttpError(429, "account_locked", { retry_after: retryAfter });
        }
        throw new HttpError(401, "invalid_credentials", {
          attempts_remaining: Math.max(0, MAX_LOGIN_ATTEMPTS - fail.failed_attempts),
        });
      }

      await rpc(env, "reset_login_failures", { p_merchant: rec.merchant_id });
      const sess = await issueSession(env, rec.merchant_id, SESSION_TTL_SECONDS, false);
      const merchant = sanitizeMerchant(await rpc<any>(env, "get_merchant", { p_id: rec.merchant_id }));
      return json(
        { merchant, token: sess.token, expires_at: sess.expires_at },
        200,
        { "set-cookie": buildSessionCookie(sess.token, SESSION_TTL_SECONDS, isHttps) },
      );
    }

    if (m === "POST" && p[1] === "demo" && p.length === 2) {
      if (!demo) throw new HttpError(403, "demo_disabled");
      const merchant = sanitizeMerchant(await rpc<any>(env, "get_merchant", { p_id: demoId }));
      if (!merchant) throw new HttpError(404, "demo_merchant_not_found");
      const sess = await issueSession(env, demoId, DEMO_SESSION_TTL_SECONDS, true);
      return json(
        { merchant, token: sess.token, expires_at: sess.expires_at, is_demo: true },
        200,
        { "set-cookie": buildSessionCookie(sess.token, DEMO_SESSION_TTL_SECONDS, isHttps) },
      );
    }

    if (m === "POST" && p[1] === "logout" && p.length === 2) {
      const token = parseSessionToken(req);
      if (token) {
        const tokenHash = await hashSessionToken(token, env.SESSION_SECRET);
        await rpc(env, "revoke_merchant_session", { p_token_hash: tokenHash }).catch(() => {});
      }
      return json({ ok: true }, 200, { "set-cookie": clearSessionCookie(isHttps) });
    }

    if (m === "POST" && p[1] === "change-pin" && p.length === 2) {
      const auth = await requireAuth(req, env);
      if (auth.session.is_demo_session || auth.session.merchant_is_demo) {
        throw new HttpError(403, "demo_pin_locked");
      }
      const b = await body(req);
      const currentPin = String(b.current_pin ?? "");
      const newPin = String(b.new_pin ?? "");
      if (!isValidPin(currentPin) || !isValidPin(newPin)) throw new HttpError(400, "pin_must_be_6_digits");
      if (currentPin === newPin) throw new HttpError(400, "new_pin_must_differ");

      const rec = await rpc<{ pin_hash: string; pin_salt: string; locked_until: string | null } | null>(
        env,
        "get_merchant_auth_by_id",
        { p_merchant: auth.session.merchant_id },
      );
      if (!rec) throw new HttpError(404, "merchant_not_found");
      if (rec.locked_until) {
        const retryAfter = Math.ceil((new Date(rec.locked_until).getTime() - Date.now()) / 1000);
        if (retryAfter > 0) throw new HttpError(429, "account_locked", { retry_after: retryAfter });
      }
      const ok = await verifyPin(currentPin, rec.pin_hash, rec.pin_salt);
      if (!ok) {
        const fail = await rpc<{ failed_attempts: number; locked_until: string | null }>(env, "record_login_failure", {
          p_merchant: auth.session.merchant_id,
          p_max_attempts: MAX_LOGIN_ATTEMPTS,
          p_lock_minutes: LOCKOUT_MINUTES,
        });
        if (fail.locked_until) {
          const retryAfter = Math.max(1, Math.ceil((new Date(fail.locked_until).getTime() - Date.now()) / 1000));
          throw new HttpError(429, "account_locked", { retry_after: retryAfter });
        }
        throw new HttpError(401, "invalid_credentials");
      }

      const next = await hashPin(newPin);
      await rpc(env, "update_merchant_pin", {
        p_merchant: auth.session.merchant_id,
        p_pin_hash: next.hash,
        p_pin_salt: next.salt,
        p_keep_token_hash: auth.tokenHash,
      });
      return json({ ok: true });
    }
  }

  // ---- Public tourist-facing shop & map endpoints ---------------------------
  if (m === "GET" && p[0] === "shops" && p.length === 1) {
    return json(await rpc(env, "list_shops", { p_include_demo: demo }));
  }

  if (m === "GET" && p[0] === "shops" && p.length === 2) {
    // Public shop page for tourists: no phone or bank details.
    const sid = id(p[1], "shop");
    const shop: any = await rpc(env, "get_merchant", { p_id: sid });
    if (!shop || (!demo && shop.is_demo)) throw new HttpError(404, "shop_not_found");
    const { id: sId, name_lo, names, category, market, rating, lat, lng, open_from, open_to } = shop;
    return json({ id: sId, name_lo, names, category, market, rating, lat, lng, open_from, open_to, menu: await rpc(env, "list_menu", { p_merchant: sid }) });
  }

  if (m === "GET" && p[0] === "map") {
    const shops = await rpc<MapShop[]>(env, "map_shops", { p_include_demo: demo });
    if (p[1] === "recommend") {
      const lat = Number(url.searchParams.get("lat"));
      const lng = Number(url.searchParams.get("lng"));
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        throw new HttpError(400, "lat_lng_required");
      }
      const nat = (url.searchParams.get("nat") || "other").slice(0, 8);
      const cat = url.searchParams.get("cat") || undefined;
      const minute = vientianeMinute();
      const limit = Math.min(30, Math.max(1, Number(url.searchParams.get("limit")) || 12));
      return json({ minute, weights: WEIGHTS, shops: recommend(shops, { lat, lng, nat, cat, minute, limit }) });
    }
    return json(shops);
  }

  // ---- Merchants (registration + strictly authenticated owner routes) -------
  if (p[0] === "merchants") {
    if (m === "POST" && p.length === 1) {
      const b = await body(req);
      const name = String(b.name_lo ?? "").trim().slice(0, 80);
      if (!name) throw new HttpError(400, "name_required");
      const category = String(b.category ?? "souvenir").trim();
      if (!(CATEGORIES as readonly string[]).includes(category)) throw new HttpError(400, "invalid_category");
      const bank = String(b.bank ?? "BCEL").trim();
      if (!(BANKS as readonly string[]).includes(bank)) throw new HttpError(400, "invalid_bank");
      const last4 = String(b.account_last4 ?? "").replace(/\D/g, "");
      if (!/^\d{4}$/.test(last4)) throw new HttpError(400, "invalid_account_last4");
      const phoneRaw = String(b.phone ?? "").trim().slice(0, 24);
      const phoneNorm = normalizePhone(phoneRaw);
      if (!phoneNorm) throw new HttpError(400, "invalid_phone");
      const pin = String(b.pin ?? "");
      if (!isValidPin(pin)) throw new HttpError(400, "pin_must_be_6_digits");
      if (b.accepted_terms !== true) throw new HttpError(400, "terms_required");

      const [{ hash, salt }, t] = await Promise.all([hashPin(pin), translate(env, name)]);
      const merchant = sanitizeMerchant(
        await rpc<any>(env, "register_merchant_with_auth", {
          p_name_lo: name,
          p_category: category,
          p_market: String(b.market ?? "ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ").trim().slice(0, 80) || "ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ",
          p_phone: phoneRaw,
          p_phone_normalized: phoneNorm,
          p_bank: bank,
          p_account_last4: last4,
          p_names: t.names,
          p_pin_hash: hash,
          p_pin_salt: salt,
          p_terms_version: TERMS_VERSION,
        }),
      );
      const sess = await issueSession(env, merchant.id, SESSION_TTL_SECONDS, false);
      return json(
        { ...merchant, merchant, token: sess.token, expires_at: sess.expires_at },
        201,
        { "set-cookie": buildSessionCookie(sess.token, SESSION_TTL_SECONDS, isHttps) },
      );
    }

    const mid = id(p[1], "merchant");
    await requireMerchant(req, env, mid);

    if (m === "GET" && p.length === 2) {
      const merchant = sanitizeMerchant(await rpc<any>(env, "get_merchant", { p_id: mid }));
      if (!merchant) throw new HttpError(404, "merchant_not_found");
      return json(merchant);
    }
    if (m === "GET" && p[2] === "dashboard") {
      if (demo && mid === demoId) await rpc(env, "ensure_demo_sales");
      return json(await rpc(env, "merchant_dashboard", { p_merchant: mid }));
    }
    if (m === "PUT" && p[2] === "location") {
      const b = await body(req);
      const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
      return json(
        await rpc(env, "set_merchant_location", {
          p_merchant: mid,
          p_lat: num(b.lat),
          p_lng: num(b.lng),
          p_open_from: num(b.open_from),
          p_open_to: num(b.open_to),
        }),
      );
    }
    if (m === "GET" && p[2] === "map") {
      const shops = await rpc<MapShop[]>(env, "map_shops", { p_include_demo: demo });
      const me = shops.find((s) => s.id === mid) || null;
      return json({ shop: me, standing: me ? shopStanding(shops, mid, vientianeMinute()) : null });
    }
    if (m === "GET" && p[2] === "history") {
      if (demo && mid === demoId) {
        await rpc(env, "ensure_demo_sales");
        await rpc(env, "ensure_demo_week");
      }
      const days = Math.min(31, Math.max(1, Number(url.searchParams.get("days")) || 7));
      return json(await rpc(env, "merchant_history", { p_merchant: mid, p_days: days }));
    }
    if (p[2] === "menu") {
      if (m === "GET") return json(await rpc(env, "list_menu", { p_merchant: mid }));
      if (m === "POST") {
        const b = await body(req);
        const name = String(b.name_lo ?? "").trim().slice(0, 80);
        if (!name) throw new HttpError(400, "name_required");
        const price = kip(b.price_kip);
        const t = await translate(env, name);
        const colors = ["#7A2E3B", "#1F2B6B", "#2E4DB8", "#1E7A5A", "#6B4226", "#B5372F"];
        return json(
          await rpc(env, "add_menu_item", {
            p_merchant: mid,
            p_name_lo: name,
            p_price: price,
            p_names: t.names,
            p_translated_by: t.by,
            p_color: colors[Math.floor(Math.random() * colors.length)],
          }),
          201,
        );
      }
      if (m === "DELETE" && p[3]) {
        return json(await rpc(env, "delete_menu_item", { p_merchant: mid, p_item: id(p[3], "item") }));
      }
    }
  }

  // ---- Payments -------------------------------------------------------------
  if (p[0] === "payments") {
    if (m === "POST" && p.length === 1) {
      const b = await body(req);
      const mid = id(b.merchant_id, "merchant");
      const amount = kip(b.amount_kip);
      if (!demo) {
        const target: any = await rpc(env, "get_merchant", { p_id: mid });
        if (!target || target.is_demo) throw new HttpError(404, "merchant_not_found");
      }
      const payment: any = await rpc(env, "create_payment", { p_merchant: mid, p_amount: amount });
      return json({ ...payment, pay_url: `${touristUrl(env, url)}/pay/${payment.id}` }, 201);
    }

    const pid = id(p[1], "payment");
    if (m === "GET" && p.length === 2) {
      const payment: any = await rpc(env, "get_payment", { p_id: pid });
      if (!payment || (!demo && payment.merchant?.is_demo)) throw new HttpError(404, "payment_not_found");
      // Never leak bank details on public payment lookup.
      if (payment.merchant) {
        delete payment.merchant.bank;
        delete payment.merchant.account_last4;
      }
      return json(payment);
    }

    if (m === "GET" && p[2] === "voice") {
      // Spoken "money received" alert: authenticated shop owner only, paid payments only.
      const auth = await requireAuth(req, env);
      const payment: any = await rpc(env, "get_payment", { p_id: pid });
      if (!payment) throw new HttpError(404, "payment_not_found");
      if (payment.merchant_id.toLowerCase() !== auth.session.merchant_id.toLowerCase()) {
        throw new HttpError(403, "forbidden");
      }
      if (payment.status !== "paid") throw new HttpError(409, "payment_not_paid");
      return await voiceAlert(env, ctx, kip(payment.amount_kip));
    }

    if (m === "POST" && p[2] === "simulate") {
      if (!demo) throw new HttpError(403, "demo_disabled");
      const b = await body(req);
      const wallet = String(b.wallet ?? "");
      if (!(WALLETS as readonly string[]).includes(wallet)) throw new HttpError(400, "unknown_wallet");
      return json(await rpc(env, "simulate_pay", { p_id: pid, p_wallet: wallet, p_from_map: !!b.from_map }));
    }
  }

  // ---- Partner webhooks (licensed bank / gateway confirmation) --------------
  if (m === "POST" && p[0] === "webhooks" && p.length === 2) {
    const adapter = resolveWebhookAdapter(p[1]);
    if (!adapter) throw new HttpError(404, "unknown_webhook_provider");
    const raw = await rawText(req);
    try {
      const event = await adapter.verifyAndParse(req, raw, env);
      if (event.status === "ignored") {
        return json({ ok: true, ignored: true, provider: event.provider, raw_status: event.rawStatus });
      }
      return json(
        await rpc(env, "confirm_partner_payment", {
          p_id: event.paymentId,
          p_wallet: event.wallet,
          p_reference: event.reference,
        }),
      );
    } catch (e) {
      if (e instanceof WebhookError) {
        if (e.status === 401) logEvent("warn", "webhook_bad_signature", { reqId, provider: adapter.name });
        throw new HttpError(e.status, e.message);
      }
      throw e;
    }
  }

  throw new HttpError(404, "not_found");
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const reqId = crypto.randomUUID();
    try {
      if (url.pathname.startsWith("/api/")) {
        return withSecurityHeaders(await api(req, env, ctx, url, reqId), reqId);
      }
      if (url.pathname === "/terms" || url.pathname === "/privacy") {
        return withSecurityHeaders(Response.redirect(`${url.origin}/#${url.pathname}`, 302), reqId);
      }
      if (url.pathname.startsWith("/pay/") || url.pathname.startsWith("/shop/")) {
        // Payment and shop QR codes belong to the tourist app.
        if (env.TOURIST_URL) return withSecurityHeaders(Response.redirect(touristUrl(env, url) + url.pathname, 302), reqId);
        throw new HttpError(404, "tourist_app_not_configured");
      }
      return withSecurityHeaders(await env.ASSETS.fetch(req), reqId);
    } catch (e: any) {
      const status = e instanceof HttpError ? e.status : 500;
      const code = e instanceof HttpError ? e.message : "server_error";
      const details = e instanceof HttpError ? e.details : undefined;
      if (status >= 500) {
        logEvent("error", "unhandled_error", { reqId, method: req.method, path: url.pathname, status, code, message: String(e?.message || e) });
      }
      return withSecurityHeaders(json({ error: code, ...(details || {}), request_id: reqId }, status), reqId);
    }
  },
} satisfies ExportedHandler<Env>;
