# ການກວດສອບຄຸນສົມບັດ ແລະ ຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນ PhaJay (Fact-Check Audit)

ວັນທີກວດສອບ: **22 ພະຈິກ 2026**
ແຫຼ່ງຂໍ້ມູນຫຼັກທີ່ກວດສອບໂດຍກົງ:
- ລາຍຊື່ຜູ້ໃຫ້ບໍລິການຊຳລະເງິນທາງການຂອງ **ທະນາຄານແຫ່ງ ສປປ ລາວ (BOL)** (ຂໍ້ຕົກລົງ 511/ທຫລ, ອັບເດດ 28 ພ.ຈ. 2025 / ເຜີຍແຜ່ 08 ທ.ວ. 2025): `https://www.bol.gov.la/fileupload/08-12-2025_1765168343.pdf`
- ເວັບໄຊ ແລະ ລາຄາຂອງ PhaJay: `https://www.phajay.co/en/pricing`, `https://www.phajay.co/en/terms-of-service`, `https://www.phajay.co/en/privacy-policy`
- ເອກະສານນັກພັດທະນາ PhaJay (ກວດຄົບທຸກໜ້າ `/v1/`): `https://payment-doc.phajay.co/v1/`
- ການຢືນຢັນໂດຍກົງຈາກທີມ PhaJay ຫາທີມ Phalom (22 ພ.ຈ. 2026): *WeChat Pay ແລະ Alipay ຍັງຢູ່ໃນຂັ້ນຕອນພັດທະນາ.*

---

## ສະຫຼຸບຜົນການກວດສອບ (Go / No-Go)

**ຜົນລວມ: ❌ PhaJay ຍັງບໍ່ຜ່ານເງື່ອນໄຂຫຼັກຂອງ Phalom ໃນປັດຈຸບັນ (NO-GO ສຳລັບການເປັນຄູ່ຮ່ວມຫຼັກ).**

ເຫດຜົນທີ່ຢັ້ງຢືນແລ້ວຈາກຫຼັກຖານຕົວຈິງ 4 ຂໍ້ໃຫຍ່:
1. **ບໍ່ມີ Alipay / WeChat Pay ໃຊ້ງານໄດ້ແທ້:** ເຖິງວ່າໜ້າລາຄາ `phajay.co/en/pricing` ຈະຂຽນ `4.15%`, ແຕ່ **ບໍ່ມີ API docs, ບໍ່ມີ sandbox, ບໍ່ມີຊື່ໃນບັນຊີ BOL ສຳລັບ Alipay/WeChat (ພ.ຈ. 2025)**, ແລະ **PhaJay ຢືນຢັນເອງແລ້ວວ່າຍັງພັດທະນາຢູ່.**
2. **ແພງກວ່າ LOCA Pay ສຳລັບບັດຕ່າງປະເທດ + ມີຄ່າທຳນຽມແຝງໃນ Terms of Service:**
   - ບັດ Visa `4.15%`, Mastercard `5.15%` (ເກັບເປັນ **USD** ຜ່ານ JDB+2C2P) → ແພງກວ່າ LOCA Pay (`3% + 5,000 ກີບ`) ທັນທີເມື່ອຍອດຊື້ເກີນ ~233,000 ກີບ (Mastercard) ຫຼື ~435,000 ກີບ (Visa) — ຍັງບໍ່ທັນບວກກຳໄລ Phalom!
   - **ພົບຂໍ້ຂັດແຍ່ງໃນເວັບໄຊ PhaJay ເອງ:** ໜ້າ `pricing` ຂຽນ QR `1.60%`, ແຕ່ໜ້າ `terms-of-service` (ຂໍ້ 5–6) ຂຽນວ່າ: **≤ 40,000 ກີບ ເກັບ 500 ກີບ; > 40,000 ກີບ ເກັບ 1.65%; ຄ່າຖອນເງິນ (Claim) 5,000 ກີບ/ຄັ້ງ; ຄ່າຄືນເງິນ (Refund) 1% ເກັບຈາກ Platform Owner.**
3. **ເງິນບໍ່ເຂົ້າບັນຊີແມ່ຄ້າທັນທີ ແລະ ບໍ່ໂອນວັນເສົາ-ອາທິດ:** ເຖິງວ່າ PhaJay ຈະເພີ່ມລະບົບ **Auto Claim** (ສ້າງຄຳຂໍຖອນອັດຕະໂນມັດ 08:00), ແຕ່ເອກະສານລະບຸຊັດເຈນວ່າ *"Auto Claim only creates the request — it never skips the review"* — ແອັດມິນຍັງຕ້ອງກວດ ແລະ ໂອນມື້ **ຈັນ–ສຸກ 10:00–17:00/18:00 ເທົ່ານັ້ນ** (ຕະຫຼາດກາງຄືນຂາຍດີວັນສຸກ–ອາທິດ!).
4. **QR BCEL ບໍ່ແມ່ນ LAO QR + ບໍ່ມີ Apple/Google Pay/PromptPay/VietQR:** ເອກະສານ `generateQR` ລະບຸຊັດເຈນວ່າ QR BCEL ຂອງ PhaJay ຈ່າຍໄດ້ສະເພາະແອັບ **BCEL One** ເທົ່ານັ້ນ.

---

## ຕາຕະລາງກວດສອບທຽບກັບ 8 ເງື່ອນໄຂຂອງ Phalom

| # | ເງື່ອນໄຂຂອງ Phalom | ສະຖານະ | ຫຼັກຖານຢັ້ງຢືນໂດຍກົງ (22 ພ.ຈ. 2026) |
|---|---|---|---|
| **1** | **ໃບອະນຸຍາດ ທຫລ (BOL)** (ພາຍໃນ ແລະ ຂ້າມແດນ) | ⚠️ **ຜ່ານບາງສ່ວນ (ພາຍໃນເທົ່ານັ້ນ)** | **ຢັ້ງຢືນແລ້ວຈາກ PDF ທາງການຂອງ ທຫລ (28 ພ.ຈ. 2025, ໜ້າ 20):** `PhaPay Co., LTD` ໄດ້ຮັບອະນຸຍາດ **Payment Facilitating ພາຍໃນປະເທດ** (`PhaJay Payment Gateway for e-Commerce website`). **ບໍ່ມີຊື່ໃນໝວດ Cross-Border Acquiring (ໜ້າ 39–43)** (ໝວດນີ້ມີ BCEL, JDB, LDB, NewPay, LOCA Pay). ບັດເຄຣດິດຂອງ PhaJay ອາໄສ JDB (`jdb2c2p`). *ຖ້າ PhaJay ໄດ້ໃບອະນຸຍາດຂ້າມແດນໃໝ່ໃນປີ 2026 ຕ້ອງຂໍສຳເນົາຢັ້ງຢືນ.* |
| **2** | **ໜ້າເວັບຈ່າຍເງິນ / API (0 ແອັບ)** | ⚠️ **ຜ່ານບາງສ່ວນ** | ມີ Payment Link (`/v1/payment-link`), Bank QR (`/v1/connect-payment-QR/generateQR`) ແລະ ໜ້າບັດເຄຣດິດ 2C2P (`/v1/api/jdb2c2p/payment/payment-link`). **ບໍ່ມີ API/ໜ້າເວັບສຳລັບ Alipay ຫຼື WeChat Pay.** |
| **3** | **ຮັບບັດຕ່າງປະເທດ, Apple/Google Pay, Alipay, WeChat, PromptPay, VietQR** | ❌ **ບໍ່ຜ່ານ** | • **Alipay / WeChat:** PhaJay ຢືນຢັນເອງວ່າ **ຍັງພັດທະນາຢູ່** (ບໍ່ມີ docs/sandbox).<br>• **Visa/Mastercard:** ມີຜ່ານ JDB+2C2P (3DS only, ຕ້ອງ KYC), ແຕ່ສະກຸນເງິນໃນ webhook ແມ່ນ **USD** (`"currency": "USD"`) ແລະ ລາຄາ 4.15% / 5.15%.<br>• **Apple/Google Pay / PromptPay / VietQR / UnionPay:** ບໍ່ມີໃນເວັບ ຫຼື docs.<br>• **BCEL QR:** *"is not a Lao QR, so it can only be scanned and paid using the BCEL One app."* |
| **4** | **ໂອນເງິນກີບເຕັມ 100% ເຂົ້າບັນຊີແມ່ຄ້າທັນທີ (Phalom ບໍ່ຖືເງິນ)** | ❌ **ບໍ່ຜ່ານ** | • **Split Payment** (`/v1/split-payment`) ແຍກສ່ວນແບ່ງໃຫ້ parent/sub-account ໄດ້ໂດຍ Phalom ບໍ່ຖືເງິນ (Percent, Fixed LAK, Tiered LAK) **ແຕ່ Fixed & Tiered ໃຊ້ໄດ້ສະເພາະ LAK — ລາຍການ USD (ບັດເຄຣດິດ) ຈະບໍ່ຖືກ split** (ໃຊ້ໄດ້ແຕ່ Percent).<br>• **ບໍ່ທັນທີ:** Auto Claim (`/v1/auto-claim`) ສ້າງຄຳຂໍ 08:00 ແຕ່ຍັງລໍຖ້າແອັດມິນກວດ ແລະ ໂອນ **ຈັນ–ສຸກ 10:00–17:00/18:00** (ບໍ່ໂອນວັນເສົາ–ອາທິດ).<br>• ບັນຊີແມ່ (Phalom) ເບິ່ງປະຫວັດ sub-account ໄດ້ຢ່າງດຽວ (view only) — ກົດ Claim ຫຼື Refund ແທນບໍ່ໄດ້. |
| **5** | **ແມ່ຄ້ານ້ອຍບໍ່ມີໃບທະບຽນທຸລະກິດ** | ⚠️ **ຍັງບໍ່ຊັດເຈນ** | **ແກ້ໄຂຂໍ້ມູນເກົ່າ:** `terms-of-service` ຂໍ້ 4 ລະບຸ **Individual KYC** (ບັດປະຈຳໂຕ/ພາສປອດ + ບັນຊີສ່ວນຕົວ + ລາຍລະອຽດທຸລະກິດ + ເວັບໄຊ — ບໍ່ໄດ້ລະບຸໃບທະບຽນທຸລະກິດ). ແຕ່ `how-to-kyc` ຍັງບັງຄັບ **5 ທຸລະກຳເງິນແທ້ກ່ອນ KYC** ແລະ ບໍ່ມີ API ສ້າງ sub-account — ຕ້ອງຖາມ PhaJay ເປັນລາຍລັກອັກສອນ. |
| **6** | **ຕົ້ນທຶນຕ່ຳກວ່າ LOCA (`3% + 5,000 ກີບ`) + Phalom ມີລາຍໄດ້** | ❌ **ບໍ່ຜ່ານ** | • ໜ້າ `pricing`: QR/Link `1.60%`, Visa `4.15%`, Mastercard `5.15%`, Alipay/WeChat `4.15%`.<br>• ໜ້າ `terms-of-service`: ≤ 40,000 ກີບ = `500 ກີບ`, > 40,000 ກີບ = `1.65%`, **ຄ່າ Claim `5,000 ກີບ/ຄັ້ງ`**, **ຄ່າ Refund `1%`**.<br>• ຖ້າ Auto Claim ທຸກມື້ × 5,000 ກີບ = 150,000 ກີບ/ເດືອນ/ຮ້ານ (ແພງເກີນໄປສຳລັບແມ່ຄ້ານ້ອຍ).<br>• ບັດ 4.15%–5.15% ແພງກວ່າ LOCA ຢູ່ແລ້ວສຳລັບຍອດກາງ–ໃຫຍ່; ບໍ່ມີໂປຣແກຣມແບ່ງລາຍຮັບສາທາລະນະ; ຍັງບໍ່ຢັ້ງຢືນວ່າບວກຄ່າທຳນຽມໃສ່ນັກທ່ອງທ່ຽວໄດ້ບໍ່. |
| **7** | **3-D Secure ແລະ ຄວາມຮັບຜິດຊອບ Chargeback** | ⚠️ **ຜ່ານບາງສ່ວນ** | `connect-credit-card` ຢັ້ງຢືນ **ຮັບສະເພາະບັດທີ່ເປີດ 3-D Secure (3DS) ເທົ່ານັ້ນ**. ແຕ່ໃນ Terms of Service ແລະ docs **ບໍ່ມີຂໍ້ກຳນົດເລື່ອງ Chargeback** (ໃຜຮັບຜິດຊອບ, ມີ reserve ຫຼື ບໍ່). |
| **8** | **Webhook ແຈ້ງການຈ່າຍເງິນທີ່ປອດໄພ** | ✅ **ຜ່ານ** | `verify-webhook-signature` ຢັ້ງຢືນ `X-Signature` = Base64 HMAC-SHA256 ຂອງ raw body (`devSecretKey` ກ່ອນ KYC / `secretKey` ຫຼັງ KYC), `status: "PAYMENT_COMPLETED"`. Phalom ຂຽນ adapter ຮອງຮັບໄວ້ແລ້ວ (`src/payments.ts`). |

---

## ສິ່ງທີ່ແກ້ໄຂຈາກເອກະສານເກົ່າໃນ Repo (ເພື່ອໃຫ້ຂໍ້ມູນທຸກຢ່າງຖືກຕ້ອງ 100%)

| ຫົວຂໍ້ | ຂໍ້ມູນເກົ່າໃນ Repo (ຕ.ລ. 2026) | ຂໍ້ມູນຈິງທີ່ກວດພົບໃໝ່ (22 ພ.ຈ. 2026) |
|---|---|---|
| ໃບອະນຸຍາດ BOL ຂອງ PhaJay | ຂຽນວ່າ `❓` (`Partner_Choice_lo.md`) | **ຢັ້ງຢືນແລ້ວ:** ມີໃບອະນຸຍາດ BOL **Domestic Payment Facilitating** (BOL PDF 28 ພ.ຈ. 2025 ໜ້າ 20), ແຕ່ **ບໍ່ມີຊື່ໃນໝວດ Cross-Border** (ໜ້າ 39–43). |
| ຄ່າທຳນຽມ QR & ຄ່າຖອນ | ຄິດວ່າມີແຕ່ `1.60%` ແລະ ບໍ່ຮູ້ຄ່າຖອນ (`PhaJay_Real_Fee_Check.md`) | **ພົບຂໍ້ຂັດແຍ່ງ:** `terms-of-service` ລະບຸ **500 ກີບ (≤ 40k) / 1.65% (> 40k)**, **ຄ່າ Claim 5,000 ກີບ/ຄັ້ງ**, ແລະ **ຄ່າ Refund 1%**. |
| ລະບົບຖອນເງິນ (Claim) | ບອກວ່າຕ້ອງກົດມືຢ່າງດຽວ (`PhaJay_E2E_Business_Process.html`) | PhaJay ເພີ່ມ **Auto Claim** (08:00 ຕາມຕາຕະລາງ), ແຕ່ຍັງຕ້ອງລໍແອັດມິນໂອນ **ຈັນ–ສຸກ 10:00–17:00/18:00** (ບໍ່ທັນທີ). |
| Individual KYC (ບໍ່ມີໃບທະບຽນ) | ກັງວົນວ່າຕ້ອງມີໃບທະບຽນທຸລະກິດທຸກຄົນ | `terms-of-service` ຂໍ້ 4 ມີ **Individual KYC** (ບັດປະຈຳໂຕ + ບັນຊີສ່ວນຕົວ), ແຕ່ຍັງຕ້ອງຢັ້ງຢືນເງື່ອນໄຂ 5 ທຸລະກຳ ແລະ sub-account. |
| Split Payment ກັບບັດ USD | ຂຽນແຕ່ແບບ Percent | ມີ Percent / Fixed LAK / Tiered LAK, **ແຕ່ Fixed & Tiered ບໍ່ເຮັດວຽກກັບບັດ USD**; ບັນຊີແມ່ກົດ Claim/Refund ແທນ sub-account ບໍ່ໄດ້. |
| Alipay & WeChat Pay | ຂຽນວ່າ `✅ ແຕ່ 4.15%` ໃນຕາຕະລາງເກົ່າ | **ບໍ່ພ້ອມໃຊ້:** ບໍ່ມີ docs/sandbox ແລະ PhaJay ຢືນຢັນເອງວ່າ **ຍັງພັດທະນາຢູ່**. |

---

## ຖ້າທີມຍັງຢາກຖາມຢັ້ງຢືນກັບ PhaJay ເປັນລາຍລັກອັກສອນ (6 ຄຳຖາມທີ່ຕັດສິນໄດ້ທັນທີ)

ຖ້າ PhaJay ຕອບບໍ່ໄດ້ ຫຼື ຕອບ "ບໍ່ໄດ້" ໃນຂໍ້ 1–4 → **ປິດປະເດັນ PhaJay ແລະ ມຸ່ງໜ້າໄປ BCEL / NewPay / LOCA ທັນທີ:**

1. **Alipay & WeChat Pay:** ມີກຳນົດເປີດໃຊ້ຈິງ (Production + API + Sandbox) ເດືອນໃດ? ຮ້ານຮັບເປັນເງິນກີບ ຫຼື USD? ໃຊ້ໃບອະນຸຍາດ ທຫລ ຂອງ PhaPay ເອງ ຫຼື ຜ່ານທະນາຄານໃດ?
2. **ລາຄາຈິງ (ແກ້ຂໍ້ຂັດແຍ່ງ):** ໜ້າ Pricing ຂຽນ QR `1.60%` ແຕ່ Terms of Service ຂຽນ `500 ກີບ (≤40k) / 1.65% (>40k)` + `ຄ່າ Claim 5,000 ກີບ/ຄັ້ງ` + `ຄ່າ Refund 1%`. ອັນໃດແມ່ນລາຄາທີ່ໃຊ້ແທ້ປັດຈຸບັນ? ມີລາຄາພິເສດສຳລັບແພລັດຟອມທີ່ມີແມ່ຄ້ານ້ອຍຫຼາຍຮ້ານບໍ່?
3. **Visa / Mastercard:** ຕົ້ນທຶນຕ່ຳກວ່າ `4.15% / 5.15%` ໄດ້ບໍ່? ເກັບ ແລະ ໂອນເປັນເງິນກີບ (LAK) ໄດ້ບໍ່ (ໃນ docs ແມ່ນ USD)? ໃຜຮັບຜິດຊອບ chargeback?
4. **ການໂອນເງິນໃຫ້ແມ່ຄ້າ:** ໂອນທັນທີ (ຫຼື ລວມວັນເສົາ–ອາທິດ) ໂດຍບໍ່ເສຍຄ່າ Claim 5,000 ກີບ/ຄັ້ງ ໄດ້ບໍ່?
5. **QR ທະນາຄານອື່ນ (JDB, LDB, IB, STB, APB, M-Money):** ແມ່ນ LAO QR ທີ່ແອັບທະນາຄານໄທ (PromptPay), VietQR ແລະ UnionPay ສະແກນຈ່າຍໄດ້ບໍ່? (ຮູ້ແລ້ວວ່າ BCEL QR ຂອງ PhaJay ຈ່າຍໄດ້ສະເພາະ BCEL One.)
6. **Sub-Account ສຳລັບແມ່ຄ້ານ້ອຍ:** ແມ່ຄ້າໃຊ້ Individual KYC (ບັດປະຈຳໂຕ + ບັນຊີທະນາຄານ, ບໍ່ມີໃບທະບຽນທຸລະກິດ, ບໍ່ມີເວັບໄຊ, ບໍ່ຕ້ອງເຮັດ 5 ທຸລະກຳກ່ອນ) ໄດ້ບໍ່? ສ້າງ sub-account ຜ່ານ API ໄດ້ບໍ່?

---

## English Executive Summary

- **Verdict: PhaJay does NOT meet Phalom's core v4 requirements today (NO-GO as primary partner).**
- **Verified true:** PhaPay Co., Ltd. (PhaJay) IS officially licensed by the Bank of the Lao PDR for **Domestic Payment Facilitating** (BOL official register dated 28 Nov 2025, p. 20), offers 3DS-only Visa/Mastercard via JDB+2C2P, offers Split Payment (Percent/Fixed/Tiered) + scheduled Auto Claim, and has a clean HMAC-SHA256 webhook (`X-Signature`).
- **Verified deal-breakers:**
  1. **Alipay & WeChat Pay are NOT live** (zero API docs/sandbox, not listed under BOL cross-border acquirers, and PhaJay confirmed to the team on 22 Nov 2026 they are still in development).
  2. **Pricing contradictions & hidden fees:** `phajay.co/en/pricing` lists 1.60% QR, 4.15% Visa, 5.15% Mastercard, while `phajay.co/en/terms-of-service` lists **500 LAK (≤40k) / 1.65% (>40k)**, **5,000 LAK per Claim**, and **1% refund fee**. Card rates (4.15–5.15%, USD) exceed LOCA Pay (3% + 5,000 LAK) on mid/large orders even before Phalom's margin, and Fixed/Tiered Split Payment does not apply to USD card payments.
  3. **No instant or weekend settlement:** Auto Claim still waits for manual admin approval/transfer Mon–Fri 10:00–17:00/18:00 only.
  4. **No cross-border QR/wallets:** BCEL QR is explicitly *not* LAO QR (BCEL One only); PromptPay, VietQR, Apple Pay, and Google Pay are not listed.
- **Recommendation:** Proceed with **BCEL** (licensed by BOL for Visa/MC/UnionPay/JCB + Alipay + WeChat Pay) and **NewPay** (licensed by BOL for Alipay/Alipay+/WeChat Pay, p. 43) in parallel, with **LOCA Pay** (the only BOL-listed Cross-Border Payment Facilitator, p. 43) as backup.
