import { test, expect } from "@playwright/test";
import crypto from "node:crypto";

const MERCHANT_URL = process.env.MERCHANT_URL || "http://127.0.0.1:8787";
const TOURIST_URL = process.env.TOURIST_URL || "http://127.0.0.1:8788";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "e2e-local-webhook-secret";

// Kip-only product rule: never show foreign currency symbols or codes anywhere in UI text.
const FORBIDDEN_CURRENCY = /\b(USD|CNY|RMB|THB|VND|KRW|EUR)\b|[\$¥฿₫₩€]/;

async function stubAudioAndSpeech(page) {
  await page.addInitScript(() => {
    window.__spoken = [];
    window.PhalomAndroid = {
      speak(lo, th) { window.__spoken.push({ lo, th }); },
    };
  });
}

test("1. Two-device pay flow: shop creates 50,000 kip QR -> tourist pays Alipay -> shop sees paid & speaks Lao", async ({ browser }) => {
  const shopCtx = await browser.newContext({ timezoneId: "Asia/Vientiane" });
  const touristCtx = await browser.newContext({ timezoneId: "Asia/Vientiane" });
  const shop = await shopCtx.newPage();
  const tourist = await touristCtx.newPage();
  await stubAudioAndSpeech(shop);

  // Shop logs into demo shop
  await shop.goto(MERCHANT_URL);
  await expect(shop.locator("#demo")).toBeVisible();
  await shop.click("#demo");
  await expect(shop.locator("#today-kip")).toBeVisible();

  // Shop charges 50,000 kip via quick chip
  await shop.goto(`${MERCHANT_URL}/#/charge`);
  await shop.locator('[data-q="50000"]').click();
  await expect(shop.locator("#amt")).toHaveText("50,000");
  await shop.click("#mk");

  // QR screen appears with SVG QR on white and pay link
  await expect(shop.locator("svg.qr-svg")).toBeVisible();
  const payLink = await shop.locator('a[href*="/pay/"]').getAttribute("href");
  expect(payLink).toContain("/pay/");

  // Tourist opens the QR link on their phone
  await tourist.goto(payLink);
  await expect(tourist.locator(".bill")).toBeVisible();
  await expect(tourist.locator("body")).toContainText("50,000");
  await expect(tourist.locator("#go")).toBeVisible();

  // Tourist pays
  await tourist.click("#go");
  await expect(tourist.locator(".done-t")).toContainText("ຂອບໃຈ!");

  // Shop screen polls and transitions to "ໄດ້ຮັບເງິນແລ້ວ" with 50,000 kip
  await expect(shop.locator(".done")).toBeVisible({ timeout: 10_000 });
  await expect(shop.locator(".done")).toContainText("ໄດ້ຮັບເງິນແລ້ວ");
  await expect(shop.locator("#done-amt")).toHaveText("50,000");

  // Voice stub received the Lao spoken amount
  await expect.poll(async () => {
    const spoken = await shop.evaluate(() => window.__spoken);
    return spoken.map((s) => s.lo).join(" ");
  }, { timeout: 8_000 }).toContain("50,000 ກີບ");

  await shopCtx.close();
  await touristCtx.close();
});

test("2. Shop registration, terms/privacy acceptance, logout, failed login & valid login", async ({ page }) => {
  const uniquePhone = `020 55${String(Math.floor(100000 + Math.random() * 899999))}`;

  await page.goto(MERCHANT_URL);
  await expect(page).toHaveURL(/#\/welcome/);

  // Terms & Privacy links work before login
  await page.click('a[href="#/terms"]');
  await expect(page.locator(".legal-card")).toContainText("Phalom ບໍ່ແມ່ນທະນາຄານ");
  await page.goto(`${MERCHANT_URL}/#/privacy`);
  await expect(page.locator(".legal-card")).toContainText("PBKDF2-SHA256");

  // Register a brand new shop
  await page.goto(`${MERCHANT_URL}/#/register`);
  await page.fill("#r-name", "ຮ້ານກາເຟ ທົດສອບ");
  await page.fill("#r-last4", "4321");
  await page.fill("#r-phone", uniquePhone);
  await page.fill("#r-pin", "246810");
  await page.fill("#r-pin2", "246810");
  await page.check("#r-terms");
  await page.click("#r-go");

  // Lands on home dashboard showing shop name and masked bank last4 only
  await expect(page).toHaveURL(/#\/home/, { timeout: 10_000 });
  await expect(page.locator("body")).toContainText("ຮ້ານກາເຟ ທົດສອບ");
  await expect(page.locator("body")).toContainText("•••• 4321");

  // Close welcome sheet if present, go to settings and log out
  await page.goto(`${MERCHANT_URL}/#/me`);
  await expect(page.locator("#t-pin")).toBeVisible();
  await page.click("#t-out");
  await page.click(".sheet #yes");
  await expect(page).toHaveURL(/#\/welcome/);

  // Login with wrong PIN shows Lao error
  await page.goto(`${MERCHANT_URL}/#/login`);
  await page.fill("#l-phone", uniquePhone);
  await page.fill("#l-pin", "000000");
  await page.click("#l-go");
  await expect(page.locator(".toast")).toContainText("ບໍ່ຖືກຕ້ອງ");

  // Login with correct PIN succeeds
  await page.fill("#l-pin", "246810");
  await page.click("#l-go");
  await expect(page).toHaveURL(/#\/home/, { timeout: 10_000 });
  await expect(page.locator("body")).toContainText("ຮ້ານກາເຟ ທົດສອບ");
});

test("3. Kip-only policy across both merchant and tourist apps", async ({ page }) => {
  await page.goto(MERCHANT_URL);
  await page.click("#demo");
  await expect(page.locator("#today-kip")).toBeVisible();

  for (const hash of ["#/home", "#/history", "#/items", "#/charge", "#/me"]) {
    await page.goto(`${MERCHANT_URL}/${hash}`);
    await page.waitForTimeout(300);
    const txt = await page.locator("#app").innerText();
    expect(txt, `Forbidden currency found on merchant ${hash}`).not.toMatch(FORBIDDEN_CURRENCY);
  }

  for (const p of ["/", "/map"]) {
    await page.goto(`${TOURIST_URL}${p}`);
    await page.waitForTimeout(400);
    const txt = await page.locator("#app").innerText();
    expect(txt, `Forbidden currency found on tourist ${p}`).not.toMatch(FORBIDDEN_CURRENCY);
  }
});

test("4. Products: add Lao item, charge by picking products, and delete item", async ({ page }) => {
  await page.goto(MERCHANT_URL);
  await page.click("#demo");
  await expect(page.locator("#today-kip")).toBeVisible();

  await page.goto(`${MERCHANT_URL}/#/items`);
  await page.click("#add");
  await page.fill("#i-n", "ໝວກສານທົດສອບ");
  await page.fill("#i-p", "45000");
  await page.click("#i-go");
  await expect(page.locator("#app")).toContainText("ໝວກສານທົດສອບ");

  // Charge by picking product
  await page.goto(`${MERCHANT_URL}/#/charge`);
  await page.click('[data-mode="items"]');
  await page.locator('.ipick', { hasText: "ໝວກສານທົດສອບ" }).click();
  await expect(page.locator("#amt")).toHaveText("45,000");

  // Clean up: delete the item
  await page.goto(`${MERCHANT_URL}/#/items`);
  const row = page.locator(".item", { hasText: "ໝວກສານທົດສອບ" });
  await row.locator("[data-del]").click();
  await page.click(".sheet #yes");
  await expect(page.locator("#app")).not.toContainText("ໝວກສານທົດສອບ");
});

test("5. Tourist languages, map recommendations, category filter, and legal pages", async ({ page }) => {
  await page.goto(TOURIST_URL);
  for (const lang of ["en", "zh", "th", "vi", "ko", "lo"]) {
    await page.click(`[data-l="${lang}"]`);
    const txt = await page.locator("#app").innerText();
    expect(txt).not.toContain("undefined");
  }

  // Legal pages on tourist app
  await page.goto(`${TOURIST_URL}/privacy`);
  await expect(page.locator("#app")).toContainText("phalom.payment@gmail.com");

  // Map recommendations & category filter
  await page.goto(`${TOURIST_URL}/map`);
  await expect(page.locator(".rec").first()).toBeVisible({ timeout: 10_000 });
  await page.click('[data-c="food"]');
  await expect(page.locator(".rec").first()).toBeVisible();
});

test("6. Production partner webhook confirms pending QR on merchant screen", async ({ page, request }) => {
  await page.goto(MERCHANT_URL);
  await page.click("#demo");
  await expect(page.locator("#today-kip")).toBeVisible();

  await page.goto(`${MERCHANT_URL}/#/charge`);
  await page.locator('[data-q="100000"]').click();
  await page.click("#mk");
  await expect(page.locator("svg.qr-svg")).toBeVisible();

  const pid = page.url().split("/qr/")[1];
  const raw = JSON.stringify({ payment_id: pid, wallet: "wechat", reference: "PARTNER-LIVE-777" });
  const sig = crypto.createHmac("sha256", WEBHOOK_SECRET).update(raw).digest("hex");

  const wh = await request.post(`${MERCHANT_URL}/api/webhooks/payment`, {
    data: raw,
    headers: { "content-type": "application/json", "x-phalom-signature": sig },
  });
  expect(wh.status()).toBe(200);

  await expect(page.locator(".done")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("#done-amt")).toHaveText("100,000");
  await expect(page.locator(".done")).toContainText("PARTNER-LIVE-777");
});
