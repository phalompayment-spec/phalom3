# To-do list for humans

Things only a person on the team can do: sign in, pay, phone someone, sign, decide. Claude does the rest. **Start here when you come back**, take the top open item, and tick it (`[x]`) when done, adding the date and a short note on what happened. When you need Claude, just say "next human to-do done".

Rules: never paste keys, ID cards, bank details or contracts into this file (the repo is public). Ask before paying for anything.

Last updated: 27 Oct 2026.

## 🔴 Urgent (security)

- [ ] **Delete the old GitHub token.** github.com → Settings → Developer settings → Personal access tokens → delete the one that was in the git link. Git now signs in with `gh`, so nothing breaks.
- [ ] **Revoke the OpenRouter key** that was pasted in chat during the pitch: https://openrouter.ai/settings/keys → delete it → make a new one. Keep the new one in your terminal (`export OPENROUTER_API_KEY=...`) or tell Claude to set it as a Worker secret. Don't paste it in chat.
- [ ] **Tell the claude.ai Claude** to use the `main` branch only (the old branch is deleted).

## 🟠 Winner agreement (dates from the organizer, SPK)

- [x] 25 Oct 2026: received the draft agreement (PDF, kept out of the repo). Claude's review and draft comments: `winner-agreement/Phalom_Agreement_Review.md`.
- [ ] **By 31 Oct:** team decides who signs, which bank account gets the prize, and how many ambassador posts/events per month you can accept (fill the blanks in comment 4), then sends the Lao comments in the review to SPK.
- [ ] 2 Nov: final version. 15 Nov: signing and prize money.

## 🟢 PhaJay test (free, test money only)

The sandbox already works. See `winner-agreement/PhaJay_Sandbox_Test.md`.

- [ ] **Install the PhaJay test app** on an Android phone: https://drive.google.com/drive/folders/1JQutjatlk3PKTzpiqLzwZlQRjgDMOD9U
- [ ] **Pay one test QR.** In a terminal:
  ```bash
  cd ~/phalom3/pitch/phalom-app
  export PHAJAY_TEST_KEY='...'        # Test Key from portal.phajay.co → ຈັດການ key
  node scripts/phajay-sandbox.mjs qr bcel 10000
  ```
  Open `out/phajay-qr.html`, scan it with the test app, and pay. Then tell Claude whether it said paid, and screenshot the portal's ປະຫວັດການຊຳລະ (payment history) and Logs pages.
- [ ] **Webhook URL:** once Claude has built the PhaJay receiver in our app, Claude will give you a URL. Paste it in the portal under ການຕັ້ງຄ່າ → Webhook. (Claude can't log in to the portal.)
- [ ] **Message PhaJay's developer contact** on WhatsApp, +856 20 5914 4188. Draft below; edit it as you like. Write their answers into `winner-agreement/PhaJay_Sandbox_Test.md`, or give them to Claude.

  > ສະບາຍດີ ທີມ PhaJay. ພວກເຮົາແມ່ນທີມ Phalom, ແອັບຊ່ວຍຮ້ານນ້ອຍຮັບເງິນຈາກນັກທ່ອງທ່ຽວ. ພວກເຮົາໄດ້ທົດລອງ sandbox ແລ້ວ, QR ທະນາຄານ ແລະ payment link ໃຊ້ໄດ້ດີ. ຂໍຖາມແດ່:
  > 1. ນັກທ່ອງທ່ຽວຈີນ ແລະ ໄທ ຈ່າຍດ້ວຍ Alipay, WeChat Pay ຫຼື ແອັບທະນາຄານໄທ ໃສ່ຮ້ານລາວຜ່ານ PhaJay ໄດ້ບໍ? ຮ້ານໄດ້ເງິນກີບ ແລະ ຄ່າທຳນຽມເທົ່າໃດ?
  > 2. ມີ sandbox ສຳລັບ Alipay / WeChat Pay ບໍ?
  > 3. ໃນ sandbox ກວດສະຖານະ transaction ບໍ່ໄດ້ (PAYMENT_NOT_FOUND). ຕ້ອງໃຊ້ webhook ແທນ ແມ່ນບໍ?
  > 4. ພວກເຮົາມີຫຼາຍຮ້ານໃນລະບົບດຽວ: ແຕ່ລະຮ້ານຕ້ອງ KYC ແຍກ, ຫຼື ໃຊ້ split payment ສົ່ງເງິນເຂົ້າບັນຊີແຕ່ລະຮ້ານໄດ້ບໍ?
  > 5. QR ຂອງ PhaJay (JDB, LDB, IB, STB, APB, M-Money) ແມ່ນ LAO QR ບໍ? ແອັບທະນາຄານໄທ, VietQR ຫຼື UnionPay ສະແກນຈ່າຍໄດ້ບໍ? (ເອກະສານບອກວ່າ QR BCEL ຈ່າຍໄດ້ສະເພາະ BCEL One.)
  > 6. ຈະຂໍສະຖານະ parent / agent ເພື່ອໃຊ້ Sub Account ແລະ Split Payment ແນວໃດ? ສ້າງ sub account ໃຫ້ຮ້ານຜ່ານ API ໄດ້ບໍ? ຮ້ານນ້ອຍທີ່ມີແຕ່ບັດປະຈຳຕົວ ແລະ ບັນຊີທະນາຄານ (ບໍ່ມີໃບທະບຽນທຸລະກິດ) ເປັນ sub account ໄດ້ບໍ? ຕ້ອງເຮັດ 5 ທຸລະກຳຈິງກ່ອນບໍ?
  > 7. ຫຼັງຈາກກົດ Claim, ເງິນເຂົ້າບັນຊີຮ້ານຈັກມື້? ມີຄ່າທຳນຽມຖອນບໍ? ຖອນອັດຕະໂນມັດ ຫຼື parent ກົດ Claim ແທນຮ້ານໄດ້ບໍ?
  > 8. ຮ້ານບວກຄ່າທຳນຽມໃສ່ລາຄາຂອງລູກຄ້າໄດ້ບໍ? ມີລາຄາພິເສດສຳລັບ platform ທີ່ມີຮ້ານນ້ອຍຫຼາຍຮ້ານບໍ?
  > 9. PhaJay ມີໂປຣແກຣມ partner ຫຼື ແບ່ງລາຍຮັບ ສຳລັບ platform ບໍ?
  > 10. Phalom ເປັນບັນຊີແມ່ ແລະ ເກັບເອກະສານ (ບັດປະຈຳຕົວ, ບັນຊີທະນາຄານ) ຂອງແມ່ຄ້າໃຫ້ PhaJay ກວດ ແທນການໃຫ້ແມ່ຄ້າເຮັດ KYC ເອງໄດ້ບໍ?
  > 11. ບັດ Visa/Mastercard, Alipay ແລະ WeChat Pay ຜ່ານ Payment Link ໃຊ້ກັບເງິນແທ້ໄດ້ແລ້ວບໍ? ຮ້ານໄດ້ຮັບເປັນກີບບໍ (ເອກະສານບັດບອກວ່າ USD)?
  > 12. ຖ້າເຈົ້າຂອງບັດຂໍເງິນຄືນ (chargeback), ຂັ້ນຕອນແນວໃດ ແລະ ໃຜຮັບຜິດຊອບ: ຮ້ານ, ບັນຊີແມ່ ຫຼື PhaJay?
  > ຂອບໃຈຫຼາຍໆ

  Why these matter: `winner-agreement/PhaJay_E2E_Business_Process.html` (23 Oct) and the new proposal `winner-agreement/Phalom_New_Solution_lo.html` (25 Oct). Question 7 (instant, automatic payout) decides whether PhaJay fits the new proposal at all.

## 🔵 Team decisions (details in `BUSINESS.md`)

- [ ] Where the pilot starts: Vientiane or Luang Prabang.
- [x] 25 Oct 2026: How Phalom earns money: **transaction fee only**, paid by the **tourist** at payment time, cheaper than LOCA Pay. Vendors pay nothing. Proposal: `winner-agreement/Phalom_New_Solution_lo.html`.
- [ ] **Confirm the partner choice: BCEL first, LOCA Pay as backup, NewPay asked in parallel for Alipay/WeChat only.** Why and what to ask: `winner-agreement/Partner_Choice_lo.md` (27 Oct). No partner offers everything today; BCEL has the most pieces.
- [ ] The fee rate. Proposal: 2.9% + 1,000 kip (always under LOCA Pay's 3% + 5,000). Depends on the partner's price.
- [ ] Company registration: what kind of company, and who owns which share.
- [ ] Ask the Bank of the Lao PDR or a lawyer whether Phalom needs its own licence.

## ⚪ Later (after the above)

- [ ] PhaJay KYC for live money. Needs the registered company and documents; never put them in this repo.
- [ ] Visit 3–5 real shops; write down what they say (no names or phone numbers in the repo).
- [ ] Test the app on real Android phones in a real market.

## Done

- [x] 23 Oct 2026: signed in to GitHub with `gh`; `main` is the shared branch.
- [x] 23 Oct 2026: opened a free PhaJay portal test account and got the Test Key.

## 🔵 Business model evidence (free, needs people)

- [ ] **Visit 5–10 vendors** in the pilot market and write the answers down (in `knowledge-base/` or tell Claude): Do you already have a bank QR (BCEL OnePay or other)? Do Thai, Chinese or Vietnamese tourists pay it with their own apps? What's hard about selling to tourists? How often does a tourist walk away because they have no cash and can't pay the QR? Would you put up a free Phalom sign so tourists can pay by card, Alipay or WeChat Pay (the tourist pays the fee, you get the full price instantly)? Do you have an ID card and a personal bank account (no business licence needed)? Don't record names or phone numbers in the repo.
- [ ] **Ask BCEL** (branch or OnePay desk) what a merchant pays for LAO QR / OnePay Shop. No public rate found.
- [ ] **Contact BCEL first (EzyKip / OnePay team), then LOCA and LDB.** BCEL card centre: cardcenter@bcel.com.la, +856 21 211012 ext. 3. If BCEL says no or doesn't answer within 3 weeks, go to LOCA (+856 20 9811 1129). Ask NewPay (business@newpay.la) in parallel about Alipay/WeChat payouts to vendors' bank accounts. If BCEL only offers its normal gateway (money to Phalom's account next day), don't agree yet: Phalom would hold money. Details: `winner-agreement/Partner_Choice_lo.md`. This decides the new proposal (`winner-agreement/Phalom_New_Solution_lo.html`, v4). Pitch it as: Phalom brings the bank micro-vendors its sales team does not reach, and all foreign card / Alipay payments run through the bank. Draft, edit as you like:

  > ສະບາຍດີ. ພວກເຮົາແມ່ນທີມ Phalom, ຊະນະການແຂ່ງຂັນ Innovative Business Challenge 2026. ພວກເຮົາຊ່ວຍນັກທ່ອງທ່ຽວຊອກຫາ ແລະ ຈ່າຍເງິນໃຫ້ແມ່ຄ້ານ້ອຍ (ແຜນທີ່, ເມນູ 5 ພາສາ). ຢາກຮ່ວມມືໃຫ້ນັກທ່ອງທ່ຽວສະແກນປ້າຍ Phalom ດ້ວຍກ້ອງໂທລະສັບ ແລ້ວຈ່າຍດ້ວຍບັດ, Apple Pay, Alipay ຫຼື WeChat Pay ໃນໜ້າເວັບ (ບໍ່ຕ້ອງດາວໂຫຼດແອັບ), ແລະ ລະບົບຂອງທ່ານໂອນລາຄາເຕັມເຂົ້າ LAO QR ຂອງແມ່ຄ້າ. ຂໍຖາມແດ່:
  > 1. ໂອນເຂົ້າບັນຊີທະນາຄານຂອງແມ່ຄ້າ ຜ່ານ LAO QR ທັນທີ ໄດ້ບໍ່?
  > 2. ມີ API ໃຫ້ Phalom ເອີ້ນຈາກໜ້າເວັບ (ບັດ, Apple Pay, Google Pay, Alipay, WeChat Pay) ບໍ່?
  > 3. ຕົ້ນທຶນຕໍ່ລາຍການເທົ່າໃດ? ພວກເຮົາຢາກໃຫ້ນັກທ່ອງທ່ຽວຈ່າຍທັງໝົດບໍ່ເກີນ 2.9% + 1,000 ກີບ ແລະ ແບ່ງສ່ວນໜຶ່ງໃຫ້ Phalom.
  > 4. ນັກທ່ອງທ່ຽວຈ່າຍຄ່າທຳນຽມ (ສະແດງກ່ອນຈ່າຍ) ໄດ້ບໍ່ ຕາມກົດຂອງບັດ ແລະ Alipay?
  > 5. ຖ້າເຈົ້າຂອງບັດຂໍເງິນຄືນ (chargeback), ໃຜຮັບຜິດຊອບ? ບັດທຸກໃບໃຊ້ 3-D Secure ໄດ້ບໍ່? ຫັກຈາກຍອດຂາຍຄັ້ງຕໍ່ໄປຂອງຮ້ານ ໄດ້ບໍ່? ຕ້ອງກັນເງິນໄວ້ (reserve) ບໍ່, ຖ້າຕ້ອງ: ຈັກ % ແລະ ຈັກມື້? Alipay / WeChat Pay ຕ້ອງກັນບໍ່?
  > 6. Phalom ບໍ່ແຕະເງິນເລີຍ: ແບບນີ້ Phalom ຕ້ອງມີໃບອະນຸຍາດບໍ່?
  > ຂອບໃຈຫຼາຍໆ
- [ ] **Check EzyKip's and LOCA Pay's real fees** in the apps (sources disagree: LOCA 3% + 5,000 kip or 1.5%; EzyKip 2.1% top-up). Write the numbers in BUSINESS.md.
- [ ] **Ask a lawyer or the Bank of the Lao PDR:** if a licensed partner takes the tourist's money and pays it straight into the vendor's LAO QR, and Phalom only does the software and signs vendors up, does Phalom need a payment licence?
