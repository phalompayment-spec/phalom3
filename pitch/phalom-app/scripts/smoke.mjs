// End-to-end check against a running app: BASE=http://127.0.0.1:8787 node scripts/smoke.mjs
const BASE = process.env.BASE || "http://127.0.0.1:8787";
const call = async (method, p, body) => {
  const r = await fetch(BASE + p, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`${method} ${p} -> ${r.status} ${JSON.stringify(j)}`);
  return j;
};
const ok = (cond, msg) => { if (!cond) throw new Error("FAILED: " + msg); console.log("✓", msg); };

const health = await call("GET", "/api/health"); ok(health.ok, `health (shops: ${health.shops}, ai: ${health.ai})`);
const cfg = await call("GET", "/api/config"); ok(cfg.demoMerchantId && cfg.currency === "LAK" && !("rates" in cfg), "config: Lao kip only, no exchange rates");
ok(/^https?:\/\//.test(cfg.touristUrl), `tourist app: ${cfg.touristUrl}`);
const mid = cfg.demoMerchantId;
const d0 = await call("GET", `/api/merchants/${mid}/dashboard`); ok(d0.count > 0, `dashboard: ${d0.count} sales, ${d0.total_kip} kip`);
const pay = await call("POST", "/api/payments", { merchant_id: mid, amount_kip: 50000 }); ok(pay.status === "pending" && pay.amount_kip === 50000 && !("fx" in pay), "payment created: 50,000 kip, no other currency");
ok(pay.pay_url.startsWith(cfg.touristUrl + "/pay/"), "payment QR opens the tourist app");
const page = await fetch(pay.pay_url); ok(page.ok && (await page.text()).includes("tourist.js"), "tourist pay page served");
const viaTourist = await fetch(`${cfg.touristUrl}/api/payments/${pay.id}`).then((r) => r.json()); ok(viaTourist.id === pay.id, "tourist app reaches the shared API");
const redirect = await fetch(BASE + `/pay/${pay.id}`, { redirect: "manual" }); ok(redirect.status === 302, "old /pay links forward to the tourist app");
const paid = await call("POST", `/api/payments/${pay.id}/simulate`, { wallet: "alipay" }); ok(paid.status === "paid" && paid.nationality === "cn", `paid via Alipay, ref ${paid.reference}`);
const again = await call("GET", `/api/payments/${pay.id}`); ok(again.status === "paid" && again.merchant?.name_lo, "status visible to merchant screen");
const d1 = await call("GET", `/api/merchants/${mid}/dashboard`); ok(d1.total_kip === d0.total_kip + 50000, "dashboard total went up by 50,000");
const item = await call("POST", `/api/merchants/${mid}/menu`, { name_lo: "ໝວກສານ", price_kip: 40000 }); ok(item.id, `menu item added (translated by ${item.translated_by})`);
await call("DELETE", `/api/merchants/${mid}/menu/${item.id}`); ok(true, "menu item removed");
const shops = await call("GET", "/api/shops"); ok(shops.length >= 5, `map shops: ${shops.length}`);
const pub = await call("GET", `/api/shops/${mid}`); ok(pub.menu.length > 0 && !("account_last4" in pub) && !("phone" in pub), "public shop page: menu, no bank details");
const hist = await call("GET", `/api/merchants/${mid}/history?days=7`); ok(hist.days.length === 7 && hist.items.length > 0, `7-day history: ${hist.count} sales`);
const rec = await call("GET", "/api/map/recommend?lat=19.8883&lng=102.1352&nat=cn&limit=5"); ok(rec.shops.length === 5 && rec.shops[0].score >= rec.shops[4].score && rec.shops.every((x) => Array.isArray(x.reasons)), `map recommendations ranked (top: ${rec.shops[0].names?.en})`);
const recT = await fetch(`${cfg.touristUrl}/api/map/recommend?lat=19.8883&lng=102.1352&nat=kr&cat=drinks`).then((r) => r.json()); ok(recT.shops.length > 0 && recT.shops.every((x) => x.category === "drinks"), "tourist app gets map picks filtered by category");
const loc = await call("PUT", `/api/merchants/${mid}/location`, { lat: pub.lat, lng: pub.lng }); ok(loc.lat === pub.lat && loc.open_from === pub.open_from && loc.open_to === pub.open_to, "shop location saved, opening hours kept");
const stand = await call("GET", `/api/merchants/${mid}/map`); ok(stand.standing && stand.standing.by_nat.every((x) => x.rank >= 1), `shop map standing: ${stand.standing?.nearby} shops nearby`);
const tmap = await fetch(`${cfg.touristUrl}/map`); ok(tmap.ok && (await tmap.text()).includes("tourist.js"), "tourist map page served");
const app = await fetch(BASE + "/").then((r) => r.text()); ok(app.includes("merchant.js"), "merchant app served");
const bad = await fetch(BASE + "/api/payments", { method: "POST", body: JSON.stringify({ merchant_id: mid, amount_kip: 5 }) }); ok(bad.status === 400, "rejects amount under 1,000 kip");
console.log("All checks passed.");
