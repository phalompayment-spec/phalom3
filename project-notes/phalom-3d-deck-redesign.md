---
name: phalom-3d-deck-redesign
description: 3D animated redesign of the Phalom pitch deck (Artifact + PDF/PPTX/offline HTML), its theme and where the source lives (2026-10-14)
metadata:
  type: project
  modified: 2026-10-14T12:43:55.487Z
---

2026-10-14, thread "Phalom pitch deck redesign": user asked to rebuild their Canva deck (https://canva.link/mshqv9ybohe4dgx, design DAHX-4Ji5pY, readable via the Canva MCP read-design tool) "all out" with 3D, transitions, numbers front and center.

- Artifact: https://claude.ai/artifact/9FcYNogPjmiaNcg6WMarBs (17 slides: 15 script sections + Q&A + sources). Keys: arrows/space, N speaker notes (full Lao script), T timer vs 9:20, F fullscreen; #s3 deep links.
- Files: /mnt/project-files/pitch-redesign/ — Phalom_Pitch_3D.pdf, Phalom_Pitch_3D.pptx (slide images + script notes + fade, not editable text), Phalom_Pitch_3D_offline.html (three.js inlined; fonts still from Google, falls back offline).
- Theme: indigo night-market background, temple gold accent, silk magenta for costs, jade for money arrived; Noto Sans Lao Looped headlines, Bricolage Grotesque numbers. A three.js cube field re-forms per slide and every cube counts a real unit (e.g. 1 cube = 2,863 visitors, 1 shop, 1M kip).
- Team names/affiliations came from the Canva deck (typos fixed). Contact info still placeholders. Budget slide uses the Canva P&L (Q1–Q4 revenue 3.0/15.2/39.5/69.9, expenses 40.8/39.8/69.8/77.3 M kip).
- Demo slide links the prototype artifact, which is private unless the user shares it.

- 12:07 user rule applied: plain Lao everywhere (no TAM/SAM/SOM, MDR, MVP, SWOT letters, $); Artifact v2 + backups republished.
- Canva: the deferred mcp__Canva__* tools DO work (only the plugin canva server fails). Made an editable copy DAHX_GMYFho (https://www.canva.com/d/NtL8f9fwlcC--ZJ); original untouched. Restyling it in the same theme; pages 1–3 done in an open edit transaction, waiting on user approval to finish and save. canva.com uploads are blocked by the network, so the 3D images can't be inserted automatically; PNGs for manual drag-in are in pitch-redesign/canva-images/.

- 2026-10-14 14:15: added slide 15 KPI (6 numbers: 700 shops, ≥70% kept, ≥5 tx/shop/day, 9M kip sales/shop/month, 36–40k kip team revenue/shop/month, break-even 650–770); deck now 18 slides, still 9:20 (impact 25s, risk 40s, close 25s). User's handwritten list (RCA, TAM/SAM/SOM, SWOT, risk, P&L, prototype) was already covered.
- Kip-only rule (user, "policy"): no yuan/baht/dong prices anywhere in deck, notes or app screens. Demo slide uses kip-only screens shot from the updated prototype. USD market figures (1,422 / 44 / 3.5 ລ້ານໂດລາ) kept as official market stats.
- Editable for seniors: pitch-redesign/Phalom_Pitch_Editable.pptx = text-free background picture per slide + real editable text boxes + notes; importable into Canva. User presents with the HTML deck.
- Lao speaking script: Claude Doc https://claude.ai/code/artifact/aecb97d6-2f2a-4d83-a266-12ab19fd2e09
- Source scripts (session scratch only): extract.js (text boxes + text-free bg), mkpptx.py, phoneshot.js.

Related: [[phalom-pitch-deliverables]]

- 2026-10-14 18:56 FINAL REBUILD done (user said "start rebuild"): deck now 17 slides (Q&A moved to separate pitch-redesign/Phalom_QA.html), Artifact v5, all PDF/PPTX/editable/offline files and script doc updated. Changes: TAM/SAM/SOM titles; slide 6 PhaJay gate; slide 7 table split (old way vs QR apps, no PhaJay column); slide 8 chip "ລອງເວີຊັນ" + live app QR; slide 11 4 quarters 100/250/400/700; slide 12 40M breakdown (pitch-redesign/Phalom_Budget.xlsx, Claude-estimated line items); slide 13 SWOT labels ຮຽງ/ຊວຍ; slide 14 "who benefits"; slide 15 formulas, break-even ~660, ~40.5k kip/shop/month; slide 16 new headline.
- User rule (18:06): when they are sending a batch of edits, edit source only and do not rebuild/publish until they say so.

2026-10-14 20:06 (source only): user cut phones and staff (team signs shops itself, own phones). New budget: 40M = 20.9M quarter-1 costs + 19.1M kept to cover losses until quarter 3. Income beats costs in quarter 3 (39.5 > 36.3); year 1 income 133.7, costs 124.3, profit +9.3; worst cumulative loss 16.7M (quarter 2). KPI 6 = "ໄຕ 3"; slide 16 ask "ທຶນເລີ່ມຕົ້ນ ພາໄປຮອດມື້ທີ່ລາຍຮັບພໍຈ່າຍເອງ".
2026-10-14 20:25 (source only): slide 8 now "2 ແອັບ ທີ່ກົດໃຊ້ໄດ້ແທ້", two QRs (shop app phalom.phalom-payment.workers.dev, tourist app phalom-tourist.phalom-payment.workers.dev), 5 phones from pitch/screens-v2 (1-home, 3-qr, 7-map tourist pay, 4-done, t-receipt); phones.json regenerated (backup phones.v1.json, new key touristqr).
2026-10-14 21:12 REBUILD done (user said "rebuild"): Artifact v6, PDF/PPTX/editable/offline copied to pitch-redesign, script doc rev 10. Includes the 20:06 budget and slide 8. Slide 8 currently uses merchant-only Lao screens (1-home, 2-pay, 3-qr, 4-done, 5-history) because the tourist screens were Chinese; user wants every app screen in Lao (21:03). Swap in the new Lao screenshots when "App deploy with saved keys" sends them.
2026-10-15 05:30: user now wants the pitch in 5 min or less, 4 speakers, script as an HTML file: /mnt/project-files/pitch-redesign/Phalom_Script_5min_4people.html (4:40 total; ແສງຕາວັນ slides 1–4, ເພັດມີໄຊ 5–7, ເຈດສະດາ 8–9 demo, ສີສົມພອນ 10–16; slides 9/13/15/17 passed quickly; practice timer). Deck itself not changed yet (its data-t timer still totals 9:20). An empty Claude Doc "ບົດເວົ້າ 5 ນາທີ · 4 ຄົນ" was created by mistake before the user said HTML.
2026-10-15 07:45: REBUILD done (Artifact v7) with Lao slide 8 (pitch/screens-lao: 1-shop-home, 3-shop-qr, 4-tourist-pay, 6-shop-received, 7-tourist-receipt; amount 85,000). 9:20 script doc rev 12. 5-min script HTML is now editable (edit button, 4 speaker-name inputs that update everywhere, autosave per browser, "save as file" download); backup scratch script5.v1.html.
2026-10-15 08:50 (source only): phones.json 'qr' refreshed from new 3-shop-qr.png (white QR background); goes live at next rebuild.
2026-10-15 10:35: user chose PhaJay as the ONE money route (no direct LAPNet/bank link). Deck source (slides 5,7,10,13,16 + notes), 9:20 script doc rev 17, 5-min script HTML and Phalom_QA.html now say money goes tourist app -> PhaJay -> shop's Lao bank. Slide 8 phone 03 = 5-tourist-paying (shows PhaJay route). Deck changes source-only until next rebuild. Sources slide keeps UnionPay–LAPNet market fact.
- 2026-10-15 11:15: judges' Q&A page delivered: pitch-redesign/Phalom_Judge_QA.html (20 Qs, 4 groups, sensitivity: fee share 20% → profit Q4, lowest point 35.8M; 3 payments/day → 24,300 kip/shop, profit Q5). Q9 field-research answer awaits the team's real facts.
- 2026-10-15 11:22: slide 5 map dropped (user). Box 3 now 'ເຫັນຍອດຂາຍ' (sales summary, Claude default; decision card also offered print-your-own QR / sales record for loans). Notes + 5-min script line updated; source only, awaits rebuild. Map still on slides 9, 10, 11; asked user whether to remove there too.
- 2026-10-15 11:27 USER RULE: "build" = rebuild deck.html + republish the Artifact ONLY (cheap). PDF/PPTX/offline backups only when user says "full rebuild". Artifact v8: slide 5 now 4 boxes in 2x2 (4th "ປອດໄພ ບໍ່ຕ້ອງກັງວົນ", jade 4th 3D tier) plus all pending PhaJay/QR source edits. Backups (PDF/PPTX/offline) still v7-era.
- 2026-10-15 13:05 user edits (source only, awaiting "build"): SOM now 3% / 1.3M USD (user picked 13:07) (2 cubes); SWOT label ຮຽງ→ເຮງ; slide 14 impact shown as 78,700 ລ້ານກີບ. Script, Phalom_QA.html, Judge QA updated. Flagged: 3% × SAM 44M = 1.32M, not 1.8M; 700 shops' flow (78,700M kip) ≈ 3.5M USD.
- 2026-10-15 17:00 source edits (await 'build'): slide 15 'ໄຕມາດ 3'; SWOT label now ເຮັງ (user's final spelling); slide 13 other-risk 'Alipay QR ແຍກ' (user: not true) replaced by 'ມີຄົນລອກແບບ'; slide 16 ask 03 = ການຮ່ວມມືຈາກກະຊວງວັດທະນະທຳ ແລະ ການທ່ອງທ່ຽວ (also 5-min script + notes).
- 2026-10-15 17:22 slide 8: headline 'Demo ແອັບ ທີ່ກົດໃຊ້ໄດ້ແທ້', tourist QR label 'ແອັບຈຳລອງເປັນນັກທ່ອງທ່ຽວ'. Built (Artifact v11).
- 2026-10-16 08:10 slide 5 box 2 = 'ຄິດເງິນງ່າຍ' (menu+price, tap items, auto total, QR per amount; replaces ຊ່ວຍຂາຍ); slide 7 row + slide 8 phone 01 now product-pick screen (pitch/screens-lao/2b-shop-pick-items.png, key 'pick' in phones.json), caption 02 'QR ຕາມຍອດ'. 5-min script lines for 5 and 8 updated. Built Artifact v12.
- 2026-10-16 08:05 slide 8 now 4 SHOP-app phones only (user: drop tourist screenshots): 01 ຍອດຂາຍມື້ນີ້, 02 ເລືອກສິນຄ້າ, 03 QR ຕາມຍອດ, 04 ແມ່ຄ້າໄດ້ຮັບເງິນ. Artifact v13.
- 2026-10-16 08:08 slide 8 now 5 phones: ຍອດຂາຍມື້ນີ້, ເລືອກສິນຄ້າ, QR ຕາມຍອດ, ຈ່າຍເງິນ (payment screen back, user's request was ambiguous: guessed 'pay screen'; alt = keypad ພິມຈຳນວນ screen 2-shop-charge), ແມ່ຄ້າໄດ້ຮັບເງິນ. Artifact v14.
- 2026-10-16 08:12 slide 8 FINAL phones (all shop app): ຍອດຂາຍມື້ນີ້, ພິມຈຳນວນເງິນ (keypad, key 'keys'), ເລືອກສິນຄ້າ, QR ຕາມຍອດ, ແມ່ຄ້າໄດ້ຮັບເງິນ. Tourist screens removed per user. Artifact v15.
- 2026-10-16 09:00 slide 10: share ~450 kip (30% of 1,500 PhaJay fee), monthly ~40,500 = 90 × 450; flow shows shop net 98,500; formula line; script slide 10 example added. Shop-app fee lines done by 'Voice alert' thread (not this one). Artifact v16.
- 2026-10-16 09:05 user: make 98,500 vs 100,000 explicit everywhere. Slide 7 tag 'Phalom · ແມ່ຄ້າໄດ້ 98,500'; slide 10 headline 'ແມ່ຄ້າໄດ້ 98,500 ຈາກ 100,000', box and wins text, notes; 5-min script slide 10 line; Judge QA Q11 now explains 98,500 (30% share marked not signed). Artifact v17.

- 2026-10-16 ~12:00 FEE MODEL CHANGE (user decision): merchant gets FULL 100,000; PhaJay 1.5% (1,500) is ADDED on top, tourist pays 101,500 (LOCA Pay 108,000). Phalom still ~450 (30%) = 40,500/shop/month. Deck slides 7, 10, notes, script, Judge Q11 updated + live. Supersedes the 98,500 model. Tourist-demo app must show 101,500 at pay; shop app receipt fee lines (98,500 net) must be REMOVED/changed to full 100,000 — app threads own that.
