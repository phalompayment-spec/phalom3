# Phalom: from pitch to real business

Written 22 Oct 2026, after Phalom won 1st place. The pitch is over; the team is now turning the idea into a real business. This page says what is real today, what was only an estimate for the pitch, and what has to happen next. Keep it up to date.

Tasks waiting on a person: [HUMAN_TODO.md](HUMAN_TODO.md).

## Where things stand

| Area | Status today |
|---|---|
| Shop app + tourist demo app | Running on Cloudflare Workers + Supabase (links in README). Built for the pitch demo. |
| Payments | **Simulated.** No money moves. The app has a webhook (`POST /api/webhooks/payment`, HMAC-signed) ready for a payment partner, but no partner is connected. |
| PhaJay | Chosen during the pitch. **No contract. Primary-source audit (22 Nov 2026, `winner-agreement/PhaJay_Requirements_Audit_lo.md`) = NO-GO as primary partner:** BOL register (28 Nov 2025, p. 20) confirms Domestic Payment Facilitating only (not Cross-Border); PhaJay confirmed WeChat Pay & Alipay are still in development; Visa/MC run via JDB+2C2P in USD at 4.15%/5.15%; Auto Claim still waits for Mon–Fri admin transfer; and `phajay.co/en/terms-of-service` contradicts the pricing page (500 LAK ≤40k / 1.65% >40k + 5,000 LAK claim fee + 1% refund fee). Sandbox notes: `winner-agreement/PhaJay_Sandbox_Test.md`. |
| Company | Not registered yet (confirmed 22 Nov 2026; pitch budget had 3M kip for registration in quarter 1). Required before signing any payment partner contract. |
| Shops | No real shops signed up. Real field visits with shop owners still need to be written down. |
| Prize / winner agreement | **Signed** (confirmed 22 Nov 2026; contract kept out of the repo). Draft received 25 Oct 2026: no conditions on the money, no reports or targets, no repayment, no equity; the team keeps Phalom. Duties: 12 months Brand Ambassador, IBC 2027 committee/mentor, 2 videos (CATZ owns them). Review: `winner-agreement/Phalom_Agreement_Review.md`. |

## Pitch numbers that are estimates, not facts

- **New proposal (25 Oct 2026, v3): `winner-agreement/Phalom_New_Solution_lo.html` (Lao).** Three promises: **1 QR** for every foreign tourist, **0 app downloads**, **0 funds held by Phalom** (money reaches the vendor's own account instantly). The tourist pays the fee at payment time; vendors pay nothing; the fee is Phalom's only revenue and must be cheaper than LOCA Pay. Proposal: the Phalom sign is a web-link QR; the tourist pays by card, Apple/Google Pay, Alipay or WeChat Pay on a web page; a licensed partner (first choice BCEL, whose EzyKip already turns foreign cards into LAO QR payments at about 2.1%, unverified) pays the full price into the vendor's LAO QR instantly and shares the fee with Phalom. Proposed fee 2.9% + 1,000 kip, always under LOCA's 3% + 5,000 (estimate). Limit: one printed QR can't be both a LAO QR for bank apps and a web link for cameras, so the vendor's own bank QR stays for locals. PhaJay doesn't fit (not instant, card fee 4.15%). Nothing agreed; don't build until a partner says yes.
  - **v4 (25 Oct 2026, team feedback):** (1) Sell to shops as "never lose a tourist sale" (more sales, no app, own language), not "cheaper than LOCA": the ~1,250 kip margin is too thin to win a price war. Cheaper than LOCA stays a constraint. (2) Pitch to BCEL/LDB: Phalom is a sales channel to micro-vendors their staff don't reach, and the volume runs through the bank. Pitch to LOCA: white-label web checkout for tourists who won't install any app. (3) Chargeback plan in layers: 3-D Secure on every card, vendor agrees refunds are deducted from future sales, e-receipts, and only if the partner insists a rolling reserve on foreign cards (5–10% for 7–14 days, estimate; held by the partner, not Phalom; Alipay/WeChat released 100%). A reserve breaks "full price instantly" for card payments, so vendors must be told up front.
  - **Partner choice (27 Oct 2026): `winner-agreement/Partner_Choice_lo.md` (Lao).** From public websites, no partner offers everything today. Recommended: **BCEL** first. Its online gateway already takes Visa/MC/JCB/Amex/UnionPay/Alipay/WeChat Pay with 3-D Secure (cards from 3%, QR from 1.5%, 45 USD/month), and EzyKip already pays LAO QR from foreign cards. But the gateway pays one licensed merchant T+1, not vendors instantly, so the ask is "EzyKip as a web page via API". Backup: LOCA Pay (does the whole flow, app only, competitor). NewPay (BOL-licensed, API, Alipay/Alipay+/WeChat) for Alipay/WeChat only; vendor payout unknown. If BCEL card cost is really 3%, the card fee may need to be 3% + 1,000 (still under LOCA). Company registration is needed before any partner contract.
- **New research (23 Oct 2026): `winner-agreement/PhaJay_E2E_Business_Process.html` (Lao: `PhaJay_E2E_Business_Process_lo.html`).** Thai, Vietnamese and Chinese (UnionPay) tourists can already pay any shop's normal LAO QR, and BCEL's free OnePay Shop app already gives voice alerts. PhaJay's BCEL QR is "not a Lao QR" (BCEL One only), and its Alipay/WeChat Pay has no docs or sandbox. PhaJay does offer parent/sub-account **Split Payment**, a way for Phalom to take its fee without a revenue-share deal, but vendor KYC and manual payouts are open questions. Suggested pilot: shop keeps its bank QR, and Phalom earns from tools and tourist discovery; add PhaJay only once its answers are in.
- **The business model needs rework.** The pitch assumed PhaJay charges 1.5% and gives Phalom 30% of it. PhaJay's real public prices (checked 20 Oct 2026): Lao bank QR 1.60%, Alipay/WeChat Pay 4.15%, Visa 4.15%, Mastercard 5.15%, no PromptPay/Thai QR listed, and **no public partner or revenue-share program**. So Phalom either negotiates a share with PhaJay or charges its own small fee (e.g. 0.5% → about 45,000 kip/shop/month). Details: `winner-agreement/PhaJay_Real_Fee_Check.md`.
- Tourist total per 100,000 kip item at PhaJay's real fees: about 104,330 with Alipay/WeChat Pay, about 102,100 with Lao QR plus a 0.5% Phalom fee. Both are still under LOCA Pay's 108,000.
- Market size (SAM 44M USD, SOM 1.3M USD), 9M kip sales/shop/month, 5 payments/shop/day, 700 shops in year 1: team estimates, to be checked in the pilot.
- Budget (40M kip ask, `pitch-redesign/Phalom_Budget.xlsx`): QR stand, ads and travel prices are estimates.

## Decisions the team still has to make

1. ~~Who signs the winner agreement for the team, and which bank account gets the prize.~~ Done (winner agreement signed, confirmed 22 Nov 2026).
2. Where the pilot starts: Vientiane (roadmap and budget) or Luang Prabang (Judge Q&A answer 17).
3. ~~How Phalom earns money~~ Decided 25 Oct 2026: transaction fee only, paid by the tourist at payment time, cheaper than LOCA Pay. Still open: the rate and the partner (recommended: BCEL, see `winner-agreement/Partner_Choice_lo.md`).
4. Company registration: what kind of company, and who owns what share.
5. Whether Phalom needs its own licence from the Bank of the Lao PDR (pitch answer: no, because Phalom never holds money and payments go through a licensed partner; confirm with BOL or a lawyer).

## What the app needs before real money flows

The app was built for a demo; production-hardening status:

- **Shop login (implemented 22 Nov 2026; pending deploy):** Phone number + 6-digit PIN (PBKDF2-SHA256 salted hash, 5-attempt / 15-minute lockout), server-side revocable sessions (`HttpOnly` cookie + Bearer token), PIN change, and strict ownership checks on every `/api/merchants/:id/*` route and `/api/payments/:id/voice`. SMS/WhatsApp OTP for PIN reset can be layered on later once a provider is chosen.
- **Demo vs. production separation (implemented 22 Nov 2026; pending deploy):** Controlled by `APP_MODE` (`"demo"` vs. `"production"`, fail-safe default `"production"`). In production mode, `/api/auth/demo`, `/api/payments/:id/simulate`, and all seeded demo shops (`is_demo = true`) are disabled/hidden. Optional `supabase/production-cleanup.sql` strips seeded rows on live cutover. Currently `wrangler.toml` stays `APP_MODE = "demo"` until a real partner is connected.
- **Real partner integration (blocked on partner contract):** Partner-agnostic webhook adapter layer (`src/payments.ts`: generic HMAC, PhaJay Base64 HMAC, and drop-in slots for BCEL/NewPay/LOCA) and centralized kip-only fee pricing (`src/pricing.ts`: demo, v4 `2.9% + 1,000`, card fallback `3% + 1,000`) are implemented and tested (22 Nov 2026). Next step once a licensed partner signs (recommended: BCEL; see `winner-agreement/Partner_Choice_lo.md` and `business-ops/Partner_Pitch_OnePager_lo.md`): wire their checkout creation API + live webhook adapter and handle refunds/chargebacks.
- **Real shop sign-up (KYC):** Owner's name, ID, bank account checked by the partner bank. Store only what is needed; bank details stay masked (only the last 4 digits are kept, and public `GET /api/payments/:id` no longer exposes bank/last4).
- **Keys:** ~~the OpenRouter key was pasted in chat and must be revoked and replaced.~~ Rotated (confirmed 22 Nov 2026, along with the old GitHub token). Keep all keys in environment variables or Worker secrets, never in files.
- **Basics for a live service:** Security headers, structured JSON error logs + `X-Request-Id` (Cloudflare Observability), and plain-Lao Terms of Use + Privacy Notice for shops (with recorded registration acceptance) and bilingual notices for tourists added 22 Nov 2026. Still needed before live money: Supabase scheduled database backups and external uptime/error alerting.
- Test on real Android phones in a real market (sound, QR scanning in sunlight, weak signal).
- **Automated tests & CI (implemented 22 Nov 2026):**
  - API + auth + demo/production isolation + payment adapter tests (`npm test` → `scripts/test-hardening.mjs`).
  - Playwright browser E2E suite (`npm run test:e2e` → `e2e/phalom.spec.mjs`: two-device shop+tourist pay & Lao voice, registration/PIN login/logout/terms, kip-only check, products + cart charge, 6 languages + map, signed partner webhook).
  - Free GitHub Actions CI (`.github/workflows/ci.yml`): runs unit/build checks + full-stack Postgres 16 + Wrangler + Playwright E2E on every push/PR to `main`.

## Pitch-only material

`pitch/` (except `pitch/phalom-app/`) and `pitch-redesign/` are the competition deck, scripts, Q&A and screenshots. Keep them as a record and for investor or partner meetings, but the pitch numbers above must be updated before reusing them.
