# Phalom: Business Knowledge Base

> **ນັກທ່ອງທ່ຽວຈ່າຍແບບບ້ານເຂົາ — ແມ່ຄ້າຮັບເງິນກີບແບບບ້ານເຮົາ**
> "Tourists pay the way they do at home. Vendors receive kip the way we do at home."

Team **ພັດລົມ (Phalom)** · Innovative Business Challenge, Challenge 10: "ຮັບເງິນຕ່າງປະເທດຍຸ້ງຍາກ" (cross-border payments for small shops)
Last updated: 16 October 2026. Every number here matches the live pitch deck as of this date.

---

## 1. Phalom in one paragraph

Phalom is a **Lao-language app for small souvenir shops and street-food vendors** at tourist spots in Laos. It lets them accept payments from foreign tourists who pay with the apps they already use at home (PromptPay, Alipay, WeChat Pay, UnionPay, VietQR). The vendor receives **Lao kip** in their own Lao bank account and hears a voice say "ໄດ້ຮັບເງິນ … ກີບ" when the money arrives. Phalom does not build new payment rails and **never holds anyone's money**. It sits on top of an existing licensed payment gateway, **PhaJay**. Phalom's job is the last mile: going to each vendor, signing them up, and giving them a simple app they can actually use. The vendor pays Phalom nothing. Phalom earns a share of the fee PhaJay already charges.

---

## 2. The problem

**Tourists want to buy, but they can't pay.**

A Chinese tourist at the night market wants to buy a handwoven scarf (ຜ້າທໍ). They have no kip, only Alipay. The vendor takes only cash or a personal LaoQR. The tourist walks away and the sale is lost.

| Fact | Number | Source |
|---|---|---|
| International visitors to Laos, 2025 | **4,580,709** (+11% vs 2024's 4.12M) | Ministry of Information, Culture and Tourism via KPL (01/2026) |
| Share from Thailand, China, Vietnam | **82.3%** (TH 1,484,319 · CN 1,157,278 · VN 1,129,109) | KPL (01/2026) |
| Tourist spending in Laos, 2024 | **USD 1,421,992,819** | Tourism Development Dept., Statistical Report on Tourism 2024, table 7 |
| Government target, 2026–2030 | **22 million** international visitors | Laotian Times (16/01/2026) |

These three countries pay by QR as a matter of habit. Most small shops still take only cash.

### Root cause (the "why" chain on slide 3)

1. **Effect:** vendors lose sales.
2. **Why 1:** tourists can't pay with their own app.
3. **Why 2:** the vendor's QR is a personal bank account that isn't registered to receive foreign payments.
4. **Why 3:** the channels are separate and information is hard to find. The team asked 4 banks online: 2 didn't answer, 2 said to go ask at a branch.
5. **Why 4:** for a bank, teaching small vendors one by one doesn't pay off.
6. **Real root cause:** it isn't a technology problem. **The money rails exist, but nobody builds the bridge (ສະພານ) to the small vendor.**

The rails that already exist:
- 07/2024: Thai bank apps can scan Lao QR (Bank of Thailand; Krungsri)
- 12/2024: China UnionPay connected with LAPNet
- 01/2025: Vietnamese apps can scan Lao QR

---

## 3. The solution

**A shop app built on the money rails that already exist.** Money goes through PhaJay into the vendor's own bank. The team never touches it.

The four parts (slide 5):

| # | Lao label | What it means |
|---|---|---|
| 1 | **ພາເຂົ້າລະບົບ** (get on board) | Sign up on a phone and get **one QR stand that works with every app** |
| 2 | **ຄິດເງິນງ່າຍ** (easy checkout) | Menu and prices are stored in the app. Tap the items, the app adds up the total, and a QR for that exact amount appears |
| 3 | **ເຫັນຍອດຂາຍ** (see your sales) | Today's sales in kip, and a receipt for every payment |
| 4 | **ປອດໄພ ບໍ່ຕ້ອງກັງວົນ** (safe, no worries) | Money goes straight to the bank, so there are no fake payment slips |

Three promises:
- **0** new apps the tourist has to download
- **1** QR stand that takes PromptPay, Alipay, WeChat Pay, UnionPay and VietQR
- **0 kip** held by the team. Money goes directly to the vendor's account.

### How a payment works

```
Tourist's own app  →  PhaJay (licensed payment gateway)  →  Vendor's Lao bank account (kip)
   (Alipay, WeChat,        takes Alipay / WeChat /              shop app says
    PromptPay, VietQR,     cross-border QR                      "ໄດ້ຮັບເງິນ 50,000 ກີບ"
    UnionPay)
```

1. **Sign up:** the vendor registers on their phone and gets one QR stand.
2. **Scan:** the tourist sees familiar logos and scans with their own app.
3. **Through PhaJay:** PhaJay takes the payment and sends it to the vendor's bank account in kip.
4. **Hear it:** the app announces the amount aloud, so the vendor can hand over the goods right away without checking a phone and can't be fooled by a fake slip.

### Before and after (slide 9)

| Before | After |
|---|---|
| A tourist without kip walks away | The tourist scans with their own app straight away |
| The vendor works out the exchange rate themselves | The price is in kip and is clear. The tourist's own bank handles any exchange |
| The vendor isn't sure money really arrived and risks fake slips | Kip lands in the account and a voice confirms it |
| Sales only come from people walking past | New customers find the shop through the shop map |

---

## 4. Customers and users

| Who | Role | What they get |
|---|---|---|
| **Small vendors** (souvenirs, street food, night markets) | Main customer and user of the shop app | Sales they used to lose, kip in their own bank, a Lao-language app, sales records. They pay **nothing** to Phalom |
| **Foreign tourists** (mainly TH, CN, VN) | Payer | They pay with the app they already have. No download, no cash exchange |
| **PhaJay** | Payment partner | New merchants without spending on field sales |
| **Laos** | Wider beneficiary | Tourist money enters Lao banks instead of moving as cash |

Social impact the team highlights: most street vendors are **women**; young people get jobs signing up shops. Later expansion: tuk-tuks, guesthouses, Laos–China railway stations, and Korean tourists (182,709 in 2025).

---

## 5. Partner and money route: PhaJay

- **Decided 15/10/2026:** PhaJay is the **one** partner route. The flow is tourist's app → PhaJay → vendor's Lao bank. Phalom does **not** connect directly to LAPNet or to any bank.
- PhaJay is a licensed Lao payment gateway that accepts Alipay, WeChat Pay and cross-border QR (phajay.co; docs: payment-doc.lailaolab.com).
- **Why Phalom, if PhaJay already exists?** PhaJay is a tool for developers (REST API, SDK, payment links). A street vendor can't use it alone. Phalom is the simple Lao app plus the team that signs up each shop in person.
- **Status:** PhaJay is a partner **we are talking to**. **No contract is signed** and **nothing is connected yet**. Always describe it that way.
- **If PhaJay says no:** the app isn't tied to PhaJay alone, so the team would approach another licensed gateway. Backup revenue: a small platform fee or paid premium features.
- **LAPNet** is the national infrastructure that lets foreign QR into Laos (e.g. UnionPay–LAPNet, 12/2024). It's background context. Phalom isn't connected to it.
- **Legal position:** the team never holds or touches funds. "We're an app for shops, not a bank."

---

## 6. Competition

**PhaJay is a partner. The real competitor is the cash habit.**

| | Cash | Bank | LOCA Pay | **Phalom** |
|---|:-:|:-:|:-:|:-:|
| Tourist doesn't need a new app | ✓ | ✓ | ✗ | **✓** |
| Goes out to street vendors | – | ✗ | ✗ | **✓** |
| Vendor can use it without coding | ✓ | ✓ | ✓ | **✓** |
| Easy checkout (menu + prices, voice alert) | ✗ | ✗ | ✗ | **✓** |
| Brings tourists to the shop | ✗ | ✗ | ✗ | **✓** |
| No fake cash or fake slips | ✗ | ✓ | ✓ | **✓** |

**Price example:** a 100,000 kip scarf through LOCA Pay costs the tourist **108,000 kip** (3% + 5,000 kip, and the tourist must install LOCA and link a card; loca.la/locapay, checked 10/2026). Through Phalom the tourist pays **100,000 kip**.

Why banks don't do this themselves: they have the rails, but small shops with small sales that each need in-person teaching aren't worth it to them. Phalom does that part, and the banks gain because the money lands in Lao bank accounts.

---

## 7. Business model

**The vendor pays nothing extra. Phalom earns a share of the fee PhaJay already charges.**

| Step | Amount |
|---|---|
| Tourist pays | 100,000 kip |
| PhaJay's fee (~1.5%) | ~1,500 kip |
| Phalom's share of that fee (30%) | ~450 kip |

**Per shop per month (team estimate):**

```
Sales per shop per month = 5 payments/day × 30 days × ~61,500 kip ≈ 9 million kip
Team income per shop     = 9,000,000 × 1.5% fee × 30% share   ≈ 40,500 kip / shop / month
```

- Lao payment-acceptance fees are generally 2.5–4%. The team uses 1.5% to stay conservative (payatlas.com).
- Later income ideas: premium features and paid placement on the shop map.

---

## 8. Market size (TAM · SAM · SOM)

| | Lao label | Size | How it's worked out |
|---|---|---|---|
| **TAM** | ຕະຫຼາດທັງໝົດ | **USD 1,422 million / year** | Official: foreign tourist spending in Laos, 2024 |
| **SAM** | ສ່ວນທີ່ເຂົ້າເຖິງໄດ້ | **≈ USD 44 million / year** | 1,422 × 80.5% (TH+CN+VN) × ~55% (3 tourist cities) × ~7% (small shops) *(estimate)* |
| **SOM** | ສ່ວນແບ່ງທີ່ເຮົາຈະໄດ້ | **≈ USD 1.3 million (year 1)** | 3% of SAM *(estimate)* |

The SOM is **money flowing through the system**, not Phalom's revenue. Phalom's revenue is the 40,500 kip per shop per month above. Market stats are the only figures given in USD. Everything else is in kip.

---

## 9. Roadmap (4 quarters)

| Quarter | Months | Where | What | Shops (end of quarter) |
|---|---|---|---|---|
| Q1 | 1–3 | Vientiane (pilot) | First app version, partner agreement, talk to vendors | **100** |
| Q2 | 4–6 | All of Vientiane | Add the shop map | **250** |
| Q3 | 7–9 | + Luang Prabang, Vang Vieng | Open 2 new tourist towns | **400** |
| Q4 | 10–12 | Luang Prabang + Vang Vieng | All 3 main tourist areas covered | **700** |
| Q5 (year 2) | | 3 areas | | 850 |

In the first month the team re-checks the fee, sales per shop and foreign customers per day before expanding. Growth comes from the team signing shops up in person, shops signing themselves up in the app, and vendors referring neighbours.

---

## 10. Budget and financials

**Starting capital: 40 million kip.** The team signs up shops itself on its own phones: no staff, no phones bought, and **no team salaries in year 1**.

### Where the 40 million goes

| Item | Million kip |
|---|---:|
| Reserve held until income covers costs (Q2–Q3) | 19.1 |
| QR stand packs for 100 shops (60,000 kip each) | 6.0 |
| Advertising to tourists (posters, hotels, online) | 4.0 |
| Servers and systems (Supabase, Cloudflare, domain, SMS) | 3.0 |
| Registration and contracts | 3.0 |
| Travel to visit shops | 3.0 |
| 10% contingency | 1.9 |
| **Total** | **40.0** |

First 3 months cost **20.9M**, and **19.1M** is kept aside.

### Profit and loss, year 1 (million kip)

| | Q1 | Q2 | Q3 | Q4 | **Year 1** | Q5 (yr 2) |
|---|---:|---:|---:|---:|---:|---:|
| Shops (end) | 100 | 250 | 400 | 700 | | 850 |
| Income | 6.1 | 21.3 | **39.5** | 66.8 | **133.7** | 94.2 |
| Costs | 20.9 | 23.1 | **36.3** | 44.0 | **124.3** | 34.1 |
| Profit / loss | −14.8 | −1.8 | +3.2 | +22.8 | **+9.3** | +60.1 |

- Income = average shops in the quarter × 3 months × 40,500 kip
- Costs = new-shop packs + running costs + 10% contingency
- **Income passes costs in Q3** (39.5 > 36.3). The margin is thin.
- **Deepest cash dip: 16.7M kip at the end of Q2**, covered by the 19.1M reserve.
- Year 1 ends at **+9.3M kip** profit.

### Sensitivity (from the judges' Q&A)

| What if… | Result |
|---|---|
| PhaJay shares 20% instead of 30% | 27,000 kip/shop/month. Break-even moves to Q4. Lowest cash point 35.8M, still inside the 40M |
| Only 3 payments a day instead of 5 | 24,300 kip/shop/month. Break-even slips to Q5 |

Price sources (checked 14/10/2026): Supabase Pro USD 25/month ≈ 0.56M kip; USD 1 ≈ 22,578 kip (31/07/2026); LOCA Pay 3% + 5,000 kip. **QR stand, advertising, registration and travel prices are estimates (originally Claude's) and should be checked with real quotes.** The full workings are in `pitch-redesign/Phalom_Budget.xlsx` (edit the yellow cells and everything recalculates).

---

## 11. KPIs (slide 15)

| KPI | Target | Formula |
|---|---|---|
| Shops | **700** by month 12 | Roadmap 100 → 250 → 400 → 700 |
| Shops still active after 3 months | **≥ 70%** (490 shops) | active shops ÷ shops opened × 100 |
| Foreign payments per shop per day | **≥ 5** | payments in month ÷ shops ÷ 30 |
| Sales per shop per month | **9 million kip** | 5 × 30 × ~61,500 ≈ 9.2M |
| Team income per shop per month | **~40,500 kip** | 9M × 1.5% × 30% |
| Income passes costs | **Q3** (months 7–9) | 39.5M > 36.3M |

These are targets and team estimates, to be re-checked with real shops in the months 1–3 pilot.

---

## 12. Impact after year 1 (700 shops)

| Who | Impact | Formula |
|---|---|---|
| Vendors | 700 shops can take tourist payments, stop losing customers, and build a sales record they can use for loans | |
| Tourists | **1.28 million payments a year** with their home app, no cash exchange | 700 × 5 × 365 |
| Laos | **~78,700 million kip** (ລ້ານກີບ) of tourist money into Lao banks instead of cash | 1.28M × ~61,500 kip |
| Retention | 490 shops still using it (70%) | |

---

## 13. Risks and SWOT

### Main risks

| Risk | Level | Answer |
|---|---|---|
| Partner won't cooperate | High | We bring PhaJay new shops at no field-sales cost to them, so both sides win. A fallback gateway is possible |
| Vendors won't change | High | No fee to the vendor, and we show them the extra sales |
| Copycats | Other | We stay close to vendors, sign up every shop in person, and hold sales data nobody else has |

### SWOT (Lao labels as on the slide)

| **ຈຸດແຂງ (Strengths)** | **ຈຸດອ່ອນ (Weaknesses)** |
|---|---|
| Uses rails that already exist | New team, no contract signed yet |
| Low cost, the team builds the app itself | Small income per shop |
| On the ground, knows real vendors | Depends on the partner |
| **ເຮັງ (Opportunities)** | **ຊວຍ (Threats)** |
| Tourists +11% in 2025 | Banks or big apps do it themselves |
| TH, CN, VN cross-border QR already open | Regulations change |
| Government target of 22M visitors 2026–2030 | Exchange-rate swings |

---

## 14. The prototype

Two real, working web apps share one backend. **Payments are simulated. No real money moves.** In production, payment confirmation would come from PhaJay through a signed webhook.

| App | Link | Notes |
|---|---|---|
| **Shop app** (the showpiece) | https://phalom.phalom-payment.workers.dev | "ລອງໃຊ້ຮ້ານຕົວຢ່າງ" opens a demo shop |
| **Tourist demo app** (ແອັບຈຳລອງເປັນນັກທ່ອງທ່ຽວ) | https://phalom-tourist.phalom-payment.workers.dev | Opens from a payment QR. Lao by default; English, Chinese, Thai, Vietnamese, Korean |
| **Android app** | `pitch/Phalom.apk` | Wraps the live shop app, reads payments aloud, includes an offline demo |

**Shop app features:** today's sales and a 7-day chart; charge by keypad (ພິມຈຳນວນເງິນ) or by tapping products (ເລືອກສິນຄ້າ); one QR per amount on a white background; chime and Lao voice when money arrives; sales history; product list with auto-translated names; printable QR tent card; bank account and settings; shop sign-up; shop map pin and opening hours. It also has a desktop layout.

**Tourist app features:** price shown in kip only; pick a wallet and pay (demo); receipt; a map with "Picked for you" shop recommendations (distance, popularity with the tourist's nationality, open now, rating, a boost for small shops) and walking directions.

**Map niche:** "Google Maps knows where shops are. Phalom knows what tourists actually buy there."

**Tech:** a Cloudflare Worker (API, static apps, Workers AI for translation) plus Supabase Postgres (Singapore). Row-level security is on and only the Worker can reach the database. The app is in Lao first and light theme by default.

**Data and security:** Phalom doesn't store card numbers or passwords. It stores only the shop's sales, so vendors can see them and tourists get recommendations.

**Live demo flow (slide 8):** open the shop app → tap products (85,000 kip) → QR appears → a teammate scans with the tourist app and pays → "ໄດ້ຮັບເງິນ 85,000 ກີບ" → receipt. Judges can scan the two QRs on the slide. Backup if the network is slow: walk through the 5 phone screenshots on the slide.

---

## 15. What we're asking for (slide 16)

1. **An introduction to PhaJay**
2. **40 million kip** in starting capital, enough to reach the day income pays for itself
3. **Cooperation from the Ministry of Culture and Tourism** (ການຮ່ວມມືຈາກກະຊວງວັດທະນະທຳ ແລະ ການທ່ອງທ່ຽວ)

---

## 16. Team

| Name | Field | School | Pitch part (5-min script) |
|---|---|---|---|
| ທ້າວ ແສງຕາວັນ ຫຼວງພິບູນ | Software engineering | Westbridge Institute | Slides 1–4: opening, problem, cause, market |
| ທ້າວ ເພັດມີໄຊ ພົມມະເກສອນ | Artificial intelligence | Faculty of Natural Sciences, National University of Laos | Slides 5–7: solution, how it works, competitors |
| ທ້າວ ເຈດສະດາ ພົມມະໂວຫານ | Software engineering | Westbridge Institute | Slides 8–9: live demo |
| ທ້າວ ສີສົມພອນ ລັດສະຄຸນໄຊ | Dentistry | Faculty of Medicine, University of Health Sciences | Slides 10–16: money, plan, budget, impact, close |

Contact: phalom.payment@gmail.com · +856 20 5628 0572

The speaker order is a default and the team can swap it.

---

## 17. Rules for talking about Phalom

1. **Kip only.** No yuan, baht or dong prices or conversions anywhere. USD appears only in market-size stats (TAM/SAM/SOM).
2. **Never say PhaJay or LAPNet is connected, or that a contract is signed.** Say "the partner we're talking to".
3. **Never say real money is flowing.** The app is a test version (ລອງເວີຊັນ) with simulated payments.
4. **Don't claim "Alipay needs a separate QR."** It isn't true.
5. **Phalom never holds funds.** Money goes from the tourist's app through PhaJay to the vendor's bank.
6. **Plain Lao for audiences:** ສະພານ (not ຂົວ), ໄຕມາດ in full (not ໄຕ). Don't use "ຊ່ວຍຂາຍ", "ແປເມນູ" or "ລາຄາເປັນກີບ" as selling points on slides.
7. **Short answers to judges:** answer first, number second, 20–30 seconds. If you don't know: "ຄຳຖາມດີ, ເຮົາຈະກວດ ແລ້ວແຈ້ງກັບ" (good question, we'll check and get back to you).

---

## 18. Open items and known inconsistencies

- **Field research:** judges' Q9 ("have you talked to vendors?") still needs the team's real facts: how many shops and where.
- **Where Q1 starts:** the roadmap and budget say the pilot is in **Vientiane**, with Luang Prabang and Vang Vieng added in Q3. Judges' Q&A answer 17 says "start in Luang Prabang, then Vang Vieng". Pick one before the pitch.
- **Share per payment:** slide 10 shows "~400 kip (~0.4%)" and "36–40 thousand kip per shop". The KPI slide, budget and script use 30% of 1.5% = **~450 kip** and **40,500 kip**. They're close, but they don't match exactly.
- **SOM vs impact:** SOM is USD 1.3M (3% of SAM). The impact figure of 78,700 million kip is roughly USD 3.5M at 22,578 kip/USD. They measure different things (a share of the reachable market vs. total flow through 700 shops), but a judge may ask why they differ.
- **Estimates to verify:** 5 payments/day, 61,500 kip per payment, the 1.5% fee, the 30% share, the 55% and 7% SAM factors, and the QR stand, ad, registration and travel prices are all team or Claude estimates.

---

## 19. Where the files are (project shared folder)

| What | Path |
|---|---|
| Live 3D pitch deck (17 slides) | https://claude.ai/artifact/9FcYNogPjmiaNcg6WMarBs |
| 5-minute, 4-speaker script (editable) | `pitch-redesign/Phalom_Script_5min_4people.html` |
| Judges' Q&A (20 questions) | `pitch-redesign/Phalom_Judge_QA.html` |
| Short Q&A page | `pitch-redesign/Phalom_QA.html` |
| Budget workbook | `pitch-redesign/Phalom_Budget.xlsx` |
| PDF / PPTX / offline deck backups (15/10 version) | `pitch-redesign/Phalom_Pitch_3D.*`, `Phalom_Pitch_Editable.pptx` |
| App source and deploy guide | `pitch/phalom-app/` (README.md) |
| Android app | `pitch/Phalom.apk` |
| Lao app screenshots | `pitch/screens-lao/` |
| Map ideas | `pitch/map-brainstorm.md` |
| Competition template and rubric | `IBC.pdf`; scoring is problem 20, creativity 25, feasibility 25, impact 15, presentation 15 |
