# Phalom

Merchant app for small souvenir and street-food vendors in Laos. Tourists pay with the app they already use (Alipay, WeChat Pay, PromptPay, VietQR, UnionPay). The vendor receives kip and hears "ໄດ້ຮັບເງິນ 50,000 ກີບ".

**Lao kip only.** By policy the app shows no other currency anywhere. The tourist's own wallet (Alipay, WeChat Pay, PromptPay, VietQR) handles any exchange.

**Payments are a demo.** No money moves. In production, the payment confirmation would come from our licensed payment partner, PhaJay, through the signed webhook. Phalom never holds funds.

## What runs where

| Part | Where | What it does |
|---|---|---|
| Merchant app (`public/index.html`, `merchant.js`, `merchant.css`) | Worker `phalom` static assets, https://phalom.phalom-payment.workers.dev | Plain-Lao shop app: live sales today and 7-day chart, charge by keypad or by picking products, one QR for every wallet, chime and Lao voice when money arrives (from any QR), sales history, products with AI translation, a printable shop QR poster, bank account and settings, shop sign-up |
| Tourist demo app (`tourist/`) | Worker `phalom-tourist`, https://phalom-tourist.phalom-payment.workers.dev | Opens from a payment QR (`/pay/<id>`) or a shop poster QR (`/shop/<id>`). English, Chinese, Thai, Vietnamese, Korean; price in kip only; pick a wallet and pay (demo). Its `/api/*` and `/shared/*` go to `phalom` through a service binding |
| Shared design (`public/shared/`) | Served by `phalom`, also used by the tourist app | Lao design system: colours, sinh textile band, champa, kanok QR frame, Luang Prabang scene, about 50 glyph icons, sound and QR helpers |
| API (`src/worker.ts`) | Cloudflare Worker | JSON API. It translates Lao names with **Workers AI** (`@cf/meta/m2m100-1.2b`) |
| Android app (`android/`, built by `scripts/build-apk.sh`) | The phone | Opens the merchant app full screen, reads payments aloud with Android text-to-speech, and includes an offline demo |
| Database (`supabase/migrations`) | Supabase Postgres | Tables for merchants, menu items and payments, plus SQL functions. RLS is on, nothing can be read with the anon key, and only the Worker can call the database (it uses the service role key) |

### API

```
GET    /api/health                      database check
GET    /api/config                      demo shop id, wallets, currency (always LAK)
POST   /api/merchants                   register a shop {name_lo, category, market, bank, account_last4, phone}
GET    /api/merchants/:id
GET    /api/merchants/:id/dashboard     today's sales (Asia/Vientiane day)
GET    /api/merchants/:id/menu
POST   /api/merchants/:id/menu          {name_lo, price_kip} → auto-translated
DELETE /api/merchants/:id/menu/:item
POST   /api/payments                    {merchant_id, amount_kip} → QR link <TOURIST_URL>/pay/:id
GET    /api/payments/:id                the merchant screen polls this
POST   /api/payments/:id/simulate       {wallet} demo payment
POST   /api/webhooks/payment            partner confirmation, HMAC-SHA256 in X-Phalom-Signature
GET    /api/shops                       shops for the tourist app
GET    /api/shops/:id                   public shop page + menu (no bank details)
GET    /api/merchants/:id/history?days= daily totals and recent sales (Vientiane days)
PUT    /api/merchants/:id/location       {lat, lng, open_from?, open_to?}  pin the shop and set opening hours (minutes after midnight)
GET    /api/merchants/:id/map            the shop's pin and its rank for visitors from each country among shops within 2 km
GET    /api/map/recommend?lat=&lng=&nat=&cat=&limit=   shops ranked for this tourist (see below)
```

## Map and recommendations

Both apps show shops on Google Maps. The shop app is also a full web app on a computer (sidebar, two-column dashboard); phones keep the one-hand layout.

- Google Maps is used without an API key: the standard embed (one pin per map) and the official links that open walking directions in the Google Maps app. With a Maps JavaScript API key (Google Cloud, billing account required) the map could show every Phalom shop as a pin at once.
- Ranking runs in the Worker (`src/recommend.ts`), from facts Postgres hands over (`map_shops()` in migration 0004): distance (falls off over ~1.5 km) 40%, share of the shop's buyers from the tourist's country 25%, open now 15%, rating 10%, small shops with few sales 10%. Each pick carries its reasons (loved, open/closed, near, top, gem, busy), which the tourist app shows as chips in five languages.
- Migration 0004 also adds 8 example shops (Luang Prabang, Kuang Si, Ban Phanom, Vang Vieng, Vientiane) and their past sales (reference DEMO-M…).

## Deploy

You need a Cloudflare account (the free plan is enough) and a Supabase project (the free plan is enough).

You need two tokens: a Cloudflare API token ("Edit Cloudflare Workers" template plus Workers AI) and a Supabase personal access token. `scripts/resolve-env.mjs` uses them to find the Cloudflare account, register a workers.dev subdomain if there is none, pick (or create, in Singapore) the Supabase project named `phalom`, wake it if it is paused, and read its service key.

```bash
npm install
export CLOUDFLARE_API_TOKEN=...
export SUPABASE_ACCESS_TOKEN=...
./scripts/deploy.sh
```

The script creates the tables, deploys the Worker, stores the Supabase URL and key as Worker secrets, prints `https://phalom.<your-subdomain>.workers.dev`, runs the end-to-end check against it, and rebuilds the Android app with that address. To skip a lookup, set `CLOUDFLARE_ACCOUNT_ID`, `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` yourself. Without a Supabase access token, set all three, run `supabase/migrations/0001_init.sql` and `0002_seed.sql` in the Supabase SQL editor, and add `SKIP_DB=1`.

To log in with your browser instead of using a token, run `npx wrangler login`, then `npx wrangler deploy`, then `npx wrangler secret put SUPABASE_URL` and `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY`.

## Install on an Android phone

There are two ways. Both open the same app and talk to the same server.

**APK (`out/Phalom.apk`).** Copy the file to the phone (Google Drive, Telegram, USB), tap it, and allow "Install unknown apps" for the app you opened it from. If Play Protect warns about an unknown developer, tap **More details** and then **Install anyway**. On first launch the app asks for the server address (`https://phalom.<you>.workers.dev`) or offers an offline demo with sample data. It reads incoming payments aloud with Android text-to-speech: a Lao voice when the phone has one, otherwise Thai.

To bake the server address in so nobody has to type it:

```bash
SERVER_URL=https://phalom.<you>.workers.dev ./scripts/build-apk.sh   # → out/Phalom.apk
```

The script needs only a JDK (17+), curl and unzip on Linux or macOS. It downloads aapt2 and Android 16 resources (Apktool 3.0.3), android.jar, dx and Google's apksig from Maven Central, checks each SHA-1, and signs with APK Signature Scheme v2 (Android 7.0 and newer; target SDK 35). `android/phalom-demo.p12` is a demo signing key with the password `phalom-demo`. Keep it, because an update installs over the old app only when it is signed with the same key. Make your own key before any real release.

**Install from Chrome (no file needed).** Open the deployed address in Chrome on the phone, tap ⋮, then **Install app** (or the install bar in the app). This uses `manifest.webmanifest` and `sw.js`, so the app gets a home-screen icon, opens full screen, and still opens without signal.

## Run locally (no cloud accounts)

```bash
npm install
# Postgres 16 on port 54322 with the migrations applied, then:
DATABASE_URL=postgres://postgres@127.0.0.1:54322/postgres npm run local-db   # stands in for Supabase's REST RPC endpoint
printf 'SUPABASE_URL=http://127.0.0.1:54321\nSUPABASE_SERVICE_ROLE_KEY=local\n' > .dev.vars
npm run dev            # http://127.0.0.1:8787 (Workers AI is skipped locally)
npm run smoke          # end-to-end check
```

## Live demo script (pitch section 8)

1. Open the app on the laptop and show today's sales by nationality.
2. Tap **ຮັບເງິນ** and enter 50,000. The price stays in kip.
3. Tap **ສະແດງ QR**. A teammate scans the code with their phone camera, the checkout opens in Chinese, and they tap 确认付款.
4. The laptop chimes and says the amount. Then show the shop map and switch languages.

Keyboard shortcuts: **S** shows the QR code or simulates a scan, **H** goes home, **P** opens Receive, **M** opens the map. If the room has no signal, use the simulate buttons under the QR code.
