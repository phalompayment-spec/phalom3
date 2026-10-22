/**
 * Phalom API — Cloudflare Worker.
 *
 * Serves the merchant web app (static assets in /public) and a JSON API backed
 * by Supabase Postgres. Payments are simulated for the demo: the tourist
 * checkout page marks a payment request as paid. In production that update
 * comes from the licensed payment partner, PhaJay, through the
 * signed webhook below; Phalom never holds funds.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { recommend, shopStanding, vientianeMinute, WEIGHTS, MapShop } from "./recommend";

export interface Env {
  ASSETS: Fetcher;
  AI?: Ai;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  WEBHOOK_SECRET?: string;
  OPENROUTER_API_KEY?: string; // secret: voice alert (text-to-speech) through OpenRouter
  DEMO_MERCHANT_ID?: string;
  TOURIST_URL?: string; // the tourist app (phalom-tourist); payment QR codes open there
}

const DEMO_ID = "00000000-0000-4000-8000-000000000001";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WALLETS = ["alipay", "wechat", "unionpay", "promptpay", "vietqr", "kakaopay", "laoqr"] as const;
const LANGS = ["zh", "th", "vi", "en"] as const;

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const json = (data: unknown, status = 200, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });

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
    if (/not_found/.test(msg)) throw new HttpError(404, msg);
    if (/required|violates check|invalid input/.test(msg)) throw new HttpError(400, msg);
    throw new HttpError(502, msg);
  }
  return data as T;
}

async function body<T = any>(req: Request): Promise<T> {
  try { return (await req.json()) as T; } catch { throw new HttpError(400, "invalid_json"); }
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

// Amounts are Lao kip only. Phalom never shows or stores another currency: the
// tourist's own wallet (Alipay, WeChat Pay, PromptPay, VietQR) handles any exchange.

// ---- Auto-translation with Workers AI (m2m100 covers Lao) -----------------
async function translate(env: Env, textLo: string): Promise<{ names: Record<string, string>; by: string }> {
  if (!env.AI) return { names: {}, by: "manual" };
  try {
    const results = await Promise.all(LANGS.map(async (lang) => {
      const r: any = await env.AI!.run("@cf/meta/m2m100-1.2b" as any, { text: textLo, source_lang: "lo", target_lang: lang } as any);
      return [lang, String(r?.translated_text ?? "").trim()] as const;
    }));
    const names = Object.fromEntries(results.filter(([, t]) => t));
    return { names, by: Object.keys(names).length ? "workers-ai" : "manual" };
  } catch {
    return { names: {}, by: "manual" };
  }
}

// ---- Webhook signature (production path for partner notifications) -------
async function verifySignature(secret: string, raw: string, sigHex: string | null) {
  if (!sigHex) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const sig = new Uint8Array((sigHex.match(/.{2}/g) ?? []).map((h) => parseInt(h, 16)));
  return crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(raw));
}

const touristUrl = (env: Env, url: URL) => (env.TOURIST_URL || url.origin).replace(/\/+$/, "");

// ---- Voice alert: ElevenLabs Eleven v4 Turbo through OpenRouter ------------
// Called only from here, so the key stays a Worker secret. The browser falls back to the
// phone's own voice whenever this answers with an error (no key, no credit, provider down).
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
    console.error("voice_failed", r.status, (await r.text()).slice(0, 200));
    throw new HttpError(502, r.status === 402 ? "voice_no_credit" : "voice_failed");
  }
  const audio = await r.arrayBuffer();
  const res = new Response(audio, { headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=2592000" } });
  ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

// ---- Router ------------------------------------------------------------------
async function api(req: Request, env: Env, ctx: ExecutionContext, url: URL): Promise<Response> {
  const p = url.pathname.replace(/\/+$/, "").split("/").slice(2); // after /api
  const m = req.method;
  const demoId = env.DEMO_MERCHANT_ID || DEMO_ID;

  if (m === "GET" && p[0] === "health") {
    const shops = await rpc<any[]>(env, "list_shops");
    return json({ ok: true, database: "supabase", shops: shops.length, ai: !!env.AI, voice: !!env.OPENROUTER_API_KEY, time: new Date().toISOString() });
  }
  if (m === "GET" && p[0] === "config") return json({ demoMerchantId: demoId, wallets: WALLETS, currency: "LAK", touristUrl: touristUrl(env, url) });
  if (m === "GET" && p[0] === "shops" && p.length === 1) return json(await rpc(env, "list_shops"));
  if (m === "GET" && p[0] === "shops" && p.length === 2) {
    // Public shop page for tourists: no phone or bank details.
    const sid = id(p[1], "shop");
    const shop: any = await rpc(env, "get_merchant", { p_id: sid });
    if (!shop) throw new HttpError(404, "shop_not_found");
    const { id: sId, name_lo, names, category, market, rating, lat, lng, open_from, open_to } = shop;
    return json({ id: sId, name_lo, names, category, market, rating, lat, lng, open_from, open_to, menu: await rpc(env, "list_menu", { p_merchant: sid }) });
  }

  // Map: shops with locations, and recommendations ranked here at the edge.
  if (m === "GET" && p[0] === "map") {
    const shops = await rpc<MapShop[]>(env, "map_shops");
    if (p[1] === "recommend") {
      const lat = Number(url.searchParams.get("lat")), lng = Number(url.searchParams.get("lng"));
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new HttpError(400, "lat_lng_required");
      const nat = (url.searchParams.get("nat") || "other").slice(0, 8);
      const cat = url.searchParams.get("cat") || undefined;
      const minute = vientianeMinute();
      const limit = Math.min(30, Math.max(1, Number(url.searchParams.get("limit")) || 12));
      return json({ minute, weights: WEIGHTS, shops: recommend(shops, { lat, lng, nat, cat, minute, limit }) });
    }
    return json(shops);
  }

  // Merchants
  if (p[0] === "merchants") {
    if (m === "POST" && p.length === 1) {
      const b = await body(req);
      const name = String(b.name_lo ?? "").trim().slice(0, 80);
      if (!name) throw new HttpError(400, "name_required");
      const t = await translate(env, name);
      const merchant = await rpc(env, "register_merchant", {
        p_name_lo: name, p_category: String(b.category ?? "souvenir").slice(0, 20), p_market: String(b.market ?? "ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ").slice(0, 80),
        p_phone: b.phone ? String(b.phone).slice(0, 20) : null, p_bank: String(b.bank ?? "BCEL").slice(0, 20),
        p_account_last4: String(b.account_last4 ?? "0000").replace(/\D/g, "").slice(-4) || "0000", p_names: t.names,
      });
      return json(merchant, 201);
    }
    const mid = id(p[1], "merchant");
    if (m === "GET" && p.length === 2) {
      const merchant = await rpc(env, "get_merchant", { p_id: mid });
      if (!merchant) throw new HttpError(404, "merchant_not_found");
      return json(merchant);
    }
    if (m === "GET" && p[2] === "dashboard") {
      if (mid === demoId) await rpc(env, "ensure_demo_sales");
      return json(await rpc(env, "merchant_dashboard", { p_merchant: mid }));
    }
    if (m === "PUT" && p[2] === "location") {
      const b = await body(req);
      const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
      return json(await rpc(env, "set_merchant_location", {
        p_merchant: mid, p_lat: num(b.lat), p_lng: num(b.lng), p_open_from: num(b.open_from), p_open_to: num(b.open_to),
      }));
    }
    if (m === "GET" && p[2] === "map") {
      const shops = await rpc<MapShop[]>(env, "map_shops");
      const me = shops.find((s) => s.id === mid) || null;
      return json({ shop: me, standing: me ? shopStanding(shops, mid, vientianeMinute()) : null });
    }
    if (m === "GET" && p[2] === "history") {
      if (mid === demoId) { await rpc(env, "ensure_demo_sales"); await rpc(env, "ensure_demo_week"); }
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
        return json(await rpc(env, "add_menu_item", {
          p_merchant: mid, p_name_lo: name, p_price: price, p_names: t.names, p_translated_by: t.by,
          p_color: colors[Math.floor(Math.random() * colors.length)],
        }), 201);
      }
      if (m === "DELETE" && p[3]) return json(await rpc(env, "delete_menu_item", { p_merchant: mid, p_item: id(p[3], "item") }));
    }
  }

  // Payments
  if (p[0] === "payments") {
    if (m === "POST" && p.length === 1) {
      const b = await body(req);
      const mid = id(b.merchant_id, "merchant");
      const amount = kip(b.amount_kip);
      const payment: any = await rpc(env, "create_payment", { p_merchant: mid, p_amount: amount });
      return json({ ...payment, pay_url: `${touristUrl(env, url)}/pay/${payment.id}` }, 201);
    }
    const pid = id(p[1], "payment");
    if (m === "GET" && p.length === 2) {
      const payment = await rpc(env, "get_payment", { p_id: pid });
      if (!payment) throw new HttpError(404, "payment_not_found");
      return json(payment);
    }
    if (m === "GET" && p[2] === "voice") {
      // Spoken "money received" alert. Only for payments that are really paid, so the endpoint cannot be used to burn credit.
      const payment: any = await rpc(env, "get_payment", { p_id: pid });
      if (!payment) throw new HttpError(404, "payment_not_found");
      if (payment.status !== "paid") throw new HttpError(409, "payment_not_paid");
      return await voiceAlert(env, ctx, kip(payment.amount_kip));
    }
    if (m === "POST" && p[2] === "simulate") {
      const b = await body(req);
      const wallet = String(b.wallet ?? "");
      if (!(WALLETS as readonly string[]).includes(wallet)) throw new HttpError(400, "unknown_wallet");
      return json(await rpc(env, "simulate_pay", { p_id: pid, p_wallet: wallet, p_from_map: !!b.from_map }));
    }
  }

  // Partner notification (how a real bank / PhaJay confirmation would arrive)
  if (m === "POST" && p[0] === "webhooks" && p[1] === "payment") {
    if (!env.WEBHOOK_SECRET) throw new HttpError(501, "webhook_not_configured");
    const raw = await req.text();
    if (!(await verifySignature(env.WEBHOOK_SECRET, raw, req.headers.get("x-phalom-signature")))) throw new HttpError(401, "bad_signature");
    const b = JSON.parse(raw);
    const wallet = (WALLETS as readonly string[]).includes(b.wallet) ? b.wallet : "laoqr";
    return json(await rpc(env, "simulate_pay", { p_id: id(b.payment_id, "payment"), p_wallet: wallet, p_from_map: false }));
  }

  throw new HttpError(404, "not_found");
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    try {
      if (url.pathname.startsWith("/api/")) return await api(req, env, ctx, url);
      if (url.pathname.startsWith("/pay/") || url.pathname.startsWith("/shop/")) {
        // Payment and shop QR codes belong to the tourist app.
        if (env.TOURIST_URL) return Response.redirect(touristUrl(env, url) + url.pathname, 302);
        throw new HttpError(404, "tourist_app_not_configured");
      }
      return env.ASSETS.fetch(req);
    } catch (e: any) {
      const status = e instanceof HttpError ? e.status : 500;
      if (status >= 500) console.error(e?.stack || e);
      return json({ error: e?.message || "server_error" }, status);
    }
  },
} satisfies ExportedHandler<Env>;
