# Phalom

Team Phalom's project for the Innovative Business Challenge (challenge 10, "ຮັບເງິນຕ່າງປະເທດຍຸ້ງຍາກ"): a shop app for small souvenir and street-food vendors in Laos. Tourists pay with the app they already use (PromptPay, Alipay, WeChat Pay, UnionPay, VietQR), the money goes through PhaJay into the shop's Lao bank account, and the shop receives the full price in kip.

Slogan: "ນັກທ່ອງທ່ຽວຈ່າຍແບບບ້ານເຂົາ — ແມ່ຄ້າຮັບເງິນກີບແບບບ້ານເຮົາ"

Result: 1st place (October 2026). **The pitch is over and the team is now building Phalom as a real business.** Start with [BUSINESS.md](BUSINESS.md): what is real today, which pitch numbers were estimates, and what has to happen before real money flows.

## What is where

| Folder | What it holds |
|---|---|
| `pitch/phalom-app/` | The real app: shop app + tourist demo app (Cloudflare Workers) and the database (Supabase). Its own [README](pitch/phalom-app/README.md) explains the API and how to deploy. |
| `pitch/Phalom.apk` | Android app (opens the live shop app full screen, reads payments aloud). |
| `pitch/deck-src/` | Generator for the first .pptx deck (`pitch/Phalom_Pitch.pptx`). |
| `pitch/screens-*`, `pitch/tent-card/` | App screenshots for slides, printable table QR card. |
| `pitch-redesign/` | The 3D pitch deck and everything around it. `Phalom_Pitch_3D_live.html` is the latest deck (same as the live link below); the PDF, PPTX and offline HTML are older (15 Oct). Also Q&A pages, judge Q&A, budget Excel and the 5-minute Lao script for 4 speakers. |
| `knowledge-base/` | Business knowledge base (English). Its fee section is older than the current fee model, see project notes. |
| `winner-agreement/` | Prep for the prize contract and the check of PhaJay's real fees. |
| `rules/` | Challenge rules and pitch template (PDFs) with a short summary. |
| `HUMAN_TODO.md` | **Start here when you come back:** the tasks only a person can do (sign in, phone PhaJay, sign, decide). |
| `BUSINESS.md` | Current status of the business, open decisions and the to-do list for going live. |
| `project-notes/` | Copy of the project memory: every decision, number and preference the team agreed on. **Read `project-notes/MEMORY.md` first.** |

## Live links

- Shop app: https://phalom.phalom-payment.workers.dev ("ລອງໃຊ້ຮ້ານຕົວຢ່າງ" opens the demo shop)
- Tourist demo app: https://phalom-tourist.phalom-payment.workers.dev
- 3D pitch deck: https://claude.ai/artifact/9FcYNogPjmiaNcg6WMarBs

Payments are simulated. No money moves.

## Deploy the app

From `pitch/phalom-app/`:

```bash
npm install
export CLOUDFLARE_API_TOKEN=...      # Cloudflare token, "Edit Cloudflare Workers" + Workers AI
export SUPABASE_ACCESS_TOKEN=...     # Supabase personal access token
export OPENROUTER_API_KEY=...        # optional: Lao voice "money received" (ElevenLabs via OpenRouter)
bash scripts/deploy.sh
```

`deploy.sh` finds the Cloudflare account and the Supabase project named `phalom`, runs the database migrations, deploys both Workers, waits for `/api/health` and rebuilds the APK. Without the OpenRouter key the voice falls back to the phone's own voice. `scripts/smoke.mjs` checks the live app end to end. Full details and the step-by-step token guide: [pitch/phalom-app/README.md](pitch/phalom-app/README.md), [pitch/deploy-setup-guide.md](pitch/deploy-setup-guide.md).

Never commit keys or tokens. Put them in environment variables only.

Not in this repo: the Android signing key (`android/phalom-demo.p12`, needed so a new APK installs over the old one) and the uploaded reference images. Both stay in the project's shared folder on claude.ai.

## Rules the team agreed on during the pitch (short version)

- Lao first: apps, slides and scripts are in plain Lao; English only where truly needed.
- Lao kip only, everywhere (market-size stats stay in USD because they come from the official report).
- Shop gets the full 100%: the partner fee is added to the tourist's total, not taken from the shop. (The pitch used 1.5%; PhaJay's real fees are higher, see BUSINESS.md.)
- Name PhaJay as the partner, but never say a contract is signed or that PhaJay/LAPNet is already connected.
- Every slide with numbers shows its source in the bottom-left corner.

More in `project-notes/MEMORY.md`.
