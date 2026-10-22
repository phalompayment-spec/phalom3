# Phaloms project memory

## Project
- PHASE CHANGE (user, 2026-10-22 17:12): the pitch is over; Phalom is now being built as a REAL BUSINESS. Pitch-era rules (5-min, slides, judges) are history; repo README/CLAUDE.md being updated for this in thread "Put project in GitHub repo".
- RESULT (user, 2026-10-20): Phalom WON 1ST PLACE in the INNOVATIVE BUSINESS CHALLENGE. Organizer (SPK) contract timeline: 21 Oct 2026 first draft; 24 Oct draft sent to winners, 1 week to review and send comments (≈ by 31 Oct); 2 Nov final version confirmed; 15 Nov signing + prize money. Claude offered to review the draft contract with the team when it arrives. Prep file winner-agreement/Phalom_Agreement_Prep.md (2026-10-20): rules PDFs say nothing on prize/contract; unknown if prize = project budget (pitched 40M kip); open team decisions: signer, bank account, pilot city.
- PHAJAY REAL FEES (checked 2026-10-20, phajay.co/en/pricing): Lao bank QR & payment link 1.60%, Alipay/WeChat Pay 4.15%, Visa 4.15%, Mastercard 5.15%; no PromptPay/Thai QR listed; NO public partner/revenue-share program (our 30% share is unsupported). Pitch 1.5% was a team estimate set below the general Laos 2.5–4% (PayAtlas). Plan needs ~38,000 kip/shop/month; real Lao QR × 30% = 43,200 (break-even Q3), 20% → Q4, <~26% or no share → needs Phalom's own fee (e.g. 0.5% → 45,000). Alipay tourist total ≈104,330 per 100,000, still under LOCA 108,000. File: winner-agreement/PhaJay_Real_Fee_Check.md (deck/budget unchanged).
- Team "Phalom" pitch for a Lao challenge: cross-border payments for small souvenir / street-food vendors (tourists pay with PromptPay/Alipay/WeChat, vendor receives kip).
- Slogan: "ນັກທ່ອງທ່ຽວຈ່າຍແບບບ້ານເຂົາ — ແມ່ຄ້າຮັບເງິນກີບແບບບ້ານເຮົາ"
- PITCH LENGTH (user, 2026-10-15): 5 minutes or less, 4 presenters. 3D deck is 17 slides (KPI slide 15; Q&A is its own page Phalom_QA.html). User writes mostly in Lao (sometimes Thai or English); slides/apps stay Lao.
- Speakers (5-min script): ແສງຕາວັນ (slides 1–4), ເພັດມີໄຊ (5–7), ເຈດສະດາ (live demo 8–9), ສີສົມພອນ (10–16). Claude default, user may swap.
- Team contact for slides: email phalom.payment@gmail.com, phone +856 20 5628 0572. Closing slide says just "ຂອບໃຈທຸກທ່ານ".
- Concept: merchant app on top of existing rails; one partner route is PhaJay (see Decisions); team never holds funds; revenue = share of partner fees.
- Team's own deck: Canva https://canva.link/mshqv9ybohe4dgx (reachable from the redesign thread only; original untouched).
- Repo https://github.com/phalompayment-spec/phalom3 is PUBLIC (user chose to keep it public 2026-10-22). It holds the project files, BUSINESS.md, CLAUDE.md and project-notes/ (copy of this memory). Never put keys or private personal data in it.
- Cloud environment: project default env_0152yunWk7sPY8g2d8eJ7QGP ("phalom2"); user's keys saved there as env vars "supabase" and "cloudflare". "openrouter" NOT saved as an env var; user pasted the key in thread "ເປີດສຽງແຈ້ງເງິນເຂົ້າ" (2026-10-17 05:59) and that thread put it only into the Worker secret. Running threads keep their start environment; only new threads get the new default. Prefer keys in the environment, not chat.

## Preferences
- Pitch materials: simple for a non-technical audience; plain local Lao words, Lao only, English only where truly needed.
- LAO FIRST: both apps default to Lao, and every app screen shown on slides must be in Lao.
- Market slide must name TAM, SAM and SOM explicitly with visible titles.
- Judges/seniors want numbers explained: formula under each KPI (bordered box) and a line-item budget (Excel).
- SOURCES (user, 2026-10-16 17:03): every slide with numbers shows its source in the bottom-left corner so judges see where figures come from.
- Wording: ສະພານ not ຂົວ; ໄຕມາດ in full, not ໄຕ; tourist app on slides is "ແອັບຈຳລອງເປັນນັກທ່ອງທ່ຽວ"; slide 8 headline says "Demo". Don't use "ຊ່ວຍຂາຍ", "ແປເມນູ" or "ລາຄາເປັນກີບ" as selling points (2026-10-16).
- Series of slide edits: change the source only, rebuild/publish once when the user says done.
- BUILD WORDS: "build" = update only the live 3D deck link; PDF/PPTX/offline backups only on "full rebuild". User is cost-conscious: don't redo unchanged work.
- Scripts as HTML files, editable by the team. SCRIPT REWRITES: give multiple-choice versions in the reply only; user edits the script files themselves.
- App design: all out, heavy glyph/icon UI, simple, unmistakably Lao look; light mode always (phone dark mode must not switch it); QR always on white. App fixes: "deploy right away".
- Merchant app is the showpiece; tourist app stays a simple demo payer (don't spend much effort on it).

## Decisions
- 2026-10-14: Real app with running backend on Cloudflare + Supabase, payments simulated; installable on the user's Android phone; Claude deploys.
- 2026-10-14: Deck redesign "all out" (3D, graphics, transitions); team presents the 3D HTML deck live; an editable version (fixed pictures, editable text) goes to seniors.
- POLICY: no currency but Lao kip anywhere (app, slides, scripts). Market-size stats stay in USD (official report).
- Name PhaJay openly as partner; don't claim a signed contract.
- 2026-10-15 PHAJAY ROUTE (user: "we are going with Phajay"): tourist's app → PhaJay → shop's Lao bank, not direct LAPNet. Never say LAPNet or PhaJay is already connected. Live in both apps and in deck/scripts/QA (slide 5 money via PhaJay, 7 "PhaJay ແມ່ນຄູ່ຮ່ວມ", 10 only PhaJay takes the fee, 13 partner risk answer, 16 ask = introduction to PhaJay).
- FEE MODEL, CURRENT (user, 2026-10-16 11:52, replaces the 08:56 "shop nets 98,500" model): SHOP GETS FULL 100%. Price 100,000 → shop receives the full 100,000 (matches voice alert "ໄດ້ຮັບເງິນ 100,000 ກີບ"); PhaJay 1.5% (1,500) is added to the tourist's scan total → tourist pays 101,500 (vs LOCA Pay 108,000, no new app). Phalom still gets 30% of PhaJay's fee ≈ 450 kip → 40,500 kip/shop/month unchanged. 1.5% and 30% are estimates, not signed. APPS DONE 11:54 (both deployed, not checked on screen): tourist pay screen shows ລາຄາສິນຄ້າ 100,000 → ຄ່າທຳນຽມ PhaJay 1.5% + 1,500 → ທ່ານຈ່າຍທັງໝົດ 101,500; shop receipt/history show fee paid by customer, ເງິນເຂົ້າບັນຊີຮ້ານເຕັມ 100%; DB still stores product price, fee computed at display. DECK side (slide 7 101,500 vs LOCA 108,000; slide 10 flow; notes, 5-min script, Judge Q&A Q11) handled in redesign thread from 11:53.
- SLIDE 5 (2026-10-15/16): map dropped; 4 boxes: box 2 "ຄິດເງິນງ່າຍ: ໃສ່ເມນູ ແລະ ລາຄາໄວ້ໃນແອັບ · ກົດເລືອກສິນຄ້າ ແອັບບວກເງິນໃຫ້ · ອອກ QR ຕາມຍອດ", box 3 "ເຫັນຍອດຂາຍ", box 4 "ປອດໄພ ບໍ່ຕ້ອງກັງວົນ: ເງິນເຂົ້າທະນາຄານໂດຍກົງ · ບໍ່ມີສະລິບປອມ". Open: whether the map should also go from slides 12, 14, 15 and roadmap.
- SLIDE 8 (2026-10-16 08:04): ONLY shop-app screens, 5 phones: ຍອດຂາຍມື້ນີ້, ພິມຈຳນວນເງິນ (keypad), ເລືອກສິນຄ້າ (total 85,000), QR ຕາມຍອດ, ແມ່ຄ້າໄດ້ຮັບເງິນ. The tourist-app QR under the headline stays for the live demo (pending user). Slide 7 row "ຄິດເງິນງ່າຍ (ເມນູ + ລາຄາ, ສຽງແຈ້ງເງິນເຂົ້າ)".
- Slide 4: SOM = 3% of 44M USD SAM = 1.3M USD. Slide 14: 78,700 ລ້ານກີບ into Lao banks (= 1.28M payments × 61,500 kip, team calculation).
- Slide 13: SWOT title ເຮັງ; "Alipay ຕ້ອງໃຊ້ QR ແຍກ" is NOT true (never repeat it); copycat risk "ມີຄົນລອກແບບ: ເຮົາຢູ່ໃກ້ແມ່ຄ້າ ສະໝັກໃຫ້ເອງທຸກຮ້ານ ແລະ ມີຂໍ້ມູນຍອດຂາຍທີ່ຄົນອື່ນບໍ່ມີ" (Claude's pick). Slide 16 ask 03: "ການຮ່ວມມືຈາກກະຊວງວັດທະນະທຳ ແລະ ການທ່ອງທ່ຽວ".
- Roadmap quarterly: Q1 100 shops, Q2 250, Q3 400, Q4 700 (Luang Prabang + Vang Vieng in Q3/Q4).
- KPI: team income ~40,500 kip/shop/month (9M × 1.5% × 30%); impact 700 shops, 1.28M payments/yr; SWOT ໄພຂົ່ມຂູ່→ຊວຍ; slide 7 two groups (cash + banks; LOCA Pay + Phalom); slide 15 6th KPI "ໄຕມາດ 3".
- BUDGET: team signs up shops on own phones (no phones/helper/sign-up fee). First 3 months 20.9M kip; 19.1M of the 40M kept aside; deepest dip 16.7M end of Q2; income passes costs in Q3 (39.5M vs 36.3M); year 1 +9.3M kip. Lao minimum wage 2.5M kip/month; QR stand, ads, travel prices are Claude estimates.
- TWO APPS, two live links (shop + tourist demo), shared Supabase backend, payments simulated.
- 2026-10-14: Google Maps + recommendations as Phalom's niche ("Google Maps knows where shops are, Phalom knows what tourists actually buy there"). Next two map ideas await the user's pick.
- VOICE ALERT (user 2026-10-16 08:28): shop app's money-in voice uses elevenlabs/eleven-v4-turbo via OpenRouter, called from the Worker, falls back to the phone's own voice. LIVE 2026-10-17 06:01: thread "ເປີດສຽງແຈ້ງເງິນເຂົ້າ" set the Worker secret only (no code redeploy, key not in files); app reports voice: true; test payment 12,000 kip returned an mp3. Nobody has listened to it yet; user asked to test on the shop phone and report if Lao pronunciation is wrong. User will revoke the key after the project (voice then falls back to phone TTS). A future deploy.sh run without the key may need the secret re-set.

## Work
- Thread "Phalom pitch deck and prototype" (old env without keys, must not build apps) built first .pptx deck, prototype Artifact, first app, APK; see [[phalom-pitch-deliverables]].
- Thread "Pitch deck visual redesign" owns the 3D deck (Artifact 9FcYNogPjmiaNcg6WMarBs), editable PPTX, PDF/offline backups, Phalom_QA.html, Phalom_Judge_QA.html, budget Excel, Lao scripts (Phalom_Script_5min_4people.html, in-browser editable), all under /mnt/project-files/pitch-redesign/. It has no deploy keys: app changes go to an app thread (latest: "ເປີດສຽງແຈ້ງເງິນເຂົ້າ").
- 2026-10-16 16:21 user: timer taken out of the deck (no time on slide bar or in notes, T key removed). Don't add it back.
- LIVE DECK last built 2026-10-16 17:04 (version 21; v19 = slide 12 "ໄຕ"→"ໄຕມາດ"; v20 = timer removed; v21 = bottom-left sources, new on slides 10 and 14 as team calculations). Open: user may supply external sources for slides 10/14. PDF, both PPTX and offline HTML are STILL the 2026-10-15 07:40 version until "full rebuild".
- Judge Q&A (Phalom_Judge_QA.html, 20 questions): backup numbers PhaJay share 20% → break-even Q4; 3 payments/day → 24,300 kip/shop/month. Q9 "talked to shops?" needs the team's real field visits. Drop Q19? pending.
- 2026-10-16 08:08: thread "Business knowledge base" delivered knowledge-base/Phalom_Knowledge_Base.md (English). Open: pilot start Vientiane (roadmap/budget) vs Luang Prabang (Judge Q&A Q17). (Its slide-10 400 vs 450 flag is now fixed in the deck; the .md may still mention it; its fee section predates the 11:52 full-100% model.)
- Deploy: scripts/deploy.sh needs CLOUDFLARE_API_TOKEN + SUPABASE_ACCESS_TOKEN (+ "openrouter" for voice). Hosts: api.cloudflare.com, *.workers.dev, *.supabase.co, api.supabase.com, openrouter.ai.
- App files: pitch/phalom-app (+ .zip), pitch/Phalom.apk, pitch/deck-src, pitch/screens-*, tent card (pitch/tent-card/). Supabase project "phalom" (Singapore). Unrelated Worker "talat-pay-test" in user's Cloudflare (leave it).
- LIVE: shop app https://phalom.phalom-payment.workers.dev ("ລອງໃຊ້ຮ້ານຕົວຢ່າງ" opens demo shop); tourist app https://phalom-tourist.phalom-payment.workers.dev (/map with Google embed + picks + walk plan). Shop app has desktop layout, "ແຜນທີ່ຮ້ານ", product list with prices, fee lines. White QR + forced light mode live. Not yet tested on a real phone. All-pins map needs a Maps JS API key (not created).
- APK v1.1 loads the live shop app, so web changes show without a new APK. pitch/phalom-app/public/icons/* in the shared folder differ from deployed (unknown edit 2026-10-14 21:17); left undeployed.
- [[phalom-3d-deck-redesign]]: 3D redesign details.
