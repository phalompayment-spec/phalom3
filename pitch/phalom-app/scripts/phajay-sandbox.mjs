// Try PhaJay's SANDBOX (no real money). The key comes only from the environment, never from this repo:
//   export PHAJAY_TEST_KEY=...            # Test Key from https://portal.phajay.co → Key Management
//   node scripts/phajay-sandbox.mjs qr bcel 10000      # make a test QR (sandbox banks: jdb ldb ib bcel; stb/apb/m-money are 404 in sandbox)
//   node scripts/phajay-sandbox.mjs link 10000         # make a test payment link (hosted bank-choice page)
//   node scripts/phajay-sandbox.mjs status <transactionId>   # REAL transactions only: sandbox ones answer PAYMENT_NOT_FOUND (tested 2026-10-23)
//   add --wait after qr to poll status for 5 min (only useful with a live key)
// Pay sandbox QRs with the PhaJay test app (https://payment-doc.phajay.co/v1/sandbox/phajay-app), not a real bank app.
import { mkdirSync, writeFileSync } from "node:fs";

const API = "https://payment-gateway.phajay.co/v1/api";
const KEY = process.env.PHAJAY_TEST_KEY;
if (!KEY) { console.error("Set PHAJAY_TEST_KEY first (Test Key from portal.phajay.co → Key Management)."); process.exit(1); }
const basic = "Basic " + Buffer.from(KEY).toString("base64");

const call = async (method, path, headers, body) => {
  const r = await fetch(API + path, { method, headers: { "Content-Type": "application/json", ...headers }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => null);
  console.log(`${method} ${path} -> HTTP ${r.status}`);
  console.log(JSON.stringify(j, null, 2));
  return j;
};
const status = (id) => call("GET", `/payment/check-transaction/status/${id}`, { Authorization: basic });

// Opens in a browser so the phone can scan it; out/ is gitignored.
const qrPage = (text, title) => {
  mkdirSync("out", { recursive: true });
  const file = `out/phajay-qr.html`;
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font:16px sans-serif;text-align:center">
<h2>${title}</h2><div id="q" style="display:inline-block;padding:16px;background:#fff"></div><p style="word-break:break-all;max-width:600px;margin:auto">${text}</p>
<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
<script>new QRCode(document.getElementById("q"),{text:${JSON.stringify(text)},width:320,height:320})</script>`);
  console.log(`\nQR page: ${process.cwd()}/${file}  (open it, scan with the PhaJay test app)`);
};

const waitPaid = async (id) => {
  console.log(`\nWaiting for payment of ${id} (checks every 5 s, up to 5 min, Ctrl+C to stop)...`);
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const r = await fetch(`${API}/payment/check-transaction/status/${id}`, { headers: { Authorization: basic } }).then((x) => x.json()).catch(() => null);
    const d = r?.data;
    process.stdout.write(`  ${new Date().toLocaleTimeString()} status=${d?.status ?? r?.message} isPaid=${d?.isPaid}\n`);
    if (d?.isPaid && d?.status === "PAYMENT_COMPLETED") { console.log("\nPAID:"); console.log(JSON.stringify(r, null, 2)); return; }
  }
  console.log("Gave up waiting.");
};

const [cmd, a, b] = process.argv.slice(2).filter((x) => x !== "--wait");
const orderNo = `PHALOM-TEST-${Date.now()}`;
if (cmd === "qr") {
  const bank = (a || "bcel").toLowerCase(), amount = Number(b || 10000);
  // BCEL: no Lao/Thai text in description; APB: under 25 chars. Plain ASCII keeps every bank happy.
  const j = await call("POST", `/test/payment/generate-${bank}-qr`, { secretKey: KEY }, { amount, description: "PHALOM TEST", orderNo, tag1: "phalom-sandbox" });
  if (j?.qrCode) { qrPage(j.qrCode, `PhaJay sandbox ${bank.toUpperCase()} ${amount.toLocaleString()} kip`); if (process.argv.includes("--wait")) await waitPaid(j.transactionId); }
} else if (cmd === "link") {
  const j = await call("POST", "/test/payment/get-payment-link", { Authorization: basic }, { orderNo, amount: Number(a || 10000), description: "PHALOM TEST", tag1: "phalom-sandbox" });
  if (j?.redirectURL) console.log(`\nOpen: ${j.redirectURL}`);
} else if (cmd === "status" && a) {
  await status(a);
} else {
  console.log("Usage: node scripts/phajay-sandbox.mjs qr <jdb|ldb|ib|bcel> <kip> [--wait] | link <kip> | status <transactionId>");
}
