// End-to-end check against a running app: BASE=http://127.0.0.1:8787 node scripts/smoke.mjs
const BASE = process.env.BASE || "http://127.0.0.1:8787";

let authToken = null;

const rawCall = async (method, p, body, opts = {}) => {
  const headers = { "content-type": "application/json", ...(opts.headers || {}) };
  if (authToken && !opts.noAuth) headers.authorization = `Bearer ${authToken}`;
  const r = await fetch(BASE + p, { method, headers, body: body ? JSON.stringify(body) : undefined, redirect: opts.redirect });
  const j = await r.json().catch(() => null);
  return { r, j };
};

const call = async (method, p, body, opts = {}) => {
  const { r, j } = await rawCall(method, p, body, opts);
  if (!r.ok) throw new Error(`${method} ${p} -> ${r.status} ${JSON.stringify(j)}`);
  return j;
};

const ok = (cond, msg) => { if (!cond) throw new Error("FAILED: " + msg); console.log("✓", msg); };

const healthRes = await rawCall("GET", "/api/health");
ok(healthRes.r.ok && healthRes.j?.ok, `health (mode: ${healthRes.j?.mode}, shops: ${healthRes.j?.shops}, ai: ${healthRes.j?.ai})`);
ok(healthRes.r.headers.get("x-content-type-options") === "nosniff", "security header: x-content-type-options");
ok(!!healthRes.r.headers.get("x-request-id"), "observability header: x-request-id");

const cfg = await call("GET", "/api/config");
ok(cfg.currency === "LAK" && !("rates" in cfg), "config: Lao kip only, no exchange rates");
ok(/^https?:\/\//.test(cfg.touristUrl), `tourist app: ${cfg.touristUrl}`);
ok(typeof cfg.demoEnabled === "boolean" && !!cfg.termsVersion, `mode: ${cfg.mode}, terms: ${cfg.termsVersion}`);

const app = await fetch(BASE + "/").then((r) => r.text());
ok(app.includes("merchant.js"), "merchant app served");

const termsRedir = await fetch(BASE + "/terms", { redirect: "manual" });
ok(termsRedir.status === 302, "/terms forwards to in-app terms");
const privRedir = await fetch(BASE + "/privacy", { redirect: "manual" });
ok(privRedir.status === 302, "/privacy forwards to in-app privacy notice");

const unauthMe = await rawCall("GET", "/api/auth/me", null, { noAuth: true });
ok(unauthMe.r.status === 401, "GET /api/auth/me requires login (401)");

if (!cfg.demoEnabled) {
  // Production mode checks: verify demo paths are locked down.
  ok(cfg.demoMerchantId === null, "production mode hides demoMerchantId");
  const demoAuth = await rawCall("POST", "/api/auth/demo", null, { noAuth: true });
  ok(demoAuth.r.status === 403 && demoAuth.j?.error === "demo_disabled", "production mode blocks /api/auth/demo (403)");
  const sim = await rawCall("POST", "/api/payments/00000000-0000-4000-8000-000000000099/simulate", { wallet: "alipay" }, { noAuth: true });
  ok(sim.r.status === 403 && sim.j?.error === "demo_disabled", "production mode blocks /api/payments/:id/simulate (403)");
  const unauthDash = await rawCall("GET", "/api/merchants/00000000-0000-4000-8000-000000000001/dashboard", null, { noAuth: true });
  ok(unauthDash.r.status === 401, "unauthenticated merchant dashboard blocked (401)");
  console.log("All production smoke checks passed.");
  process.exit(0);
}

// Demo mode end-to-end checks
const mid = cfg.demoMerchantId;
ok(!!mid, "demo mode exposes demoMerchantId");

const unauthDash = await rawCall("GET", `/api/merchants/${mid}/dashboard`, null, { noAuth: true });
ok(unauthDash.r.status === 401, "unauthenticated /api/merchants/:id/dashboard blocked (401)");

const demoLogin = await call("POST", "/api/auth/demo", null, { noAuth: true });
ok(demoLogin.merchant?.id === mid && !!demoLogin.token, "demo login issues session token");
authToken = demoLogin.token;

const me = await call("GET", "/api/auth/me");
ok(me.authenticated && me.merchant?.id === mid, "GET /api/auth/me recognizes active session");

const d0 = await call("GET", `/api/merchants/${mid}/dashboard`);
ok(d0.count > 0, `dashboard: ${d0.count} sales, ${d0.total_kip} kip`);

const pay = await call("POST", "/api/payments", { merchant_id: mid, amount_kip: 50000 });
ok(pay.status === "pending" && pay.amount_kip === 50000 && !("fx" in pay), "payment created: 50,000 kip, no other currency");
ok(pay.pay_url.startsWith(cfg.touristUrl + "/pay/"), "payment QR opens the tourist app");

const page = await fetch(pay.pay_url);
ok(page.ok && (await page.text()).includes("tourist.js"), "tourist pay page served");

const viaTourist = await fetch(`${cfg.touristUrl}/api/payments/${pay.id}`).then((r) => r.json());
ok(viaTourist.id === pay.id && !("bank" in (viaTourist.merchant || {})) && !("account_last4" in (viaTourist.merchant || {})), "tourist payment view hides bank details");

const redirect = await fetch(BASE + `/pay/${pay.id}`, { redirect: "manual" });
ok(redirect.status === 302, "old /pay links forward to the tourist app");

const paid = await call("POST", `/api/payments/${pay.id}/simulate`, { wallet: "alipay" });
ok(paid.status === "paid" && paid.nationality === "cn", `paid via Alipay, ref ${paid.reference}`);

const again = await call("GET", `/api/payments/${pay.id}`);
ok(again.status === "paid" && again.merchant?.name_lo, "status visible to merchant screen");

const d1 = await call("GET", `/api/merchants/${mid}/dashboard`);
ok(d1.total_kip === d0.total_kip + 50000, "dashboard total went up by 50,000");

const item = await call("POST", `/api/merchants/${mid}/menu`, { name_lo: "ໝວກສານ", price_kip: 40000 });
ok(item.id, `menu item added (translated by ${item.translated_by})`);
await call("DELETE", `/api/merchants/${mid}/menu/${item.id}`);
ok(true, "menu item removed");

const shops = await call("GET", "/api/shops");
ok(shops.length >= 5, `map shops: ${shops.length}`);
const pub = await call("GET", `/api/shops/${mid}`);
ok(pub.menu.length > 0 && !("account_last4" in pub) && !("phone" in pub), "public shop page: menu, no bank details");

const hist = await call("GET", `/api/merchants/${mid}/history?days=7`);
ok(hist.days.length === 7 && hist.items.length > 0, `7-day history: ${hist.count} sales`);

const rec = await call("GET", "/api/map/recommend?lat=19.8883&lng=102.1352&nat=cn&limit=5");
ok(rec.shops.length === 5 && rec.shops[0].score >= rec.shops[4].score && rec.shops.every((x) => Array.isArray(x.reasons)), `map recommendations ranked (top: ${rec.shops[0].names?.en})`);

const recT = await fetch(`${cfg.touristUrl}/api/map/recommend?lat=19.8883&lng=102.1352&nat=kr&cat=drinks`).then((r) => r.json());
ok(recT.shops.length > 0 && recT.shops.every((x) => x.category === "drinks"), "tourist app gets map picks filtered by category");

const loc = await call("PUT", `/api/merchants/${mid}/location`, { lat: pub.lat, lng: pub.lng });
ok(loc.lat === pub.lat && loc.open_from === pub.open_from && loc.open_to === pub.open_to, "shop location saved, opening hours kept");

const stand = await call("GET", `/api/merchants/${mid}/map`);
ok(stand.standing && stand.standing.by_nat.every((x) => x.rank >= 1), `shop map standing: ${stand.standing?.nearby} shops nearby`);

const tmap = await fetch(`${cfg.touristUrl}/map`);
ok(tmap.ok && (await tmap.text()).includes("tourist.js"), "tourist map page served");

const bad = await rawCall("POST", "/api/payments", { merchant_id: mid, amount_kip: 5 });
ok(bad.r.status === 400, "rejects amount under 1,000 kip");

await call("POST", "/api/auth/logout");
const afterLogout = await rawCall("GET", `/api/merchants/${mid}/dashboard`);
ok(afterLogout.r.status === 401, "logout revokes session (dashboard returns 401)");

console.log("All checks passed.");
