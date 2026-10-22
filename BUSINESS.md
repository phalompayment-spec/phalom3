# Phalom: from pitch to real business

Written 22 Oct 2026, after Phalom won 1st place. The pitch is over; the team is now turning the idea into a real business. This page says what is real today, what was only an estimate for the pitch, and what has to happen next. Keep it up to date.

## Where things stand

| Area | Status today |
|---|---|
| Shop app + tourist demo app | Running on Cloudflare Workers + Supabase (links in README). Built for the pitch demo. |
| Payments | **Simulated.** No money moves. The app has a webhook (`POST /api/webhooks/payment`, HMAC-signed) ready for a payment partner, but no partner is connected. |
| PhaJay | Chosen as the partner route (tourist's app → PhaJay → shop's Lao bank). **No contract.** Free portal test account opened 23 Oct 2026: sandbox QR and payment link work (test money only, mock bank, no foreign wallets). See `winner-agreement/PhaJay_Sandbox_Test.md`. No live API access (needs KYC). |
| Company | Not registered yet (pitch budget had 3M kip for registration in quarter 1). |
| Shops | No real shops signed up. Real field visits with shop owners still need to be written down. |
| Prize / winner agreement | Organizer (SPK) timeline: draft to the team 24 Oct, comments by about 31 Oct, final 2 Nov, signing + prize money 15 Nov. Prep: `winner-agreement/Phalom_Agreement_Prep.md`. |

## Pitch numbers that are estimates, not facts

- **The business model needs rework.** The pitch assumed PhaJay charges 1.5% and gives Phalom 30% of it. PhaJay's real public prices (checked 20 Oct 2026): Lao bank QR 1.60%, Alipay/WeChat Pay 4.15%, Visa 4.15%, Mastercard 5.15%, no PromptPay/Thai QR listed, and **no public partner or revenue-share program**. So Phalom either negotiates a share with PhaJay or charges its own small fee (e.g. 0.5% → about 45,000 kip/shop/month). Details: `winner-agreement/PhaJay_Real_Fee_Check.md`.
- Tourist total per 100,000 kip item at PhaJay's real fees: about 104,330 with Alipay/WeChat Pay, about 102,100 with Lao QR plus a 0.5% Phalom fee. Both are still under LOCA Pay's 108,000.
- Market size (SAM 44M USD, SOM 1.3M USD), 9M kip sales/shop/month, 5 payments/shop/day, 700 shops in year 1: team estimates, to be checked in the pilot.
- Budget (40M kip ask, `pitch-redesign/Phalom_Budget.xlsx`): QR stand, ads and travel prices are estimates.

## Decisions the team still has to make

1. Who signs the winner agreement for the team, and which bank account gets the prize.
2. Where the pilot starts: Vientiane (roadmap and budget) or Luang Prabang (Judge Q&A answer 17).
3. How Phalom earns money: negotiated PhaJay share, Phalom's own fee, or a monthly shop subscription.
4. Company registration: what kind of company, and who owns what share.
5. Whether Phalom needs its own licence from the Bank of the Lao PDR (pitch answer: no, because Phalom never holds money and payments go through a licensed partner; confirm with BOL or a lawyer).

## What the app needs before real money flows

The app was built for a demo, so these are missing:

- **Shop login.** Today anyone who knows a shop's id can open its dashboard. Real shops need a login (e.g. phone number + one-time code) and every `/api/merchants/:id/*` route must check it.
- **Remove the demo paths** in production: `POST /api/payments/:id/simulate`, the demo shop, the seeded example shops and sales (migrations 0002 and 0004).
- **Real PhaJay integration:** create the payment with PhaJay's API instead of the demo QR, receive their confirmation on the webhook, match it to the payment, handle refunds and failed payments. Needs PhaJay merchant/partner access first.
- **Real shop sign-up (KYC):** owner's name, ID, bank account checked by PhaJay or the bank. Store only what is needed; bank details stay masked (today only the last 4 digits are kept).
- **Keys:** the OpenRouter key was pasted in chat and must be revoked and replaced. Keep all keys in environment variables or Worker secrets, never in files.
- **Basics for a live service:** error monitoring, database backups, a privacy notice for shops and tourists, and terms of use.
- Test on real Android phones in a real market (sound, QR scanning in sunlight, weak signal).

## Pitch-only material

`pitch/` (except `pitch/phalom-app/`) and `pitch-redesign/` are the competition deck, scripts, Q&A and screenshots. Keep them as a record and for investor or partner meetings, but the pitch numbers above must be updated before reusing them.
