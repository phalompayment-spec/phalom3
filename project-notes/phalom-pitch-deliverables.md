---
name: phalom-pitch-deliverables
description: Where the Phalom deck/prototype live and which pitch figures were verified (2026-10-14)
metadata:
  type: project
  modified: 2026-10-14T10:11:44.460Z
---

Delivered 2026-10-14 (thread "Phalom pitch deck and prototype"):
- Deck: /mnt/project-files/pitch/Phalom_Pitch.pptx (+ .pdf), 17 slides in Lao, font Noto Sans Lao (theme cs/Laoo font must be set or Lao falls back to a bad font), script as speaker notes. Generator: /mnt/project-files/pitch/deck-src (`DEMO_URL=<live url> bash run.sh` puts the live link/QR on slides 8 and 15; copy the folder locally first).
- Prototype artifact: https://claude.ai/artifact/SZsfm7MnAFGxeJj732HUgM (source copy /mnt/project-files/pitch/phalom-app-prototype.html). Keys S/H/P/M; QR opens #pay-<amount> tourist checkout that signals the shop screen via `room`.
- Verified: 2025 arrivals 4,580,709 (+11%), TH+CN+VN 82.3% (KPL 01/2026); 2024 tourist revenue USD 1,421,992,819 (TDD Statistical Report 2024, table 7). LOCA Pay fee 3% + 5,000 LAK, needs LOCA app. PhaJay supports Alipay/WeChat. Cross-border QR: TH 07/2024 (Krungsri), CN UnionPay–LAPNet 12/2024, VN 01/2025.
- Team estimates (labelled as such): SAM $44M = 1,422 × 80.5% × ~55% × ~7%; SOM $3.5M = 700 shops × 5 tx × 365 × ~61,500 kip; ~0.4% revenue share → 36–40k kip/shop/month.

Related: [[MEMORY]]

Real app (user asked 2026-10-14 10:01: real backend, Cloudflare + Supabase, payments may be demo):
- Source: /mnt/project-files/pitch/phalom-app/ (also phalom-app.zip). Cloudflare Worker (src/worker.ts, static assets in public/, Workers AI m2m100 for Lao→zh/th/vi/en) + Supabase SQL functions (supabase/migrations). `scripts/deploy.sh` deploys; `scripts/smoke.mjs` checks end to end. Tested locally with Postgres 16 + scripts/local-supabase.mjs shim.
- DEPLOYED 2026-10-14 17:41: https://phalom.phalom-payment.workers.dev (Worker "phalom"; Supabase project "phalom", Singapore, ref gixxaiqtfzgecultcamr). Live smoke test passed. Keys live only as env vars "cloudflare" / "supabase" in the user's cloud environment (export as CLOUDFLARE_API_TOKEN / SUPABASE_ACCESS_TOKEN). Gotchas: Cloudflare API throttles often (code 971), retry; new Worker secrets took ~5 min to reach the edge (deploy.sh now waits for /api/health); Maven Central can 429 during the APK build, retry. User's CF account also has an unrelated Worker "talat-pay-test" (leave it).
- 2026-10-14 20:20 TWO APPS (user asked 19:40: real-world merchant app + separate tourist demo app, Lao look, glyphs, light theme; 19:44 "don't spend too much effort on tourist app"): shop app = Worker "phalom" https://phalom.phalom-payment.workers.dev (public/index.html, merchant.js, merchant.css); tourist app = Worker "phalom-tourist" https://phalom-tourist.phalom-payment.workers.dev (tourist/, service binding API->phalom for /api and /shared). Shared Lao design in public/shared (lao.css, glyphs.js, core.js). pay_url uses TOURIST_URL var. Migration 0003 = merchant_history + ensure_demo_week. Screens for slides: pitch/screens-v2/. Deck slide 8 has both QRs; run.sh needs DEMO_URL and TOURIST_URL.
- APK and first deck (live link + QR on slide 8 and closing slide 15) rebuilt with the live URL 17:43.

Android (user asked 2026-10-14 10:07 "must be ready to install in my android phone"):
- APK: /mnt/project-files/pitch/Phalom.apk (la.phalom.app, minSdk 24, target 35, v2-signed, WebView wrapper + Android TTS bridge window.PhalomAndroid + offline demo of the prototype). First launch asks for server URL. Rebuild with `SERVER_URL=<workers.dev url> ./scripts/build-apk.sh` (deploy.sh does this automatically). Keep android/phalom-demo.p12 (demo key, pw phalom-demo) so updates install over the old app.
- Toolchain all from Maven Central via scripts/build-apk.sh (see script comments).
- Not tested on a real device (no emulator here).

