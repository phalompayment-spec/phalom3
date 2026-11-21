/**
 * Automated production-hardening test suite for Phalom Worker + Auth + Frontend JS.
 * Runs locally with zero cloud credentials using esbuild + a local Supabase RPC mock.
 */
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DEMO_ID = "00000000-0000-4000-8000-000000000001";

// ---- Bundle src/worker.ts exactly as Wrangler bundles it --------------------
const outFile = path.join(os.tmpdir(), `phalom-worker-test-${process.pid}.mjs`);
await esbuild.build({
  entryPoints: [path.join(ROOT, "src/worker.ts")],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  outfile: outFile,
  conditions: ["workerd", "worker", "browser"],
});
const workerMod = await import(pathToFileURL(outFile).href);
const worker = workerMod.default;
test.after(() => fs.rmSync(outFile, { force: true }));

// ---- Faithful in-memory Supabase RPC simulator ------------------------------
function createMockSupabase() {
  const merchants = new Map();
  const authRows = new Map();
  const sessions = new Map(); // token_hash -> session
  const menus = new Map(); // item_id -> item
  const payments = new Map();

  // Seed demo shop (0001) + example neighbor (0002), both marked is_demo = true as in 0007
  merchants.set(DEMO_ID, {
    id: DEMO_ID,
    name_lo: "ຮ້ານຜ້າທໍແມ່ຄຳ",
    names: { en: "Mae Kham Textiles", zh: "坎妈妈织布店" },
    category: "souvenir",
    market: "ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ",
    phone: null,
    phone_normalized: null,
    bank: "BCEL",
    account_last4: "4821",
    rating: 4.8,
    lat: 19.8887,
    lng: 102.1353,
    open_from: 1020,
    open_to: 1380,
    is_demo: true,
    created_at: new Date().toISOString(),
  });
  merchants.set("00000000-0000-4000-8000-000000000002", {
    id: "00000000-0000-4000-8000-000000000002",
    name_lo: "ເຂົ້າຈີ່ປາເຕ ແມ່ນ້ອຍ",
    names: { en: "Mae Noy Baguettes" },
    category: "food",
    market: "ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ",
    phone: null,
    phone_normalized: null,
    bank: "JDB",
    account_last4: "1190",
    rating: 4.6,
    lat: 19.8882,
    lng: 102.1347,
    open_from: 420,
    open_to: 1350,
    is_demo: true,
    created_at: new Date().toISOString(),
  });

  const walletNat = (w) =>
    ({ alipay: "cn", wechat: "cn", unionpay: "cn", promptpay: "th", vietqr: "vn", kakaopay: "kr", laoqr: "la" })[w] || "other";

  const handlers = {
    list_shops({ p_include_demo = false }) {
      return [...merchants.values()]
        .filter((m) => p_include_demo || !m.is_demo)
        .map((m) => ({
          id: m.id, name_lo: m.name_lo, names: m.names, category: m.category, market: m.market,
          rating: m.rating, paid_today: 0,
        }));
    },
    map_shops({ p_include_demo = false }) {
      return [...merchants.values()]
        .filter((m) => m.lat != null && m.lng != null && (p_include_demo || !m.is_demo))
        .map((m) => ({
          id: m.id, name_lo: m.name_lo, names: m.names, category: m.category, market: m.market,
          rating: m.rating, lat: m.lat, lng: m.lng, open_from: m.open_from, open_to: m.open_to,
          min_price: null, paid_total: 0, paid_today: 0, by_nat: {},
        }));
    },
    get_merchant({ p_id }) {
      return merchants.get(p_id) || null;
    },
    register_merchant_with_auth(a) {
      for (const m of merchants.values()) {
        if (m.phone_normalized === a.p_phone_normalized) {
          throw new Error("phone_already_registered");
        }
      }
      const id = crypto.randomUUID();
      const row = {
        id,
        name_lo: a.p_name_lo,
        names: a.p_names || {},
        category: a.p_category,
        market: a.p_market,
        phone: a.p_phone,
        phone_normalized: a.p_phone_normalized,
        bank: a.p_bank,
        account_last4: a.p_account_last4,
        rating: null,
        lat: null,
        lng: null,
        open_from: 1020,
        open_to: 1380,
        is_demo: false,
        terms_accepted_at: new Date().toISOString(),
        terms_version: a.p_terms_version,
        created_at: new Date().toISOString(),
      };
      merchants.set(id, row);
      authRows.set(id, {
        merchant_id: id,
        pin_hash: a.p_pin_hash,
        pin_salt: a.p_pin_salt,
        failed_attempts: 0,
        locked_until: null,
      });
      return row;
    },
    get_merchant_auth_by_phone({ p_phone_normalized }) {
      for (const m of merchants.values()) {
        if (m.phone_normalized === p_phone_normalized) {
          const a = authRows.get(m.id);
          if (!a) return null;
          return { ...a, is_demo: m.is_demo };
        }
      }
      return null;
    },
    get_merchant_auth_by_id({ p_merchant }) {
      const m = merchants.get(p_merchant);
      const a = authRows.get(p_merchant);
      if (!m || !a) return null;
      return { ...a, is_demo: m.is_demo };
    },
    record_login_failure({ p_merchant, p_max_attempts = 5, p_lock_minutes = 15 }) {
      const a = authRows.get(p_merchant);
      if (!a) return { failed_attempts: 0, locked_until: null };
      if (a.locked_until && new Date(a.locked_until).getTime() <= Date.now()) {
        a.failed_attempts = 1;
        a.locked_until = null;
      } else {
        a.failed_attempts += 1;
      }
      if (a.failed_attempts >= p_max_attempts) {
        a.locked_until = new Date(Date.now() + p_lock_minutes * 60_000).toISOString();
      }
      return { failed_attempts: a.failed_attempts, locked_until: a.locked_until };
    },
    reset_login_failures({ p_merchant }) {
      const a = authRows.get(p_merchant);
      if (a) { a.failed_attempts = 0; a.locked_until = null; }
      return null;
    },
    update_merchant_pin({ p_merchant, p_pin_hash, p_pin_salt, p_keep_token_hash = null }) {
      const a = authRows.get(p_merchant);
      if (!a) throw new Error("merchant_not_found");
      a.pin_hash = p_pin_hash;
      a.pin_salt = p_pin_salt;
      a.failed_attempts = 0;
      a.locked_until = null;
      for (const s of sessions.values()) {
        if (s.merchant_id === p_merchant && !s.revoked_at && (!p_keep_token_hash || s.token_hash !== p_keep_token_hash)) {
          s.revoked_at = new Date().toISOString();
        }
      }
      return { ok: true };
    },
    create_merchant_session({ p_merchant, p_token_hash, p_ttl_seconds = 86400, p_is_demo = false }) {
      if (!merchants.has(p_merchant)) throw new Error("merchant_not_found");
      const s = {
        session_id: crypto.randomUUID(),
        merchant_id: p_merchant,
        token_hash: p_token_hash,
        is_demo_session: !!p_is_demo,
        expires_at: new Date(Date.now() + p_ttl_seconds * 1000).toISOString(),
        revoked_at: null,
      };
      sessions.set(p_token_hash, s);
      return s;
    },
    get_merchant_session({ p_token_hash }) {
      const s = sessions.get(p_token_hash);
      if (!s || s.revoked_at || new Date(s.expires_at).getTime() <= Date.now()) return null;
      const m = merchants.get(s.merchant_id);
      if (!m) return null;
      return {
        session_id: s.session_id,
        merchant_id: s.merchant_id,
        is_demo_session: s.is_demo_session,
        merchant_is_demo: m.is_demo,
        expires_at: s.expires_at,
      };
    },
    revoke_merchant_session({ p_token_hash }) {
      const s = sessions.get(p_token_hash);
      if (s && !s.revoked_at) { s.revoked_at = new Date().toISOString(); return { revoked: 1 }; }
      return { revoked: 0 };
    },
    ensure_demo_sales() { return null; },
    ensure_demo_week() { return null; },
    merchant_dashboard({ p_merchant }) {
      const paid = [...payments.values()].filter((p) => p.merchant_id === p_merchant && p.status === "paid");
      const total = paid.reduce((acc, p) => acc + p.amount_kip, 0);
      return { total_kip: total, count: paid.length, foreign_kip: total, from_map: 0, by_nationality: [], recent: paid };
    },
    merchant_history({ p_merchant, p_days = 7 }) {
      const paid = [...payments.values()].filter((p) => p.merchant_id === p_merchant && p.status === "paid");
      return { days: Array.from({ length: p_days }, (_, i) => ({ day: `2026-11-${String(16 + i).padStart(2, "0")}`, kip: 0, count: 0 })), total_kip: 0, count: paid.length, by_wallet: [], items: paid };
    },
    set_merchant_location({ p_merchant, p_lat, p_lng, p_open_from, p_open_to }) {
      const m = merchants.get(p_merchant);
      if (!m) throw new Error("merchant_not_found");
      m.lat = p_lat; m.lng = p_lng;
      if (p_open_from != null) m.open_from = p_open_from;
      if (p_open_to != null) m.open_to = p_open_to;
      return { id: m.id, lat: m.lat, lng: m.lng, open_from: m.open_from, open_to: m.open_to };
    },
    list_menu({ p_merchant }) {
      return [...menus.values()].filter((i) => i.merchant_id === p_merchant);
    },
    add_menu_item({ p_merchant, p_name_lo, p_price, p_names, p_translated_by, p_color }) {
      const item = { id: crypto.randomUUID(), merchant_id: p_merchant, name_lo: p_name_lo, price_kip: p_price, names: p_names || {}, translated_by: p_translated_by || "manual", color: p_color || "#1F2B6B" };
      menus.set(item.id, item);
      return item;
    },
    delete_menu_item({ p_merchant, p_item }) {
      const it = menus.get(p_item);
      if (it && it.merchant_id === p_merchant) { menus.delete(p_item); return { deleted: 1 }; }
      return { deleted: 0 };
    },
    create_payment({ p_merchant, p_amount }) {
      if (!merchants.has(p_merchant)) throw new Error("merchant_not_found");
      const p = { id: crypto.randomUUID(), merchant_id: p_merchant, amount_kip: p_amount, status: "pending", wallet: null, nationality: null, from_map: false, reference: null, created_at: new Date().toISOString(), paid_at: null };
      payments.set(p.id, p);
      return p;
    },
    get_payment({ p_id }) {
      const p = payments.get(p_id);
      if (!p) return null;
      const m = merchants.get(p.merchant_id);
      return { ...p, merchant: { id: m.id, name_lo: m.name_lo, names: m.names, category: m.category, market: m.market, is_demo: m.is_demo } };
    },
    simulate_pay({ p_id, p_wallet, p_from_map = false }) {
      const p = payments.get(p_id);
      if (!p) throw new Error("payment_not_found");
      if (p.status === "pending") {
        p.status = "paid"; p.wallet = p_wallet; p.nationality = walletNat(p_wallet);
        p.from_map = !!p_from_map; p.paid_at = new Date().toISOString(); p.reference = "DEMO-SIM-1";
      }
      return p;
    },
    confirm_partner_payment({ p_id, p_wallet, p_reference = null }) {
      const p = payments.get(p_id);
      if (!p) throw new Error("payment_not_found");
      if (p.status === "pending") {
        p.status = "paid"; p.wallet = p_wallet; p.nationality = walletNat(p_wallet);
        p.paid_at = new Date().toISOString(); p.reference = p_reference || "PHL261122000001";
      }
      return p;
    },
  };

  const server = http.createServer(async (req, res) => {
    const m = req.url?.match(/^\/rest\/v1\/rpc\/([a-z0-9_]+)/i);
    const send = (status, obj) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
    if (req.method !== "POST" || !m || !handlers[m[1]]) return send(404, { message: `unknown_rpc_${m?.[1]}` });
    let raw = "";
    for await (const c of req) raw += c;
    try {
      const args = raw ? JSON.parse(raw) : {};
      const out = handlers[m[1]](args);
      return send(200, out === undefined ? null : out);
    } catch (e) {
      return send(400, { message: e.message });
    }
  });

  return { server, merchants, authRows, sessions, payments };
}

const mock = createMockSupabase();
await new Promise((resolve) => mock.server.listen(0, "127.0.0.1", resolve));
const port = mock.server.address().port;
test.after(() => mock.server.close());

const makeEnv = (overrides = {}) => ({
  ASSETS: { fetch: async () => new Response("<html>asset</html>", { headers: { "content-type": "text/html" } }) },
  SUPABASE_URL: `http://127.0.0.1:${port}`,
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  TOURIST_URL: "https://phalom-tourist.example",
  SESSION_SECRET: "test-session-pepper-only",
  WEBHOOK_SECRET: "test-webhook-hmac-secret",
  APP_MODE: "demo",
  ...overrides,
});

const ctx = { waitUntil() {}, passThroughOnException() {} };

async function req(env, method, p, { body, token, cookie, headers = {} } = {}) {
  const h = new Headers(headers);
  if (body !== undefined && !h.has("content-type")) h.set("content-type", "application/json");
  if (token) h.set("authorization", `Bearer ${token}`);
  if (cookie) h.set("cookie", cookie);
  const request = new Request(`https://phalom.example${p}`, {
    method,
    headers: h,
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  const res = await worker.fetch(request, env, ctx);
  const data = await res.clone().json().catch(() => null);
  return { res, data };
}

function extractCookiePair(res) {
  const sc = res.headers.get("set-cookie");
  if (!sc) return null;
  return sc.split(";")[0];
}

// ---- Tests ------------------------------------------------------------------
test("frontend JS and tourist worker syntax check", () => {
  const files = [
    "public/shared/core.js",
    "public/merchant.js",
    "public/sw.js",
    "tourist/public/tourist.js",
    "tourist/src/worker.js",
    "scripts/smoke.mjs",
  ];
  for (const f of files) {
    execFileSync(process.execPath, ["--check", path.join(ROOT, f)], { stdio: "pipe" });
  }
});

test("security headers, /terms and /privacy redirects, and 64KB body limit", async () => {
  const env = makeEnv({ APP_MODE: "production" });
  const { res } = await req(env, "GET", "/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("x-frame-options"), "SAMEORIGIN");
  assert.equal(res.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.ok(res.headers.get("permissions-policy")?.includes("microphone=()"));
  assert.ok(res.headers.get("x-request-id"));

  const t = await req(env, "GET", "/terms");
  assert.equal(t.res.status, 302);
  assert.equal(t.res.headers.get("location"), "https://phalom.example/#/terms");

  const p = await req(env, "GET", "/privacy");
  assert.equal(p.res.status, 302);
  assert.equal(p.res.headers.get("location"), "https://phalom.example/#/privacy");

  const big = await req(env, "POST", "/api/auth/login", { body: "x".repeat(70_000) });
  assert.equal(big.res.status, 413);
  assert.equal(big.data.error, "payload_too_large");
});

test("registration, phone normalization, HttpOnly cookie + Bearer auth, and duplicate phone 409", async () => {
  const env = makeEnv({ APP_MODE: "production" });

  // Missing terms -> 400
  const noTerms = await req(env, "POST", "/api/merchants", {
    body: { name_lo: "ຮ້ານທົດສອບ", category: "souvenir", bank: "BCEL", account_last4: "1234", phone: "020 5511 2233", pin: "123456" },
  });
  assert.equal(noTerms.res.status, 400);
  assert.equal(noTerms.data.error, "terms_required");

  // Bad PIN -> 400
  const badPin = await req(env, "POST", "/api/merchants", {
    body: { name_lo: "ຮ້ານທົດສອບ", category: "souvenir", bank: "BCEL", account_last4: "1234", phone: "020 5511 2233", pin: "12ab", accepted_terms: true },
  });
  assert.equal(badPin.res.status, 400);
  assert.equal(badPin.data.error, "pin_must_be_6_digits");

  // Valid registration -> 201 + cookie + token, no pin_hash leak
  const regA = await req(env, "POST", "/api/merchants", {
    body: { name_lo: "ຮ້ານຜ້າໄໝ ແມ່ບົວ", category: "souvenir", bank: "BCEL", account_last4: "1234", phone: "020 5511 2233", pin: "246810", accepted_terms: true },
  });
  assert.equal(regA.res.status, 201);
  assert.ok(regA.data.id && regA.data.token);
  assert.equal(regA.data.pin_hash, undefined);
  assert.equal(regA.data.pin_salt, undefined);
  const setCookie = regA.res.headers.get("set-cookie");
  assert.ok(setCookie?.includes("HttpOnly") && setCookie?.includes("Secure") && setCookie?.includes("SameSite=Lax"));

  // Same phone in +856 format -> 409 phone_already_registered
  const dup = await req(env, "POST", "/api/merchants", {
    body: { name_lo: "ຮ້ານຊ້ຳ", category: "food", bank: "LDB", account_last4: "9999", phone: "+856 20 5511 2233", pin: "111222", accepted_terms: true },
  });
  assert.equal(dup.res.status, 409);
  assert.equal(dup.data.error, "phone_already_registered");

  // Auth via HttpOnly cookie works on GET /api/auth/me
  const meCookie = await req(env, "GET", "/api/auth/me", { cookie: extractCookiePair(regA.res) });
  assert.equal(meCookie.res.status, 200);
  assert.equal(meCookie.data.merchant.id, regA.data.id);

  // Auth via Bearer works on merchant dashboard
  const dash = await req(env, "GET", `/api/merchants/${regA.data.id}/dashboard`, { token: regA.data.token });
  assert.equal(dash.res.status, 200);
});

test("strict route protection: unauthenticated 401 and cross-merchant 403 on all /api/merchants/* and voice", async () => {
  const env = makeEnv({ APP_MODE: "production" });

  const shopA = await req(env, "POST", "/api/merchants", {
    body: { name_lo: "ຮ້ານ A", category: "food", bank: "BCEL", account_last4: "1111", phone: "020 5500 0001", pin: "111111", accepted_terms: true },
  });
  const shopB = await req(env, "POST", "/api/merchants", {
    body: { name_lo: "ຮ້ານ B", category: "drinks", bank: "LDB", account_last4: "2222", phone: "020 5500 0002", pin: "222222", accepted_terms: true },
  });
  assert.equal(shopA.res.status, 201);
  assert.equal(shopB.res.status, 201);

  const aid = shopA.data.id;
  const tokA = shopA.data.token;
  const tokB = shopB.data.token;

  // Create menu item & payment for Shop A
  const item = await req(env, "POST", `/api/merchants/${aid}/menu`, { token: tokA, body: { name_lo: "ເຝີ", price_kip: 35000 } });
  assert.equal(item.res.status, 201);
  const pay = await req(env, "POST", "/api/payments", { body: { merchant_id: aid, amount_kip: 35000 } });
  assert.equal(pay.res.status, 201);

  // Public payment GET must NOT expose bank or account_last4
  const pubPay = await req(env, "GET", `/api/payments/${pay.data.id}`);
  assert.equal(pubPay.res.status, 200);
  assert.equal(pubPay.data.merchant.bank, undefined);
  assert.equal(pubPay.data.merchant.account_last4, undefined);
  assert.equal(pubPay.data.merchant.category, "food");

  const protectedCases = [
    ["GET", `/api/merchants/${aid}`],
    ["GET", `/api/merchants/${aid}/dashboard`],
    ["GET", `/api/merchants/${aid}/history?days=7`],
    ["GET", `/api/merchants/${aid}/map`],
    ["PUT", `/api/merchants/${aid}/location`, { lat: 17.96, lng: 102.61 }],
    ["GET", `/api/merchants/${aid}/menu`],
    ["POST", `/api/merchants/${aid}/menu`, { name_lo: "ຊາ", price_kip: 15000 }],
    ["DELETE", `/api/merchants/${aid}/menu/${item.data.id}`],
    ["GET", `/api/payments/${pay.data.id}/voice`],
  ];

  for (const [method, p, body] of protectedCases) {
    const noAuth = await req(env, method, p, { body });
    assert.equal(noAuth.res.status, 401, `expected 401 for unauthenticated ${method} ${p}`);
    const wrongShop = await req(env, method, p, { body, token: tokB });
    assert.equal(wrongShop.res.status, 403, `expected 403 for cross-merchant ${method} ${p}`);
  }
});

test("login lockout after 5 wrong PINs, PIN change revokes other sessions, logout revokes current session", async () => {
  const env = makeEnv({ APP_MODE: "production" });

  const reg = await req(env, "POST", "/api/merchants", {
    body: { name_lo: "ຮ້ານ PIN", category: "coffee", bank: "JDB", account_last4: "4444", phone: "020 5599 8877", pin: "654321", accepted_terms: true },
  });
  const token1 = reg.data.token;

  // Second login via +856 format works
  const login2 = await req(env, "POST", "/api/auth/login", { body: { phone: "+8562055998877", pin: "654321" } });
  assert.equal(login2.res.status, 200);
  const token2 = login2.data.token;

  // Change PIN from session 2 -> revokes session 1, keeps session 2 alive
  const ch = await req(env, "POST", "/api/auth/change-pin", { token: token2, body: { current_pin: "654321", new_pin: "987654" } });
  assert.equal(ch.res.status, 200);
  assert.equal((await req(env, "GET", "/api/auth/me", { token: token1 })).res.status, 401);
  assert.equal((await req(env, "GET", "/api/auth/me", { token: token2 })).res.status, 200);

  // Logout revokes session 2
  const out = await req(env, "POST", "/api/auth/logout", { token: token2 });
  assert.equal(out.res.status, 200);
  assert.ok(out.res.headers.get("set-cookie")?.includes("Max-Age=0"));
  assert.equal((await req(env, "GET", "/api/auth/me", { token: token2 })).res.status, 401);

  // 5 failed login attempts trigger 429 account_locked
  for (let i = 1; i <= 4; i++) {
    const bad = await req(env, "POST", "/api/auth/login", { body: { phone: "02055998877", pin: "000000" } });
    assert.equal(bad.res.status, 401);
    assert.equal(bad.data.attempts_remaining, 5 - i);
  }
  const fifth = await req(env, "POST", "/api/auth/login", { body: { phone: "02055998877", pin: "000000" } });
  assert.equal(fifth.res.status, 429);
  assert.equal(fifth.data.error, "account_locked");
  assert.ok(fifth.data.retry_after > 0);

  // Even the right PIN is blocked while locked
  const duringLock = await req(env, "POST", "/api/auth/login", { body: { phone: "02055998877", pin: "987654" } });
  assert.equal(duringLock.res.status, 429);
});

test("demo vs production mode separation (default unset APP_MODE is production)", async () => {
  const demoEnv = makeEnv({ APP_MODE: "demo" });
  const prodEnv = makeEnv({ APP_MODE: "production" });
  const unsetEnv = makeEnv({ APP_MODE: undefined });

  // Demo mode enables demo config, demo auth, demo shops, and simulate_pay
  const dCfg = await req(demoEnv, "GET", "/api/config");
  assert.equal(dCfg.data.mode, "demo");
  assert.equal(dCfg.data.demoEnabled, true);
  assert.equal(dCfg.data.demoMerchantId, DEMO_ID);

  const dAuth = await req(demoEnv, "POST", "/api/auth/demo");
  assert.equal(dAuth.res.status, 200);
  const demoToken = dAuth.data.token;

  // Demo shop cannot change PIN
  const dPin = await req(demoEnv, "POST", "/api/auth/change-pin", { token: demoToken, body: { current_pin: "111111", new_pin: "222222" } });
  assert.equal(dPin.res.status, 403);

  const dPay = await req(demoEnv, "POST", "/api/payments", { body: { merchant_id: DEMO_ID, amount_kip: 20000 } });
  assert.equal(dPay.res.status, 201);
  const simOk = await req(demoEnv, "POST", `/api/payments/${dPay.data.id}/simulate`, { body: { wallet: "alipay" } });
  assert.equal(simOk.res.status, 200);
  assert.equal(simOk.data.status, "paid");

  const dShops = await req(demoEnv, "GET", "/api/shops");
  assert.ok(dShops.data.some((s) => s.id === DEMO_ID));

  // Production & unset APP_MODE lock down every demo path
  for (const env of [prodEnv, unsetEnv]) {
    const pCfg = await req(env, "GET", "/api/config");
    assert.equal(pCfg.data.mode, "production");
    assert.equal(pCfg.data.demoEnabled, false);
    assert.equal(pCfg.data.demoMerchantId, null);

    const pDemoAuth = await req(env, "POST", "/api/auth/demo");
    assert.equal(pDemoAuth.res.status, 403);
    assert.equal(pDemoAuth.data.error, "demo_disabled");

    // Existing demo session token is rejected in production mode
    const pDemoSess = await req(env, "GET", `/api/merchants/${DEMO_ID}/dashboard`, { token: demoToken });
    assert.equal(pDemoSess.res.status, 403);
    assert.equal(pDemoSess.data.error, "demo_disabled");

    const pSim = await req(env, "POST", `/api/payments/${dPay.data.id}/simulate`, { body: { wallet: "alipay" } });
    assert.equal(pSim.res.status, 403);
    assert.equal(pSim.data.error, "demo_disabled");

    // Demo shops are excluded from public lists, shop detail, map, and payment creation
    const pShops = await req(env, "GET", "/api/shops");
    assert.ok(!pShops.data.some((s) => s.id === DEMO_ID));
    assert.equal((await req(env, "GET", `/api/shops/${DEMO_ID}`)).res.status, 404);
    const pMap = await req(env, "GET", "/api/map");
    assert.ok(!pMap.data.some((s) => s.id === DEMO_ID));
    const pPayDemo = await req(env, "POST", "/api/payments", { body: { merchant_id: DEMO_ID, amount_kip: 20000 } });
    assert.equal(pPayDemo.res.status, 404);
    assert.equal((await req(env, "GET", `/api/payments/${dPay.data.id}`)).res.status, 404);
  }
});

test("partner webhook HMAC-SHA256 verification and production confirmation", async () => {
  const secret = "partner-webhook-super-secret";
  const env = makeEnv({ APP_MODE: "production", WEBHOOK_SECRET: secret });

  // Register a real shop and create a pending payment
  const shop = await req(env, "POST", "/api/merchants", {
    body: { name_lo: "ຮ້ານຈິງ", category: "souvenir", bank: "BCEL", account_last4: "7777", phone: "020 5588 1234", pin: "135790", accepted_terms: true },
  });
  const pay = await req(env, "POST", "/api/payments", { body: { merchant_id: shop.data.id, amount_kip: 100000 } });
  assert.equal(pay.res.status, 201);

  const payload = JSON.stringify({ payment_id: pay.data.id, wallet: "alipay", reference: "BCEL-LIVE-001" });
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  // Missing webhook secret -> 501
  const noSec = await req(makeEnv({ APP_MODE: "production", WEBHOOK_SECRET: undefined }), "POST", "/api/webhooks/payment", { body: payload });
  assert.equal(noSec.res.status, 501);

  // Bad signature -> 401
  const badSig = await req(env, "POST", "/api/webhooks/payment", { body: payload, headers: { "x-phalom-signature": "deadbeef" } });
  assert.equal(badSig.res.status, 401);

  // Valid signature, invalid JSON -> 400
  const badJson = "{not-json";
  const badJsonSig = crypto.createHmac("sha256", secret).update(badJson).digest("hex");
  const badJsonRes = await req(env, "POST", "/api/webhooks/payment", { body: badJson, headers: { "x-phalom-signature": badJsonSig } });
  assert.equal(badJsonRes.res.status, 400);

  // Valid signature -> 200 and payment marked paid with partner reference
  const okRes = await req(env, "POST", "/api/webhooks/payment", { body: payload, headers: { "x-phalom-signature": sig } });
  assert.equal(okRes.res.status, 200);
  assert.equal(okRes.data.status, "paid");
  assert.equal(okRes.data.wallet, "alipay");
  assert.equal(okRes.data.nationality, "cn");
  assert.equal(okRes.data.reference, "BCEL-LIVE-001");
});
