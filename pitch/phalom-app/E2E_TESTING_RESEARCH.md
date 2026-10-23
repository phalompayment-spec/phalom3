# End-to-end (e2e) testing for the client side: research

Written 23 Oct 2026. This is research only. Nothing here is built yet.

"Client side" here means the three things people actually touch:

- the shop app (`public/`: `merchant.js` with hash routes, polling every 4 s, chime and Lao voice, QR, map, service worker for offline use)
- the tourist app (`tourist/public/tourist.js`: five languages, camera QR scan with `BarcodeDetector`, geolocation, pick a wallet and pay)
- the Android app (`android/`: a WebView around the shop app, with a `PhalomAndroid` JavaScript bridge for text-to-speech)

## What we have today

- `scripts/smoke.mjs` is an **API-level** end-to-end check with 24 steps (create payment → simulate → dashboard goes up, menu, map, history, kip only). `deploy.sh` runs it after each deploy.
- **No browser tests.** Nothing opens a page, clicks a button or checks that the Lao text, the QR code or the "paid" screen actually appear.
- **No CI.** Tests run only when someone deploys by hand.
- Good news: local runs need no cloud accounts. `scripts/local-supabase.mjs` and a plain Postgres 16 stand in for Supabase, and the migrations already skip the Supabase-only roles when they don't exist. Workers AI is skipped locally, so translation falls back to "manual".

## Recommendation: Playwright

| | Playwright | Cypress | WebdriverIO / Appium |
|---|---|---|---|
| Shop + tourist in **one test** (two origins, two "phones") | Yes. Two browser contexts in the same test, natively | Hard. One tab only, other origins need `cy.origin` | Possible, heavier |
| Browsers | Chromium, Firefox, **WebKit (Safari engine)** | Chromium, Firefox, WebKit experimental | All WebDriver browsers + native mobile |
| Phone emulation, geolocation, timezone, offline, permissions | Built in (`devices[...]`, `geolocation`, `timezoneId`, `offline`, `permissions`) | Partly, often via plugins | Yes |
| Fake timers for the 4 s polling | Built in (`page.clock`) | Built in (`cy.clock`) | Manual |
| Android WebView | Experimental (`_android`, needs ADB + emulator) | No | Yes (Appium), the most complete |
| Parallel runs | Free, built in | Free locally, parallel in CI is a paid cloud feature | Free |
| Cost | Free, open source (Apache 2.0) | Free runner; Cypress Cloud is paid | Free |

Why Playwright fits Phalom best:

1. **The core flow is two people on two devices.** The shop shows a QR, the tourist pays, the shop hears "ໄດ້ຮັບເງິນ". Playwright can open the shop app and the tourist app side by side in one test and check that the shop screen turns to "paid". This is the most valuable test we can have, and it's awkward in Cypress.
2. **WebKit.** Many Chinese and Korean tourists use iPhones. Playwright's WebKit build lets us check the tourist app with the Safari engine on Linux, for free.
3. It is the most used e2e tool today (current version 1.64), with trace viewer, video and screenshots for failed tests, so a non-expert teammate can see *what* broke.

Use WebdriverIO + Appium only later, if we need to test the native Android parts (the TTS bridge, the setup screen) automatically. For now a short manual checklist on a real phone is cheaper (see below).

## How the tests would reach a server

Three layers, from most to least used:

1. **Full stack on the CI machine (main suite).** Postgres 16 as a GitHub Actions service container → apply `supabase/migrations/*.sql` → `local-supabase.mjs` → `wrangler dev -c wrangler.local.toml` (port 8787) and a second `wrangler dev` for the tourist worker (port 8788). Separate `wrangler dev` sessions now reach each other through service bindings (Cloudflare changelog, Sep 2025). No Cloudflare or Supabase account and no secrets needed. Each run starts from a fresh database, so tests are repeatable.
2. **Mocked API (`page.route`) for edge cases** that are hard to cause for real: server error, slow network, payment stuck in "pending", a 400 for an amount under 1,000 kip. Fast and no database.
3. **Live site after deploy (small, read-mostly).** Open both live apps and check that they load, Lao text renders and the QR shows. Keep the full pay flow off the live site: every run would add fake sales to the demo shop that judges and partners may look at. `smoke.mjs` already covers the live API.

## Browser features the app uses, and how to test each

| Feature | Where | In tests |
|---|---|---|
| Polling every 4 s, QR status timer | `merchant.js:51`, `:330` | `page.clock.install()` + `runFor()` so tests don't wait in real time |
| Chime (`AudioContext`) and voice (`speechSynthesis`, `/voice`) | `shared/core.js` | Headless has no speakers. Stub them with `addInitScript` and check the **text** we would speak (e.g. contains "50,000 ກີບ"). Real sound stays a manual check |
| Geolocation | `tourist.js:83`, `merchant.js:504` | `geolocation: {latitude: 19.8883, longitude: 102.1352}` (Luang Prabang) + `permissions: ['geolocation']`; also test "permission denied" |
| Camera QR scan (`BarcodeDetector`, `getUserMedia`) | `tourist.js:173` | Chrome on Linux has no `BarcodeDetector`, so the CI browser takes the "no camera" path. Test that fallback, test the pay flow by opening the `/pay/<id>` link directly, and stub `BarcodeDetector` to return a URL for the happy path. Real scanning in sunlight stays a manual phone check |
| Share / clipboard | `merchant.js:327` | `permissions: ['clipboard-read','clipboard-write']`, read the copied link back |
| Offline (service worker `phalom-v11`) | `public/sw.js` | `context.setOffline(true)` after the first load, reload, check the app shell still opens. Needs `serviceWorkers: 'allow'` (the default) |
| Lao fonts | Google Fonts (Noto Sans Lao) | Fine in CI (network on). For screenshot tests, wait for `document.fonts.ready`. The CI machine has no Lao system font, so a missing web font would show boxes, which is a real bug worth catching |
| Time zone (sales "today" is a Vientiane day) | dashboard/history | `timezoneId: 'Asia/Vientiane'`, plus one test near midnight with `page.clock.setFixedTime` |
| Phone vs computer layout | merchant app sidebar on desktop | Two projects: `devices['Pixel 7']` (Chromium) and desktop Chrome. Tourist app also on `devices['iPhone 15']` (WebKit) |

## First tests to write (about 8, in priority order)

1. **Pay flow, two devices:** shop enters 50,000 → QR shows → tourist page opens from the QR link → picks Alipay → pays (simulate) → shop screen shows paid, total goes up by 50,000, voice stub got the Lao amount.
2. **Kip only:** no other currency or exchange rate appears anywhere in either app (scan page text for `$`, `¥`, `฿`, `USD`, `CNY`, `THB`). This is a product rule.
3. **Tourist languages:** switch through en/zh/th/vi/ko; the price stays in kip; no missing-translation keys shown.
4. **Shop sign-up:** fill the form, land on the dashboard; bank shows last 4 digits only.
5. **Products:** add an item in Lao, it shows in the shop and on the tourist shop page; delete it.
6. **Charge by picking products** instead of the keypad.
7. **Map:** tourist at Luang Prabang gets ranked shops with reason chips; category filter works.
8. **Offline:** shop app opens without network after one visit.

Then add mocked-API tests for errors (server down, amount < 1,000 kip, payment never confirmed).

## CI and cost

- GitHub Actions is **free for public repositories** (this repo is public), and GitHub's 2026 price changes did not change that. So the whole setup costs nothing.
- Run on every push to `main`: install, start Postgres + both workers, run Playwright in Chromium (+ WebKit for the tourist app). Expected a few minutes per run; Playwright browser download is the slowest step (cache it).
- On failure, keep the HTML report and traces as a build artifact so anyone can open it and see the step that broke.
- The suite needs no secrets. Never give CI the production Supabase key just to run tests.

## Android app

- Playwright can attach to an Android WebView (`_android`, experimental) on an emulator through ADB, but the app would need `WebView.setWebContentsDebuggingEnabled(true)` in a debug build, and it can't touch native screens. Setting up an Android emulator in CI is slow and fiddly.
- Since the WebView loads the same shop app, the browser tests above already cover most of it. Recommended for now: a short **manual checklist on a real Android phone** before each release (install the APK, sound and Lao voice, scan a QR in sunlight, weak signal, offline demo). BUSINESS.md already lists this as a go-live item.
- Revisit automated Android testing once there are real shops.

## Things that will change the tests later

- **Shop login** (a go-live item): tests will need a login step. Plan for it now: one setup test logs in and saves the session (`storageState`), and the one-time code is read from a test-only endpoint or a fixed code in the local stack only.
- **Removing the demo paths:** the pay flow test uses `POST /api/payments/:id/simulate`. In production that route goes away, so the tests should instead send a correctly signed webhook (`POST /api/webhooks/payment` with `X-Phalom-Signature`) using a test secret in the local stack. This tests the real PhaJay path better anyway.
- **Real PhaJay:** never call PhaJay from CI tests. Use the webhook as above; keep `scripts/phajay-sandbox.mjs` as a separate manual check.

## Estimated effort

- Setup (Playwright config, CI workflow with Postgres + two workers, stubs for audio/speech/camera): about 1 day.
- The first 8 tests: about 1 to 2 days.
- Adding `data-testid` attributes in `merchant.js`/`tourist.js` where Lao text alone makes selectors fragile: small, can be done alongside.

These are rough guesses for Claude doing the work, not measured.

## Decisions for the team

1. Go ahead with Playwright + GitHub Actions (free)?
2. Run browser tests against the live demo site after deploy (light checks only), or local stack only?
3. Automate Android now, or keep a manual phone checklist until real shops sign up? (Recommended: manual for now.)

## Sources

- Playwright release notes (1.64 current): https://playwright.dev/docs/release-notes
- Playwright emulation (devices, geolocation, timezone, permissions, offline): https://playwright.dev/docs/emulation
- Playwright clock: https://playwright.dev/docs/clock
- Playwright Android (experimental): https://playwright.dev/docs/api/class-android
- Cloudflare: developing with multiple Workers: https://developers.cloudflare.com/workers/development-testing/multi-workers
- Cloudflare changelog, cross-session service bindings (Sep 2025): https://developers.cloudflare.com/changelog/2025-09-23-wrangler-dev-multi-config-cross-command-support/
- GitHub Actions 2026 pricing (public repos stay free): https://resources.github.com/actions/2026-pricing-changes-for-github-actions/
- Chrome Shape Detection API (BarcodeDetector platforms): https://developer.chrome.com/docs/capabilities/shape-detection
- Tool comparisons (vendor blogs, opinion): https://www.browserstack.com/guide/webdriverio-vs-playwright-2026, https://testdino.com/blog/playwright-alternatives
