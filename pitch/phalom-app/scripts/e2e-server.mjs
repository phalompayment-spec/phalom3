/**
 * Lightweight local E2E server for running Playwright tests without Postgres/Wrangler:
 *   - Bundles src/worker.ts via esbuild and serves Merchant App + API on http://127.0.0.1:8787
 *   - Serves Tourist App on http://127.0.0.1:8788 (proxying /api/* and /shared/* to 8787)
 *   - Backed by a faithful in-memory Supabase RPC simulator pre-seeded with demo shops
 *
 * In CI (.github/workflows/ci.yml), Playwright runs against REAL Postgres 16 +
 * local-supabase.mjs + wrangler dev instead (E2E_EXTERNAL_SERVER=1).
 */
import http from "node:http";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const MERCHANT_PORT = Number(process.env.MERCHANT_PORT || 8787);
const TOURIST_PORT = Number(process.env.TOURIST_PORT || 8788);
const APP_MODE = process.env.APP_MODE || "demo";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "e2e-local-webhook-secret";
const DEMO_ID = "00000000-0000-4000-8000-000000000001";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function serveStatic(dir, reqUrl, spaFallback = false) {
  let pathname = decodeURIComponent(new URL(reqUrl).pathname);
  if (pathname === "/") pathname = "/index.html";
  const resolved = path.resolve(dir, "." + pathname);
  if (!resolved.startsWith(dir)) return new Response("Forbidden", { status: 403 });
  let target = resolved;
  if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    if (spaFallback) target = path.join(dir, "index.html");
    else return new Response("Not Found", { status: 404 });
  }
  const ext = path.extname(target).toLowerCase();
  return new Response(fs.readFileSync(target), {
    status: 200,
    headers: { "content-type": MIME[ext] || "application/octet-stream" },
  });
}

// ---- Bundle src/worker.ts ---------------------------------------------------
const outFile = path.join(os.tmpdir(), `phalom-e2e-worker-${process.pid}.mjs`);
await esbuild.build({
  entryPoints: [path.join(ROOT, "src/worker.ts")],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  outfile: outFile,
  conditions: ["workerd", "worker", "browser"],
});
const worker = (await import(pathToFileURL(outFile).href)).default;
process.on("exit", () => fs.rmSync(outFile, { force: true }));

// ---- In-memory Supabase RPC simulator ---------------------------------------
const merchants = new Map();
const authRows = new Map();
const sessions = new Map();
const menus = new Map();
const payments = new Map();

const seedShops = [
  { id: DEMO_ID, name_lo: "ຮ້ານຜ້າທໍແມ່ຄຳ", names: { zh: "坎妈妈织布店", th: "ร้านผ้าทอแม่คำ", vi: "Tiệm vải dệt Mae Kham", en: "Mae Kham Textiles" }, category: "souvenir", market: "ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ", bank: "BCEL", account_last4: "4821", rating: 4.8, lat: 19.8887, lng: 102.1353, open_from: 1020, open_to: 1380, is_demo: true },
  { id: "00000000-0000-4000-8000-000000000002", name_lo: "ເຂົ້າຈີ່ປາເຕ ແມ່ນ້ອຍ", names: { zh: "老挝法棍三明治", th: "ข้าวจี่ปาเต้ แม่น้อย", vi: "Bánh mì Lào Mae Noy", en: "Mae Noy Baguettes" }, category: "food", market: "ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ", bank: "JDB", account_last4: "1190", rating: 4.6, lat: 19.88822, lng: 102.13468, open_from: 420, open_to: 1350, is_demo: true },
  { id: "00000000-0000-4000-8000-000000000003", name_lo: "ນ້ຳໝາກໄມ້ ພອນ", names: { zh: "阿蓬鲜果汁", th: "น้ำผลไม้ พร", vi: "Nước ép trái cây Phone", en: "Phone Fruit Shakes" }, category: "drinks", market: "ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ", bank: "LDB", account_last4: "7731", rating: 4.5, lat: 19.88915, lng: 102.13596, open_from: 600, open_to: 1380, is_demo: true },
  { id: "00000000-0000-4000-8000-000000000004", name_lo: "ເງິນຊ່າງບ້ານ", names: { zh: "手工银饰店", th: "เครื่องเงินช่างบ้าน", vi: "Bạc thủ công làng nghề", en: "Village Silver" }, category: "silver", market: "ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ", bank: "BCEL", account_last4: "3304", rating: 4.7, lat: 19.88796, lng: 102.13418, open_from: 1020, open_to: 1380, is_demo: true },
  { id: "00000000-0000-4000-8000-000000000005", name_lo: "ປີ້ງໄກ່ ແມ່ຈັນ", names: { zh: "占妈妈烤鸡", th: "ไก่ปิ้ง แม่จันทร์", vi: "Gà nướng Mae Chan", en: "Mae Chan Grilled Chicken" }, category: "food", market: "ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ", bank: "APB", account_last4: "5512", rating: 4.4, lat: 19.88752, lng: 102.13372, open_from: 960, open_to: 1380, is_demo: true },
];
for (const s of seedShops) merchants.set(s.id, { ...s, phone: null, phone_normalized: null, created_at: new Date().toISOString() });

const seedMenu = [
  { id: "10000000-0000-4000-8000-000000000001", merchant_id: DEMO_ID, name_lo: "ຜ້າພັນຄໍໄໝ ລາຍນາກ", names: { zh: "手工丝绸围巾", th: "ผ้าพันคอไหม", vi: "Khăn lụa", en: "Hand-woven silk scarf" }, price_kip: 150000, color: "#7A2E3B", translated_by: "manual" },
  { id: "10000000-0000-4000-8000-000000000002", merchant_id: DEMO_ID, name_lo: "ກະເປົາຜ້າຝ້າຍ ຍ້ອມຄາມ", names: { zh: "蓝靛染棉布包", th: "กระเป๋าผ้าฝ้าย", vi: "Túi vải bông", en: "Indigo cotton bag" }, price_kip: 85000, color: "#2E4DB8", translated_by: "manual" },
];
for (const it of seedMenu) menus.set(it.id, { ...it, created_at: new Date().toISOString() });

const walletNat = (w) => ({ alipay: "cn", wechat: "cn", unionpay: "cn", promptpay: "th", vietqr: "vn", kakaopay: "kr", laoqr: "la" })[w] || "other";

function ensureDemoSales() {
  const existing = [...payments.values()].some((p) => p.merchant_id === DEMO_ID && p.status === "paid");
  if (existing) return;
  for (const [amt, w] of [[30000, "alipay"], [55000, "promptpay"], [70000, "unionpay"], [120000, "wechat"]]) {
    const id = crypto.randomUUID();
    payments.set(id, { id, merchant_id: DEMO_ID, amount_kip: amt, status: "paid", wallet: w, nationality: walletNat(w), from_map: false, reference: "DEMO-001", created_at: new Date().toISOString(), paid_at: new Date().toISOString() });
  }
}

const rpcHandlers = {
  list_shops({ p_include_demo = false }) {
    return [...merchants.values()].filter((m) => p_include_demo || !m.is_demo).map((m) => ({
      id: m.id, name_lo: m.name_lo, names: m.names, category: m.category, market: m.market, rating: m.rating,
      paid_today: [...payments.values()].filter((p) => p.merchant_id === m.id && p.status === "paid").length,
    }));
  },
  map_shops({ p_include_demo = false }) {
    return [...merchants.values()].filter((m) => m.lat != null && m.lng != null && (p_include_demo || !m.is_demo)).map((m) => {
      const mItems = [...menus.values()].filter((i) => i.merchant_id === m.id);
      const min_price = mItems.length ? Math.min(...mItems.map((i) => i.price_kip)) : null;
      return { id: m.id, name_lo: m.name_lo, names: m.names, category: m.category, market: m.market, rating: m.rating, lat: m.lat, lng: m.lng, open_from: m.open_from, open_to: m.open_to, min_price, paid_total: 10, paid_today: 2, by_nat: { cn: 5, th: 3, vn: 2 } };
    });
  },
  get_merchant({ p_id }) { return merchants.get(p_id) || null; },
  register_merchant_with_auth(a) {
    for (const m of merchants.values()) if (m.phone_normalized === a.p_phone_normalized) throw new Error("phone_already_registered");
    const id = crypto.randomUUID();
    const row = { id, name_lo: a.p_name_lo, names: a.p_names || {}, category: a.p_category, market: a.p_market, phone: a.p_phone, phone_normalized: a.p_phone_normalized, bank: a.p_bank, account_last4: a.p_account_last4, rating: null, lat: null, lng: null, open_from: 1020, open_to: 1380, is_demo: false, terms_accepted_at: new Date().toISOString(), terms_version: a.p_terms_version, created_at: new Date().toISOString() };
    merchants.set(id, row);
    authRows.set(id, { merchant_id: id, pin_hash: a.p_pin_hash, pin_salt: a.p_pin_salt, failed_attempts: 0, locked_until: null });
    return row;
  },
  get_merchant_auth_by_phone({ p_phone_normalized }) {
    for (const m of merchants.values()) {
      if (m.phone_normalized === p_phone_normalized) {
        const a = authRows.get(m.id);
        return a ? { ...a, is_demo: m.is_demo } : null;
      }
    }
    return null;
  },
  get_merchant_auth_by_id({ p_merchant }) {
    const m = merchants.get(p_merchant), a = authRows.get(p_merchant);
    return m && a ? { ...a, is_demo: m.is_demo } : null;
  },
  record_login_failure({ p_merchant, p_max_attempts = 5, p_lock_minutes = 15 }) {
    const a = authRows.get(p_merchant);
    if (!a) return { failed_attempts: 0, locked_until: null };
    a.failed_attempts += 1;
    if (a.failed_attempts >= p_max_attempts) a.locked_until = new Date(Date.now() + p_lock_minutes * 60_000).toISOString();
    return { failed_attempts: a.failed_attempts, locked_until: a.locked_until };
  },
  reset_login_failures({ p_merchant }) { const a = authRows.get(p_merchant); if (a) { a.failed_attempts = 0; a.locked_until = null; } return null; },
  update_merchant_pin({ p_merchant, p_pin_hash, p_pin_salt, p_keep_token_hash = null }) {
    const a = authRows.get(p_merchant);
    if (!a) throw new Error("merchant_not_found");
    a.pin_hash = p_pin_hash; a.pin_salt = p_pin_salt; a.failed_attempts = 0; a.locked_until = null;
    for (const s of sessions.values()) if (s.merchant_id === p_merchant && !s.revoked_at && (!p_keep_token_hash || s.token_hash !== p_keep_token_hash)) s.revoked_at = new Date().toISOString();
    return { ok: true };
  },
  create_merchant_session({ p_merchant, p_token_hash, p_ttl_seconds = 86400, p_is_demo = false }) {
    if (!merchants.has(p_merchant)) throw new Error("merchant_not_found");
    const s = { session_id: crypto.randomUUID(), merchant_id: p_merchant, token_hash: p_token_hash, is_demo_session: !!p_is_demo, expires_at: new Date(Date.now() + p_ttl_seconds * 1000).toISOString(), revoked_at: null };
    sessions.set(p_token_hash, s);
    return s;
  },
  get_merchant_session({ p_token_hash }) {
    const s = sessions.get(p_token_hash);
    if (!s || s.revoked_at || new Date(s.expires_at).getTime() <= Date.now()) return null;
    const m = merchants.get(s.merchant_id);
    return m ? { session_id: s.session_id, merchant_id: s.merchant_id, is_demo_session: s.is_demo_session, merchant_is_demo: m.is_demo, expires_at: s.expires_at } : null;
  },
  revoke_merchant_session({ p_token_hash }) {
    const s = sessions.get(p_token_hash);
    if (s && !s.revoked_at) { s.revoked_at = new Date().toISOString(); return { revoked: 1 }; }
    return { revoked: 0 };
  },
  ensure_demo_sales() { ensureDemoSales(); return null; },
  ensure_demo_week() { ensureDemoSales(); return null; },
  merchant_dashboard({ p_merchant }) {
    const paid = [...payments.values()].filter((p) => p.merchant_id === p_merchant && p.status === "paid");
    const total = paid.reduce((a, p) => a + p.amount_kip, 0);
    const foreign = paid.filter((p) => p.nationality !== "la").reduce((a, p) => a + p.amount_kip, 0);
    const byNatMap = {};
    for (const p of paid) { byNatMap[p.nationality] = byNatMap[p.nationality] || { nationality: p.nationality, kip: 0, count: 0 }; byNatMap[p.nationality].kip += p.amount_kip; byNatMap[p.nationality].count += 1; }
    return { total_kip: total, count: paid.length, foreign_kip: foreign, from_map: paid.filter((p) => p.from_map).length, by_nationality: Object.values(byNatMap), recent: paid.slice(-8).reverse() };
  },
  merchant_history({ p_merchant, p_days = 7 }) {
    const paid = [...payments.values()].filter((p) => p.merchant_id === p_merchant && p.status === "paid").reverse();
    const total = paid.reduce((a, p) => a + p.amount_kip, 0);
    const today = new Date();
    const days = Array.from({ length: p_days }, (_, idx) => {
      const d = new Date(today.getTime() - (p_days - 1 - idx) * 86400_000);
      const ymd = d.toLocaleDateString("en-CA", { timeZone: "Asia/Vientiane" });
      const isLast = idx === p_days - 1;
      return { day: ymd, kip: isLast ? total : 0, count: isLast ? paid.length : 0 };
    });
    return { days, total_kip: total, count: paid.length, by_wallet: [], items: paid };
  },
  set_merchant_location({ p_merchant, p_lat, p_lng, p_open_from, p_open_to }) {
    const m = merchants.get(p_merchant);
    if (!m) throw new Error("merchant_not_found");
    m.lat = p_lat; m.lng = p_lng;
    if (p_open_from != null) m.open_from = p_open_from;
    if (p_open_to != null) m.open_to = p_open_to;
    return { id: m.id, lat: m.lat, lng: m.lng, open_from: m.open_from, open_to: m.open_to };
  },
  list_menu({ p_merchant }) { return [...menus.values()].filter((i) => i.merchant_id === p_merchant); },
  add_menu_item({ p_merchant, p_name_lo, p_price, p_names, p_translated_by, p_color }) {
    const item = { id: crypto.randomUUID(), merchant_id: p_merchant, name_lo: p_name_lo, price_kip: p_price, names: p_names || {}, translated_by: p_translated_by || "manual", color: p_color || "#1F2B6B", created_at: new Date().toISOString() };
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
    if (p.status === "pending") { p.status = "paid"; p.wallet = p_wallet; p.nationality = walletNat(p_wallet); p.from_map = !!p_from_map; p.paid_at = new Date().toISOString(); p.reference = "DEMO-E2E-" + p.id.slice(0, 6); }
    return p;
  },
  confirm_partner_payment({ p_id, p_wallet, p_reference = null }) {
    const p = payments.get(p_id);
    if (!p) throw new Error("payment_not_found");
    if (p.status === "pending") { p.status = "paid"; p.wallet = p_wallet; p.nationality = walletNat(p_wallet); p.paid_at = new Date().toISOString(); p.reference = p_reference || "PHL-E2E-1"; }
    return p;
  },
};

const EXTERNAL_SUPABASE_URL = process.env.SUPABASE_URL || "";
let supabaseUrl = EXTERNAL_SUPABASE_URL;

if (!supabaseUrl) {
  const rpcServer = http.createServer(async (req, res) => {
    const m = req.url?.match(/^\/rest\/v1\/rpc\/([a-z0-9_]+)/i);
    const send = (status, obj) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
    if (req.method !== "POST" || !m || !rpcHandlers[m[1]]) return send(404, { message: "not_found" });
    let raw = ""; for await (const c of req) raw += c;
    try { send(200, rpcHandlers[m[1]](raw ? JSON.parse(raw) : {}) ?? null); }
    catch (e) { send(400, { message: e.message }); }
  });
  await new Promise((r) => rpcServer.listen(0, "127.0.0.1", r));
  supabaseUrl = `http://127.0.0.1:${rpcServer.address().port}`;
}

const workerEnv = {
  ASSETS: { fetch: async (request) => serveStatic(path.join(ROOT, "public"), request.url, false) },
  SUPABASE_URL: supabaseUrl,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "local-e2e-key",
  APP_MODE,
  WEBHOOK_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET || "e2e-local-session-secret",
  TOURIST_URL: `http://127.0.0.1:${TOURIST_PORT}`,
};
const ctx = { waitUntil() {}, passThroughOnException() {} };

async function handleNodeReq(req, res, handler) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = chunks.length && !["GET", "HEAD"].includes(req.method) ? Buffer.concat(chunks) : undefined;
  const fullUrl = `http://${req.headers.host}${req.url}`;
  const webReq = new Request(fullUrl, { method: req.method, headers: req.headers, body });
  const webRes = await handler(webReq);
  const outHeaders = {};
  webRes.headers.forEach((v, k) => { outHeaders[k] = v; });
  res.writeHead(webRes.status, outHeaders);
  res.end(Buffer.from(await webRes.arrayBuffer()));
}

const merchantServer = http.createServer((req, res) => handleNodeReq(req, res, (r) => worker.fetch(r, workerEnv, ctx)));
const touristServer = http.createServer((req, res) =>
  handleNodeReq(req, res, async (r) => {
    const u = new URL(r.url);
    if (u.pathname.startsWith("/api/") || u.pathname.startsWith("/shared/")) {
      return worker.fetch(new Request(`http://127.0.0.1:${MERCHANT_PORT}${u.pathname}${u.search}`, r), workerEnv, ctx);
    }
    return serveStatic(path.join(ROOT, "tourist/public"), r.url, true);
  }),
);

await Promise.all([
  new Promise((r) => merchantServer.listen(MERCHANT_PORT, "127.0.0.1", r)),
  new Promise((r) => touristServer.listen(TOURIST_PORT, "127.0.0.1", r)),
]);
console.log(`E2E servers ready: merchant=http://127.0.0.1:${MERCHANT_PORT} tourist=http://127.0.0.1:${TOURIST_PORT} mode=${APP_MODE}`);
