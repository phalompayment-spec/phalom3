const pptxgen = require("pptxgenjs");
const { applyTheme } = require((process.env.PPTX_SKILL || "/root/.claude/skills/synced/39ee1e53-5e8c-463f-a246-c5d427f0edc6_e112cbca-0806-473d-9f43-f754365941b5/pptx") + "/scripts/apply_theme.js");

const SH = __dirname + "/shots/";
const OUT = process.argv[2] || __dirname + "/Phalom_Pitch.pptx";
const DEMO = process.env.DEMO_URL || "https://phalom.phalom-payment.workers.dev";
const TOURIST = process.env.TOURIST_URL || "https://phalom-tourist.phalom-payment.workers.dev";

const THEME = {
  name: "Phalom Khram",
  headFontFace: "Noto Sans Lao",
  bodyFontFace: "Noto Sans Lao",
  colors: {
    dk1: "151A33", lt1: "FFFFFF", dk2: "1F2B6B", lt2: "EEF0F6",
    accent1: "1F2B6B", accent2: "D99A1E", accent3: "B5372F", accent4: "1E7A5A",
    accent5: "2E4DB8", accent6: "7A4FB5", hlink: "2E4DB8", folHlink: "7A4FB5",
  },
};
const K = { khram: "1F2B6B", khramSoft: "E8EBF7", silk: "D99A1E", silkSoft: "FBF1DC", madder: "B5372F", madderSoft: "F8E4E2", leaf: "1E7A5A", leafSoft: "E2F2EA", ink: "151A33", ink2: "4A5070", ink3: "7C819C", line: "E2E4EE", ground: "EEF0F6", white: "FFFFFF", cn: "C4433A", th: "2E4DB8", vn: "1F8A6B", kr: "7A4FB5" };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Phalom - Cross-Border Payment for Small Vendors";
pres.author = "Team Phalom";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

const W = 13.333, M = 0.6;

pres.defineSlideMaster({
  title: "COVER",
  background: { color: K.khram },
  objects: [],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: K.white },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.38, w: W - 2 * M, h: 0.85, fontSize: 28, bold: true, color: K.khram, valign: "middle", align: "left", margin: 0 }, text: "" } },
    { text: { text: "ທີມ Phalom · ໂຈດທີ 10 ຮັບເງິນຕ່າງປະເທດ", options: { x: M, y: 7.02, w: 6, h: 0.3, fontSize: 10, color: K.ink3, margin: 0 } } },
  ],
  slideNumber: { x: W - M - 0.6, y: 7.02, w: 0.6, h: 0.3, fontSize: 10, color: K.ink3, align: "right" },
});

let sec = null;
function slide(master, section, title, notes) {
  if (section !== sec) { pres.addSection({ title: section }); sec = section; }
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  if (title) s.addText(title, { placeholder: "title" });
  if (notes) s.addNotes(notes);
  return s;
}
const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontSize: 15, color: K.ink, valign: "top" }, o));
const box = (s, o) => s.addShape(o.r ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, Object.assign({ line: { color: (o.fill && o.fill.color) || K.white, width: 0 } }, o, o.r ? { rectRadius: o.r } : {}));
function diamond(s, x, y, size, fill, label, fc) {
  s.addShape(pres.shapes.DIAMOND, { x, y, w: size, h: size, fill: { color: fill }, line: { color: fill, width: 0 } });
  if (label) T(s, label, { x, y, w: size, h: size, align: "center", valign: "middle", fontSize: size * 22, bold: true, color: fc || K.white });
}
const src = (s, text, y) => T(s, text, { x: M, y: y || 6.62, w: W - 2 * M, h: 0.34, fontSize: 10, color: K.ink3, italic: true });
const phone = (s, file, x, y, h) => {
  const w = h * 780 / 1688;
  s.addImage({ path: SH + file, x, y, w, h, rounding: false });
  return w;
};

// ---------- 1. COVER ----------
{
  const s = slide("COVER", "ເປີດ", null,
`[0:15] ໜ້າປົກ
"ສະບາຍດີ ຄະນະກຳມະການ ແລະ ທຸກທ່ານ. ພວກເຮົາແມ່ນທີມ Phalom ຈາກ [ມະຫາວິທະຍາໄລ/ຄະນະ]. ມື້ນີ້ພວກເຮົາຈະນຳສະເໜີແນວທາງຊ່ວຍແມ່ຄ້ານ້ອຍ ຮັບເງິນຈາກນັກທ່ອງທ່ຽວຕ່າງປະເທດ — ພາຍໃຕ້ແນວຄິດ: ນັກທ່ອງທ່ຽວຈ່າຍແບບບ້ານເຂົາ — ແມ່ຄ້າຮັບເງິນກີບແບບບ້ານເຮົາ."
(ຢຸດສັ້ນໆ ຫຼັງຄຳຂວັນ)`);
  // weave motif
  [[9.2, 0.9, 3.6, "2A3880"], [9.9, 1.6, 2.2, "33438F"], [10.45, 2.15, 1.1, K.silk]].forEach(([x, y, d, c]) =>
    s.addShape(pres.shapes.DIAMOND, { x, y, w: d, h: d, fill: { color: c }, line: { color: c, width: 0 } }));
  T(s, "ໂຈດທີ 10 · ຮັບເງິນຕ່າງປະເທດຍຸ້ງຍາກ (Cross-Border Payment ສຳລັບຮ້ານຄ້າ)", { x: M + 0.1, y: 0.8, w: 8.4, h: 0.4, fontSize: 14, color: "C9D0F0" });
  T(s, "Phalom", { x: M + 0.1, y: 1.45, w: 8, h: 1.3, fontSize: 72, bold: true, color: K.white, valign: "middle" });
  T(s, "ແອັບຊ່ວຍແມ່ຄ້ານ້ອຍ ຮັບເງິນຈາກນັກທ່ອງທ່ຽວຕ່າງປະເທດ ເປັນເງິນກີບ", { x: M + 0.1, y: 2.85, w: 8.2, h: 0.5, fontSize: 20, color: "DDE2F7" });
  box(s, { x: M + 0.1, y: 3.75, w: 8.2, h: 1.25, fill: { color: "2A3880" }, r: 0.12 });
  T(s, [
    { text: "ນັກທ່ອງທ່ຽວຈ່າຍແບບບ້ານເຂົາ", options: { breakLine: true } },
    { text: "ແມ່ຄ້າຮັບເງິນກີບແບບບ້ານເຮົາ", options: { color: "F0C060" } },
  ], { x: M + 0.4, y: 3.83, w: 7.7, h: 1.1, fontSize: 24, bold: true, color: K.white, valign: "middle", lineSpacingMultiple: 1.05 });
  T(s, "ທີມ Phalom (ພັດລົມ) · [ມະຫາວິທະຍາໄລ / ຄະນະ / ສາຂາວິຊາ]\n[ຊື່ ແລະ ນາມສະກຸນ ສະມາຊິກ 1] · [ສະມາຊິກ 2] · [ສະມາຊິກ 3]", { x: M + 0.1, y: 5.55, w: 8.4, h: 0.8, fontSize: 14, color: "C9D0F0" });
  phone(s, "3-qr.png", 10.05, 3.55, 3.5);
}

// ---------- 2. PROBLEM ----------
{
  const s = slide("CONTENT", "ບັນຫາ", "ນັກທ່ອງທ່ຽວຢາກຊື້ ແຕ່ຈ່າຍບໍ່ໄດ້ ແມ່ຄ້າຈຶ່ງເສຍຍອດຂາຍ",
`[0:45] ບັນຫາ
"ລອງນຶກພາບນັກທ່ອງທ່ຽວຈີນຄົນໜຶ່ງ ຍ່າງຢູ່ຕະຫຼາດມືດ. ລາວເຫັນຜ້າທໍທີ່ມັກ ຢາກຊື້. ແຕ່ລາວບໍ່ມີເງິນກີບ — ລາວມີແຕ່ Alipay ໃນມືຖື. ແມ່ຄ້າຮັບບໍ່ໄດ້. ລາວຈຶ່ງຍ່າງໜີ.
ເລື່ອງນີ້ເກີດຂຶ້ນທຸກມື້. ປີ 2025 ລາວມີນັກທ່ອງທ່ຽວຕ່າງປະເທດ 4.58 ລ້ານຄົນ — ແລະ 82% ມາຈາກ ໄທ, ຈີນ ແລະ ຫວຽດນາມ — ປະເທດທີ່ຄົນຈ່າຍເງິນດ້ວຍ QR ເປັນປົກກະຕິ.
ແຕ່ຮ້ານຂອງທີ່ລະນຶກ ແລະ ອາຫານທາງ ສ່ວນຫຼາຍຮັບໄດ້ແຕ່ເງິນສົດ ຫຼື QR ບັນຊີສ່ວນຕົວ. ຜົນຄື: ລູກຄ້າຢາກຊື້ — ແຕ່ຈ່າຍບໍ່ໄດ້ — ແມ່ຄ້າເສຍຍອດຂາຍ."

ຂໍ້ມູນທີ່ກວດແລ້ວ: 4,580,709 ຄົນ (2025, +11%). ໄທ 1,484,319 + ຈີນ 1,157,278 + ຫວຽດນາມ 1,129,109 = 3,770,706 = 82.3%. ແຫຼ່ງ: KPL ອ້າງອີງກະຊວງຖະແຫຼງຂ່າວ ວັດທະນະທຳ ແລະ ທ່ອງທ່ຽວ (01/2026).`);
  // story
  box(s, { x: M, y: 1.45, w: 5.3, h: 4.95, fill: { color: K.ground }, r: 0.15 });
  T(s, "ເລື່ອງທີ່ເກີດທຸກຄືນ ທີ່ຕະຫຼາດມືດ", { x: M + 0.35, y: 1.7, w: 4.6, h: 0.4, fontSize: 16, bold: true, color: K.khram });
  const story = [["1", "ນັກທ່ອງທ່ຽວຈີນເຫັນຜ້າທໍທີ່ມັກ ຢາກຊື້", K.khram], ["2", "ບໍ່ມີເງິນກີບ ມີແຕ່ Alipay ໃນມືຖື", K.khram], ["3", "ແມ່ຄ້າຮັບໄດ້ແຕ່ເງິນສົດ ຫຼື QR ບັນຊີສ່ວນຕົວ", K.khram], ["4", "ລູກຄ້າຍ່າງໜີ ແມ່ຄ້າເສຍຍອດຂາຍ", K.madder]];
  story.forEach(([n, t, c], i) => {
    const y = 2.35 + i * 0.95;
    diamond(s, M + 0.35, y, 0.55, c, n);
    T(s, t, { x: M + 1.15, y: y - 0.02, w: 3.95, h: 0.6, fontSize: 15, valign: "middle", color: i === 3 ? K.madder : K.ink, bold: i === 3 });
  });
  // stats
  T(s, "4.58 ລ້ານ", { x: 6.3, y: 1.45, w: 3.3, h: 0.8, fontSize: 40, bold: true, color: K.khram });
  T(s, "ນັກທ່ອງທ່ຽວຕ່າງປະເທດ ປີ 2025 (+11%)", { x: 6.3, y: 2.25, w: 3.3, h: 0.5, fontSize: 13, color: K.ink2 });
  T(s, "82%", { x: 9.75, y: 1.45, w: 3, h: 0.8, fontSize: 40, bold: true, color: K.silk });
  T(s, "ມາຈາກ ໄທ, ຈີນ, ຫວຽດນາມ ທີ່ຈ່າຍດ້ວຍ QR ເປັນປົກກະຕິ", { x: 9.75, y: 2.25, w: 3, h: 0.7, fontSize: 13, color: K.ink2 });
  s.addChart(pres.charts.BAR, [{ name: "2025", labels: ["ໄທ", "ຈີນ", "ຫວຽດນາມ", "ເກົາຫຼີ", "ອື່ນໆ"], values: [1.484, 1.157, 1.129, 0.183, 0.627] }], {
    x: 6.2, y: 3.05, w: 6.55, h: 3.45, barDir: "bar", catAxisOrientation: "maxMin",
    chartColors: [K.th, K.cn, K.vn, K.ink3, K.ink3], invertedColors: [K.th],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 12, dataLabelColor: K.ink, dataLabelFontFace: "+mn-lt",
    catAxisLabelColor: K.ink2, catAxisLabelFontSize: 13, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: false, showTitle: true, title: "ນັກທ່ອງທ່ຽວມາລາວ ປີ 2025 (ລ້ານຄົນ)", titleFontSize: 13, titleColor: K.ink2, titleFontFace: "+mn-lt", barGapWidthPct: 45,
  });
  src(s, "ແຫຼ່ງ: ກະຊວງຖະແຫຼງຂ່າວ ວັດທະນະທຳ ແລະ ທ່ອງທ່ຽວ ຜ່ານ KPL (kpl.gov.la, ມັງກອນ 2026): ລວມ 4,580,709 ຄົນ; ໄທ 1,484,319 · ຈີນ 1,157,278 · ຫວຽດນາມ 1,129,109 · ເກົາຫຼີ 182,709");
}

// ---------- 3. ROOT CAUSE ----------
{
  const s = slide("CONTENT", "ບັນຫາ", "ເສັ້ນທາງເງິນມີແລ້ວ ແຕ່ຂາດ 'ໄມລ໌ສຸດທ້າຍ' ໄປຫາແມ່ຄ້ານ້ອຍ",
`[0:45] ສາເຫດ (Why-Why)
"ເປັນຫຍັງຈຶ່ງເກີດ? ພວກເຮົາຖາມ 'ເປັນຫຍັງ' ຊ້ຳໆ:
ແມ່ຄ້າເສຍຍອດຂາຍ — ເພາະນັກທ່ອງທ່ຽວຈ່າຍດ້ວຍແອັບຂອງຕົນບໍ່ໄດ້.
ເປັນຫຍັງ? ເພາະ QR ຂອງແມ່ຄ້າເປັນບັນຊີສ່ວນຕົວ ທີ່ບໍ່ໄດ້ສະໝັກຮັບເງິນຕ່າງປະເທດ.
ເປັນຫຍັງບໍ່ສະໝັກ? ເພາະຊ່ອງທາງແຍກກັນ ແລະ ຂໍ້ມູນຫາຍາກ. ພວກເຮົາລອງສອບຖາມທະນາຄານ 4 ແຫ່ງທາງອອນລາຍ — 2 ແຫ່ງບໍ່ຕອບ, 2 ແຫ່ງໃຫ້ໄປຖາມທີ່ສາຂາ. ຖ້າພວກເຮົາຍັງຫາຍາກ — ແມ່ຄ້າທີ່ຂາຍທັງວັນ ກໍ່ຍິ່ງຍາກກວ່າ.
ແລະ ເປັນຫຍັງບໍ່ມີໃຜຊ່ວຍ? ເພາະການລົງໄປສອນແມ່ຄ້າທີລະຄົນບໍ່ຄຸ້ມທຶນສຳລັບທະນາຄານ.
ສະນັ້ນ ຕົ້ນເຫດແທ້ບໍ່ແມ່ນເທັກໂນໂລຊີ — ເສັ້ນທາງເງິນມີແລ້ວ ແຕ່ຂາດ 'ໄມລ໌ສຸດທ້າຍ' ທີ່ພາແມ່ຄ້ານ້ອຍໄປເຖິງ."
(ປະໂຫຍກສຸດທ້າຍ ເວົ້າຊ້າ ແລະ ໜັກແໜ້ນ)

ຫຼັກຖານວ່າ "ເສັ້ນທາງມີແລ້ວ" (ກ່ອງຂວາ): ໄທ→ລາວ ເປີດ 07/2024 (Krungsri, ທະນາຄານລາວ 17 ແຫ່ງ); ຈີນ: UnionPay–LAPNet ເຊັນ 19/12/2024 (8 ທະນາຄານ); ຫວຽດນາມ→ລາວ ເປີດ 9/1/2025 (ທະນາຄານລາວ 14 ແຫ່ງ); Alipay/WeChat Pay ຜ່ານ BCEL–Wallyt ຕັ້ງແຕ່ 2019 ແລະ ຜ່ານ PhaJay.`);
  const whys = [
    ["ແມ່ຄ້າເສຍຍອດຂາຍ", "ເພາະນັກທ່ອງທ່ຽວຈ່າຍດ້ວຍແອັບຂອງຕົນບໍ່ໄດ້"],
    ["ເປັນຫຍັງ?", "QR ຂອງແມ່ຄ້າເປັນບັນຊີສ່ວນຕົວ ບໍ່ໄດ້ສະໝັກຮັບເງິນຕ່າງປະເທດ"],
    ["ເປັນຫຍັງບໍ່ສະໝັກ?", "ຊ່ອງທາງແຍກກັນ ຂໍ້ມູນຫາຍາກ: ຖາມທະນາຄານ 4 ແຫ່ງ, 2 ບໍ່ຕອບ, 2 ໃຫ້ໄປສາຂາ"],
    ["ເປັນຫຍັງບໍ່ມີໃຜຊ່ວຍ?", "ລົງສອນແມ່ຄ້າທີລະຄົນ ບໍ່ຄຸ້ມທຶນສຳລັບທະນາຄານ"],
  ];
  whys.forEach(([q, a], i) => {
    const y = 1.45 + i * 0.95, x = M + i * 0.25;
    box(s, { x, y, w: 7.3 - i * 0.25, h: 0.78, fill: { color: K.ground }, r: 0.1 });
    T(s, q, { x: x + 0.2, y, w: 2.1, h: 0.78, fontSize: 14, bold: true, color: K.khram, valign: "middle" });
    T(s, a, { x: x + 2.35, y, w: 4.75 - i * 0.25, h: 0.78, fontSize: 14, valign: "middle" });
  });
  box(s, { x: M + 1.0, y: 5.3, w: 6.3, h: 1.05, fill: { color: K.madder }, r: 0.1 });
  T(s, [{ text: "ຕົ້ນເຫດແທ້: ", options: { bold: true } }, { text: "ບໍ່ແມ່ນເທັກໂນໂລຊີ. ເສັ້ນທາງເງິນມີແລ້ວ ແຕ່ຂາດຄົນພາແມ່ຄ້ານ້ອຍໄປເຖິງ" }], { x: M + 1.25, y: 5.3, w: 5.9, h: 1.05, fontSize: 16, color: K.white, valign: "middle" });
  // rails exist
  box(s, { x: 8.35, y: 1.45, w: 4.38, h: 4.9, fill: { color: K.khramSoft }, r: 0.15 });
  T(s, "ເສັ້ນທາງ QR ຂ້າມແດນ ທີ່ເປີດແລ້ວ", { x: 8.6, y: 1.62, w: 4, h: 0.4, fontSize: 15, bold: true, color: K.khram });
  const rails = [
    ["ໄທ", K.th, "07/2024", "ສະແກນ LAO QR ດ້ວຍແອັບ Krungsri"],
    ["ຈີນ", K.cn, "12/2024", "UnionPay ເຊື່ອມ LAPNet (8 ທະນາຄານ)"],
    ["ຫວຽດ", K.vn, "01/2025", "ສະແກນ QR ໃນລາວ (14 ທະນາຄານລາວ)"],
    ["ຈີນ", K.cn, "2019+", "Alipay, WeChat Pay ຜ່ານ BCEL ແລະ PhaJay"],
  ];
  rails.forEach(([c, col, d, t], i) => {
    const y = 2.2 + i * 1.0;
    box(s, { x: 8.6, y, w: 0.8, h: 0.36, fill: { color: col }, r: 0.08 });
    T(s, c, { x: 8.6, y, w: 0.8, h: 0.36, fontSize: 12, bold: true, color: K.white, align: "center", valign: "middle" });
    T(s, d, { x: 9.55, y, w: 1.2, h: 0.36, fontSize: 12, bold: true, color: K.ink2, valign: "middle" });
    T(s, t, { x: 8.6, y: y + 0.4, w: 3.95, h: 0.5, fontSize: 13 });
  });
  src(s, "ແຫຼ່ງ: Bank of Thailand (03/04/2024); Tourism Laos (17/07/2024); UnionPay–LAPNet, Tourism Laos (17/01/2025); Greater Mekong / KPL (09/01/2025); BCEL–Wallyt, The Asian Banker (2019); phajay.co. ສອບຖາມທະນາຄານ: ທີມສຳຫຼວດເອງ");
}

// ---------- 4. MARKET ----------
{
  const s = slide("CONTENT", "ຕະຫຼາດ", "ຕະຫຼາດທີ່ເຂົ້າເຖິງໄດ້ ປະມານ 44 ລ້ານໂດລາຕໍ່ປີ ແລະ ກຳລັງເຕີບໂຕ",
`[0:40] ຂະໜາດຕະຫຼາດ
"ຕະຫຼາດນີ້ໃຫຍ່ປານໃດ? ຕາມລາຍງານທາງການຂອງກົມພັດທະນາການທ່ອງທ່ຽວ, ປີ 2024 ນັກທ່ອງທ່ຽວຕ່າງປະເທດໃຊ້ຈ່າຍໃນລາວ ປະມານ 1,422 ລ້ານໂດລາ.
ພວກເຮົາເລືອກສະເພາະນັກທ່ອງທ່ຽວ ໄທ, ຈີນ, ຫວຽດ ໃນ 3 ເຂດທ່ອງທ່ຽວ ແລະ ເງິນທີ່ໃຊ້ຢູ່ຮ້ານນ້ອຍ — ໄດ້ຕະຫຼາດທີ່ເຂົ້າເຖິງໄດ້ ປະມານ 44 ລ້ານໂດລາຕໍ່ປີ.
ປີທຳອິດ ດ້ວຍ 700 ຮ້ານ ເງິນທີ່ແລ່ນຜ່ານລະບົບຂອງເຮົາຈະຢູ່ທີ່ ປະມານ 3.5 ລ້ານໂດລາ — ພຽງ 8% ຂອງຕະຫຼາດ. ແລະ ຕະຫຼາດກຳລັງເຕີບໂຕ: ປີ 2025 ນັກທ່ອງທ່ຽວເພີ່ມ 11%."

ວິທີຄິດ (ຖ້າຖືກຖາມ):
TAM: 1,421,992,819 USD = ລາຍຮັບຈາກນັກທ່ອງທ່ຽວທັງໝົດ 2024 (Statistical Report on Tourism 2024, ຕາຕະລາງ 7, tdd.gov.la).
SAM ≈ 1,422 × 80.5% (ສ່ວນແບ່ງ ໄທ+ຈີນ+ຫວຽດ ປີ 2024: 3,317,791 / 4,120,832) × ~55% (ໃຊ້ຈ່າຍໃນ ວຽງຈັນ, ຫຼວງພະບາງ, ວັງວຽງ: ສົມມຸດຕິຖານ) × ~7% (ຂອງທີ່ລະນຶກ ແລະ ອາຫານທາງ: ສົມມຸດຕິຖານ) ≈ 44 ລ້ານ USD.
SOM: 700 ຮ້ານ × 5 ທຸລະກຳ/ມື້ × 365 ມື້ × ~61,500 ກີບ (~2.7 USD) ≈ 3.5 ລ້ານ USD (ອັດຕາ 1 USD ≈ 22,458 ກີບ, 10/2026). = 8% ຂອງ SAM. ນີ້ແມ່ນຍອດເງິນຜ່ານລະບົບ ບໍ່ແມ່ນລາຍໄດ້ທີມ.`);
  const tiers = [
    ["1,422", "ລ້ານ USD", "TAM · ນັກທ່ອງທ່ຽວຕ່າງປະເທດໃຊ້ຈ່າຍໃນລາວ ປີ 2024", "ຕົວເລກທາງການ", K.khram, 7.2],
    ["44", "ລ້ານ USD/ປີ", "SAM · ໄທ ຈີນ ຫວຽດ, 3 ເຂດທ່ອງທ່ຽວ, ຮ້ານນ້ອຍ", "ການຄາດຄະເນຂອງທີມ", "2E4DB8", 5.4],
    ["3.5", "ລ້ານ USD", "SOM · ເງິນຜ່ານລະບົບ ປີທຳອິດ (700 ຮ້ານ) = 8% ຂອງ SAM", "ການຄາດຄະເນຂອງທີມ", K.silk, 3.6],
  ];
  tiers.forEach(([n, u, t, tag, c, w], i) => {
    const y = 1.5 + i * 1.62;
    box(s, { x: M, y, w, h: 1.38, fill: { color: c }, r: 0.12 });
    T(s, [{ text: n, options: { fontSize: 36, bold: true } }, { text: "  " + u, options: { fontSize: 14 } }], { x: M + 0.3, y: y + 0.1, w: w - 0.4, h: 0.7, color: K.white, valign: "middle" });
    T(s, t, { x: M + 0.3, y: y + 0.78, w: w - 0.4, h: 0.5, fontSize: 13, color: K.white });
    T(s, tag, { x: M + w + 0.2, y: y + 0.5, w: 2, h: 0.4, fontSize: 12, italic: true, color: K.ink3, valign: "middle" });
  });
  // growth + method
  box(s, { x: 9.15, y: 1.5, w: 3.58, h: 2.15, fill: { color: K.leafSoft }, r: 0.12 });
  T(s, "+11%", { x: 9.4, y: 1.65, w: 3.1, h: 0.8, fontSize: 40, bold: true, color: K.leaf });
  T(s, "ນັກທ່ອງທ່ຽວເພີ່ມຂຶ້ນ ປີ 2025 (4.12 ລ້ານ → 4.58 ລ້ານ ຄົນ)", { x: 9.4, y: 2.45, w: 3.1, h: 1.0, fontSize: 13, color: K.ink2 });
  box(s, { x: 9.15, y: 3.85, w: 3.58, h: 2.5, fill: { color: K.ground }, r: 0.12 });
  T(s, "ວິທີຄິດ SAM", { x: 9.4, y: 3.98, w: 3.1, h: 0.35, fontSize: 13, bold: true, color: K.khram });
  T(s, "1,422 × 80.5% (ໄທ ຈີນ ຫວຽດ)\n× ~55% (3 ເຂດທ່ອງທ່ຽວ)\n× ~7% (ຮ້ານນ້ອຍ)\n≈ 44 ລ້ານ USD", { x: 9.4, y: 4.35, w: 3.1, h: 1.9, fontSize: 13, color: K.ink, lineSpacingMultiple: 1.1 });
  src(s, "ແຫຼ່ງ: ກົມພັດທະນາການທ່ອງທ່ຽວ, Statistical Report on Tourism 2024, ຕາຕະລາງ 7 ແລະ 10 (tdd.gov.la); KPL (01/2026). 55% ແລະ 7% ເປັນສົມມຸດຕິຖານຂອງທີມ ຈະຢືນຢັນໃນການນຳຮ່ອງ");
}

// ---------- 5. SOLUTION ----------
{
  const s = slide("CONTENT", "ວິທີແກ້", "ແອັບສຳລັບແມ່ຄ້າ ທີ່ເຊື່ອມກັບເສັ້ນທາງເງິນທີ່ມີຢູ່ແລ້ວ",
`[0:45] ວິທີແກ້
"Solution ຂອງພວກເຮົາແມ່ນແອັບສຳລັບແມ່ຄ້າ ທີ່ເຊື່ອມກັບເສັ້ນທາງເງິນທີ່ມີຢູ່ແລ້ວ — ທະນາຄານທີ່ເປັນສະມາຊິກ LAPNet ແລະ payment gateway ເຊັ່ນ PhaJay. ພວກເຮົາບໍ່ສ້າງລະບົບເງິນໃໝ່ ແລະ ບໍ່ແຕະເງິນຂອງແມ່ຄ້າ.
ພວກເຮົາໃຫ້ຄຸນຄ່າ 3 ຊັ້ນ:
ໜຶ່ງ — ພາເຂົ້າລະບົບ: ລົງທະບຽນຜ່ານມືຖື, ໄດ້ປ້າຍດຽວ ຮັບໄດ້ທຸກແອັບ.
ສອງ — ຊ່ວຍຂາຍ: ສຽງແຈ້ງເງິນເຂົ້າເປັນພາສາລາວ, ສະແດງລາຄາເປັນກີບ ພ້ອມຄຳອະທິບາຍເປັນພາສາຂອງລູກຄ້າ, ແປເມນູອັດຕະໂນມັດ.
ສາມ — ພາລູກຄ້າມາ: ແຜນທີ່ຮ້ານສຳລັບນັກທ່ອງທ່ຽວ ຜ່ານໂຮງແຮມ ແລະ ທົວ.
ນັກທ່ອງທ່ຽວບໍ່ຕ້ອງໂຫຼດແອັບໃໝ່ — ແມ່ຄ້າໄດ້ເງິນກີບ."`);
  const cards = [
    ["1", "ພາເຂົ້າລະບົບ", ["ລົງທະບຽນຜ່ານມືຖື ມີຕົວແທນຊ່ວຍ", "ໄດ້ປ້າຍ QR ດຽວ ຮັບໄດ້ທຸກແອັບ", "ເງິນເຂົ້າບັນຊີທະນາຄານຂອງແມ່ຄ້າ"], K.khram],
    ["2", "ຊ່ວຍຂາຍ", ["ສຽງແຈ້ງເງິນເຂົ້າ ເປັນພາສາລາວ", "ລາຄາເປັນກີບ ອະທິບາຍເປັນພາສາລູກຄ້າ", "ແປເມນູ ແລະ ສິນຄ້າອັດຕະໂນມັດ"], K.silk],
    ["3", "ພາລູກຄ້າມາ", ["ແຜນທີ່ຮ້ານ ຫຼາຍພາສາ", "ແຈກຜ່ານໂຮງແຮມ ແລະ ທົວ", "ນັກທ່ອງທ່ຽວເປີດໄດ້ ບໍ່ຕ້ອງໂຫຼດແອັບ"], K.leaf],
  ];
  cards.forEach(([n, h, items, c], i) => {
    const x = M + i * 3.12, y = 1.5, w = 2.95;
    box(s, { x, y, w, h: 3.85, fill: { color: K.ground }, r: 0.14 });
    diamond(s, x + 0.25, y + 0.25, 0.62, c, n);
    T(s, h, { x: x + 0.25, y: y + 1.0, w: w - 0.4, h: 0.45, fontSize: 18, bold: true, color: K.khram });
    T(s, items.map((t, j) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < items.length - 1 } })), { x: x + 0.25, y: y + 1.55, w: w - 0.4, h: 2.2, fontSize: 14, paraSpaceAfter: 8 });
  });
  phone(s, "1-home.png", 10.3, 1.45, 4.95);
  box(s, { x: M, y: 5.6, w: 8.8, h: 0.85, fill: { color: K.khram }, r: 0.12 });
  T(s, "ນັກທ່ອງທ່ຽວບໍ່ຕ້ອງໂຫຼດແອັບໃໝ່  ·  ແມ່ຄ້າໄດ້ເງິນກີບ  ·  ທີມບໍ່ແຕະເງິນຂອງແມ່ຄ້າ", { x: M + 0.3, y: 5.6, w: 8.3, h: 0.85, fontSize: 16, bold: true, color: K.white, valign: "middle" });
}

// ---------- 6. HOW IT WORKS ----------
{
  const s = slide("CONTENT", "ວິທີແກ້", "ສະແກນດ້ວຍແອັບຂອງຕົນ ເງິນກີບເຂົ້າບັນຊີແມ່ຄ້າໂດຍກົງ",
`[0:35] ວິທີເຮັດວຽກ
"ຂະບວນການງ່າຍໆ:
ແມ່ຄ້າລົງທະບຽນກັບພວກເຮົາ — ໄດ້ປ້າຍ QR.
ນັກທ່ອງທ່ຽວເຫັນໂລໂກ້ແອັບທີ່ຄຸ້ນເຄີຍ — ສະແກນດ້ວຍ PromptPay, Alipay ຫຼື ແອັບຂອງຕົນ.
ເງິນແລ່ນຜ່ານທະນາຄານ ຫຼື PhaJay — ເຂົ້າບັນຊີແມ່ຄ້າເປັນເງິນກີບໂດຍກົງ.
ແລະ ແອັບຂອງເຮົາປະກາດ: 'ໄດ້ຮັບເງິນ 50,000 ກີບ' — ແມ່ຄ້າຍື່ນສິນຄ້າໄດ້ທັນທີ ບໍ່ຕ້ອງເບິ່ງມືຖື ແລະ ບໍ່ຖືກຫຼອກດ້ວຍສະລິບປອມ."

ຈຸດສຳຄັນ: ເງິນບໍ່ເຄີຍຜ່ານບັນຊີຂອງທີມ Phalom. ແອັບຮັບພຽງການແຈ້ງເຕືອນ (notification) ຈາກທະນາຄານ/gateway ເພື່ອປະກາດສຽງ.`);
  const steps = [
    ["1", "ລົງທະບຽນ", "ແມ່ຄ້າສະໝັກຜ່ານມືຖື ໄດ້ປ້າຍ QR ດຽວ"],
    ["2", "ສະແກນ", "ນັກທ່ອງທ່ຽວໃຊ້ PromptPay, Alipay, VietQR ຂອງຕົນ"],
    ["3", "ເງິນເຂົ້າ", "ຜ່ານທະນາຄານ ຫຼື PhaJay ເຂົ້າບັນຊີແມ່ຄ້າເປັນກີບ"],
    ["4", "ໄດ້ຍິນສຽງ", "\"ໄດ້ຮັບເງິນ 50,000 ກີບ\" ຍື່ນສິນຄ້າໄດ້ທັນທີ"],
  ];
  steps.forEach(([n, h, t], i) => {
    const x = M + i * 3.08, w = 2.75;
    box(s, { x, y: 1.5, w, h: 2.35, fill: { color: i === 3 ? K.leafSoft : K.ground }, r: 0.14 });
    diamond(s, x + 0.25, 1.72, 0.6, i === 3 ? K.leaf : K.khram, n);
    T(s, h, { x: x + 0.25, y: 2.45, w: w - 0.45, h: 0.45, fontSize: 18, bold: true, color: i === 3 ? K.leaf : K.khram });
    T(s, t, { x: x + 0.25, y: 2.9, w: w - 0.45, h: 0.9, fontSize: 14 });
    if (i < 3) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + w + 0.06, y: 2.5, w: 0.22, h: 0.35, fill: { color: K.silk }, line: { color: K.silk, width: 0 } });
  });
  // money path
  T(s, "ເສັ້ນທາງຂອງເງິນ", { x: M, y: 4.15, w: 5, h: 0.4, fontSize: 15, bold: true, color: K.khram });
  const nodes = [["ແອັບຂອງນັກທ່ອງທ່ຽວ", "PromptPay · Alipay · WeChat · VietQR · UnionPay", K.white, K.ink], ["ເຄືອຂ່າຍທີ່ໄດ້ຮັບອະນຸຍາດ", "LAPNet ແລະ ທະນາຄານສະມາຊິກ · PhaJay", K.khramSoft, K.khram], ["ບັນຊີແມ່ຄ້າ", "ໄດ້ເງິນກີບ ໃນທະນາຄານຂອງຕົນ", K.leafSoft, K.leaf]];
  nodes.forEach(([h, t, f, c], i) => {
    const x = M + i * 4.1;
    box(s, { x, y: 4.6, w: 3.6, h: 1.15, fill: { color: f }, line: { color: K.line, width: 1 }, r: 0.12 });
    T(s, h, { x: x + 0.2, y: 4.68, w: 3.2, h: 0.4, fontSize: 14, bold: true, color: c });
    T(s, t, { x: x + 0.2, y: 5.08, w: 3.2, h: 0.6, fontSize: 12, color: K.ink2 });
    if (i < 2) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 3.65, y: 5.0, w: 0.4, h: 0.35, fill: { color: K.ink3 }, line: { color: K.ink3, width: 0 } });
  });
  box(s, { x: M, y: 5.95, w: W - 2 * M, h: 0.55, fill: { color: K.silkSoft }, r: 0.1 });
  T(s, [{ text: "Phalom ຢູ່ຂ້າງທາງ ບໍ່ຢູ່ກາງທາງ: ", options: { bold: true } }, { text: "ແອັບສະແດງ QR ແລະ ປະກາດສຽງ ແຕ່ເງິນບໍ່ເຄີຍຜ່ານບັນຊີຂອງທີມ" }], { x: M + 0.25, y: 5.95, w: W - 2 * M - 0.5, h: 0.55, fontSize: 14, valign: "middle", color: K.ink });
}

// ---------- 7. COMPETITION ----------
{
  const s = slide("CONTENT", "ຄູ່ແຂ່ງ", "ທະນາຄານ ແລະ PhaJay ເປັນຄູ່ຮ່ວມ ຄູ່ແຂ່ງແທ້ຄືນິໄສໃຊ້ເງິນສົດ",
`[0:35] ຄູ່ແຂ່ງ
"ມີໃຜເຮັດແບບນີ້ແລ້ວບໍ? LOCA Pay ໃຫ້ນັກທ່ອງທ່ຽວຈ່າຍ QR ໄດ້ — ແຕ່ຕ້ອງໂຫຼດແອັບ ແລະ ຢືນຢັນຕົວຕົນກ່ອນ. PhaJay ເປັນ payment gateway ທີ່ດີ — ແຕ່ເປັນເຄື່ອງມືສຳລັບນັກພັດທະນາ ແມ່ຄ້າຂາຍທາງໃຊ້ເອງບໍ່ໄດ້. ທະນາຄານມີເສັ້ນທາງ — ແຕ່ບໍ່ລົງໄປຫາແມ່ຄ້າ.
ພວກເຮົາເບິ່ງທະນາຄານ ແລະ PhaJay ເປັນຄູ່ຮ່ວມ ບໍ່ແມ່ນສັດຕູ. ຄູ່ແຂ່ງແທ້ຂອງພວກເຮົາຄືນິໄສໃຊ້ເງິນສົດ."

ຂໍ້ມູນທີ່ກວດແລ້ວ: LOCA PAY (loca.la/locapay): ຕ້ອງໂຫຼດແອັບ LOCA ແລະ ຜູກບັດ; ຄ່າທຳນຽມ 3% + 5,000 ກີບ ຕໍ່ຄັ້ງ (ຈ່າຍ 100,000 ກີບ ເສຍ 8,000 ກີບ). PhaJay (phajay.co): REST API, SDK, sandbox ສຳລັບນັກພັດທະນາ; ຮອງຮັບ QR ຂອງ BCEL, JDB, LDB, IB, ST Bank, M Money ແລະ Alipay/WeChat Pay.`);
  const cols = ["", "Phalom", "LOCA Pay", "PhaJay", "ທະນາຄານ"];
  const rows = [
    ["ນັກທ່ອງທ່ຽວຕ້ອງໂຫຼດແອັບໃໝ່", "ບໍ່ຕ້ອງ", "ຕ້ອງໂຫຼດ LOCA ແລະ ຜູກບັດ", "ບໍ່ຕ້ອງ", "ບໍ່ຕ້ອງ"],
    ["ຄ່າທຳນຽມເພີ່ມທີ່ນັກທ່ອງທ່ຽວຈ່າຍ", "ບໍ່ມີເພີ່ມ", "3% + 5,000 ກີບ ຕໍ່ຄັ້ງ", "ຕາມສັນຍາຮ້ານ", "ຕາມທະນາຄານ"],
    ["ແມ່ຄ້າຂາຍທາງ ສະໝັກເອງໄດ້", "ໄດ້ ຜ່ານມືຖື ແລະ ຕົວແທນ", "ໄດ້", "ຕ້ອງຂຽນໂປຣແກຣມ (API)", "ຕ້ອງໄປສາຂາ"],
    ["ຊ່ວຍຂາຍ: ສຽງລາວ, ເມນູຫຼາຍພາສາ, ແຜນທີ່", "ມີຄົບ", "ບໍ່ແມ່ນຈຸດສຸມ", "ບໍ່ມີ", "ບໍ່ມີ"],
    ["ບົດບາດຕໍ່ Phalom", "", "ທາງເລືອກຂອງນັກທ່ອງທ່ຽວ", "ຄູ່ຮ່ວມ", "ຄູ່ຮ່ວມ"],
  ];
  const hdr = cols.map((c, i) => ({ text: c, options: { bold: true, color: i === 1 ? K.white : K.khram, fill: { color: i === 1 ? K.khram : K.khramSoft }, align: i ? "center" : "left", fontSize: 15 } }));
  const body = rows.map(r => r.map((c, i) => ({ text: c, options: { bold: i <= 1, color: i === 1 ? K.khram : K.ink, fill: { color: i === 1 ? K.silkSoft : K.white }, align: i ? "center" : "left", fontSize: 13.5 } })));
  s.addTable([hdr, ...body], { x: M, y: 1.5, w: W - 2 * M, colW: [3.5, 2.2, 2.4, 2.0, 2.03], rowH: 0.62, border: { type: "solid", pt: 1, color: K.line }, valign: "middle", margin: [4, 8, 4, 8] });
  box(s, { x: M, y: 5.5, w: W - 2 * M, h: 0.85, fill: { color: K.ground }, r: 0.12 });
  T(s, [{ text: "ຕົວຢ່າງ: ", options: { bold: true, color: K.khram } }, { text: "ຊື້ຜ້າ 100,000 ກີບ ຜ່ານ LOCA Pay ລູກຄ້າເສຍຄ່າທຳນຽມ 8,000 ກີບ. ຜ່ານປ້າຍ Phalom ລູກຄ້າຈ່າຍດ້ວຍແອັບທະນາຄານຂອງຕົນ ໂດຍບໍ່ມີຄ່າທຳນຽມຈາກ Phalom" }], { x: M + 0.3, y: 5.5, w: W - 2 * M - 0.6, h: 0.85, fontSize: 14, valign: "middle" });
  src(s, "ແຫຼ່ງ: loca.la/locapay (ຄ່າທຳນຽມ 3% + 5,000 LAK, ກວດ 10/2026); phajay.co ແລະ payment-doc.lailaolab.com (API, SDK); Bank of Thailand (03/04/2024)");
}

// ---------- 8. PROTOTYPE ----------
{
  const s = slide("CONTENT", "ຕົ້ນແບບ", "ຕົ້ນແບບ: ແອັບແມ່ຄ້າ ທີ່ກົດໃຊ້ໄດ້ແທ້",
`[1:00] ຕົ້ນແບບ — ສາທິດສົດ
"ຂໍສາທິດໃຫ້ເບິ່ງ. ນີ້ແມ່ນແອັບຈິງ ມີເຊີບເວີຢູ່ Cloudflare ແລະ ຖານຂໍ້ມູນ Supabase.
[ເປີດແອັບແມ່ຄ້າ] ນີ້ຄືໜ້າແອັບຂອງແມ່ຄ້າ: ຍອດຂາຍມື້ນີ້ແບບສົດ ແລະ ລູກຄ້າມາຈາກປະເທດໃດ.
[ກົດ ຮັບເງິນ, ໃສ່ 50,000 ກີບ, ກົດ ສ້າງ QR] ແມ່ຄ້າໃສ່ລາຄາເປັນກີບ ຫຼື ເລືອກສິນຄ້າ. QR ດຽວ ຮັບໄດ້ທຸກແອັບ.
[ໃຫ້ສະມາຊິກສະແກນ QR ດ້ວຍກ້ອງໂທລະສັບ] ໜ້າຈ່າຍເງິນເປີດເປັນພາສາຂອງນັກທ່ອງທ່ຽວ, ລາຄາເປັນກີບ. ກົດຈ່າຍ...
[ສຽງ] ໂທລະສັບແມ່ຄ້າດັງ ແລະ ບອກ 'ໄດ້ຮັບເງິນ 50,000 ກີບ'. ເງິນເຂົ້າບັນຊີ BCEL ຂອງແມ່ຄ້າ."
(ຊ້ອມຫຼາຍຮອບ! ກຽມວິດີໂອບັນທຶກໜ້າຈໍໄວ້ສຳຮອງ ຖ້າອິນເຕີເນັດບໍ່ດີ)

ແອັບແມ່ຄ້າ: ${DEMO} (ກົດ "ລອງໃຊ້ຮ້ານຕົວຢ່າງ")
ແອັບນັກທ່ອງທ່ຽວ (ສາທິດການຈ່າຍ): ${TOURIST}
ຖ້າບໍ່ມີໂທລະສັບອີກເຄື່ອງ: ໃນໜ້າ QR ກົດ "ທົດລອງຈ່າຍ" ເພື່ອເປີດໜ້າຈ່າຍຂອງນັກທ່ອງທ່ຽວ.
ສຽງ: ແອັບ Android ອ່ານເປັນພາສາລາວ (ຫຼື ໄທ ຖ້າເຄື່ອງບໍ່ມີສຽງລາວ). ເປີດລຳໂພງ ແລະ ທົດສອບກ່ອນຂຶ້ນເວທີ.`);
  const shots = [["1-home.png", "ຍອດຂາຍມື້ນີ້ ແບບສົດ"], ["2-pay.png", "ໃສ່ລາຄາເປັນກີບ"], ["3-qr.png", "QR ດຽວ ຮັບທຸກແອັບ"], ["4-done.png", "ສຽງ \"ໄດ້ຮັບເງິນ\""], ["7-map.png", "ນັກທ່ອງທ່ຽວຈ່າຍງ່າຍ"]];
  const h = 4.0, w = h * 780 / 1688, gap = 0.28;
  shots.forEach(([f, c], i) => {
    const x = M + 0.1 + i * (w + gap);
    phone(s, f, x, 1.45, h);
    T(s, c, { x: x - 0.2, y: 5.6, w: w + 0.4, h: 0.4, fontSize: 13, bold: true, color: K.khram, align: "center" });
  });
  s.addImage({ path: SH + "demo-qr.png", x: 11.55, y: 1.4, w: 1.15, h: 1.15 });
  T(s, [{ text: "ແອັບແມ່ຄ້າ", options: { hyperlink: { url: DEMO }, color: K.khram, bold: true } }], { x: 11.3, y: 2.57, w: 1.65, h: 0.32, fontSize: 13, align: "center" });
  s.addImage({ path: SH + "tourist-qr.png", x: 11.55, y: 3.05, w: 1.15, h: 1.15 });
  T(s, [{ text: "ແອັບນັກທ່ອງທ່ຽວ", options: { hyperlink: { url: TOURIST }, color: K.khram, bold: true } }], { x: 11.3, y: 4.22, w: 1.65, h: 0.32, fontSize: 13, align: "center" });
  T(s, "ແອັບຈິງ ອອນລາຍ · ການຈ່າຍເປັນການສາທິດ", { x: 11.3, y: 4.6, w: 1.65, h: 0.8, fontSize: 11.5, color: K.ink2, align: "center" });
  src(s, "ຂໍ້ມູນຍອດຂາຍ ແລະ ຊື່ຮ້ານໃນຕົ້ນແບບ ເປັນຕົວຢ່າງ. ແອັບສະແດງເງິນກີບເທົ່ານັ້ນ; ແອັບຂອງລູກຄ້າ (Alipay, WeChat Pay, PromptPay, VietQR) ເປັນຜູ້ແລກປ່ຽນເງິນ.", 6.45);
}

// ---------- 9. BEFORE / AFTER ----------
{
  const s = slide("CONTENT", "ຕົ້ນແບບ", "ຊີວິດຂອງແມ່ຄ້າ ກ່ອນ ແລະ ຫຼັງໃຊ້ Phalom",
`[0:25] ເສັ້ນທາງຜູ້ໃຊ້ — ກ່ອນ/ຫຼັງ
"ສຳລັບແມ່ຄ້າ — ກ່ອນ: ລູກຄ້າບໍ່ມີກີບກໍ່ຍ່າງໜີ, ຕ້ອງຄິດອັດຕາເອງ, ບໍ່ແນ່ໃຈວ່າເງິນເຂົ້າແທ້. ຫຼັງ: ລູກຄ້າສະແກນໄດ້ທັນທີ, ໄດ້ເງິນກີບເຂົ້າບັນຊີ, ໄດ້ຍິນສຽງຢືນຢັນ — ແລະ ມີລູກຄ້າໃໝ່ມາຈາກແຜນທີ່."
(ຖ້າເວລາເກີນ ໃຫ້ຂ້າມສະໄລດ໌ນີ້ ຫຼື ລວມເຂົ້າກັບການສາທິດ)`);
  const before = ["ລູກຄ້າບໍ່ມີເງິນກີບ ກໍ່ຍ່າງໜີ", "ຕ້ອງຄິດອັດຕາແລກປ່ຽນເອງ", "ບໍ່ແນ່ໃຈວ່າເງິນເຂົ້າແທ້ ສ່ຽງສະລິບປອມ", "ຂາຍໄດ້ແຕ່ຄົນທີ່ຍ່າງຜ່ານ"];
  const after = ["ລູກຄ້າສະແກນດ້ວຍແອັບຂອງຕົນໄດ້ທັນທີ", "ຕັ້ງລາຄາເປັນກີບ, ແອັບຂອງລູກຄ້າແລກປ່ຽນໃຫ້ເອງ", "ໄດ້ເງິນກີບເຂົ້າບັນຊີ ໄດ້ຍິນສຽງຢືນຢັນ", "ມີລູກຄ້າໃໝ່ມາຈາກແຜນທີ່ຮ້ານ"];
  [[before, "ກ່ອນ", K.madder, K.madderSoft, 0], [after, "ຫຼັງ", K.leaf, K.leafSoft, 1]].forEach(([items, h, c, f, i]) => {
    const x = M + i * 6.2, w = 5.85;
    box(s, { x, y: 1.5, w, h: 4.85, fill: { color: f }, r: 0.15 });
    box(s, { x: x + 0.3, y: 1.75, w: 1.3, h: 0.5, fill: { color: c }, r: 0.25 });
    T(s, h, { x: x + 0.3, y: 1.75, w: 1.3, h: 0.5, fontSize: 18, bold: true, color: K.white, align: "center", valign: "middle" });
    items.forEach((t, j) => {
      const y = 2.6 + j * 0.9;
      s.addShape(i ? pres.shapes.OVAL : pres.shapes.OVAL, { x: x + 0.35, y: y + 0.1, w: 0.42, h: 0.42, fill: { color: c }, line: { color: c, width: 0 } });
      T(s, i ? "✓" : "✕", { x: x + 0.35, y: y + 0.1, w: 0.42, h: 0.42, fontSize: 14, bold: true, color: K.white, align: "center", valign: "middle" });
      T(s, t, { x: x + 0.95, y, w: w - 1.2, h: 0.62, fontSize: 16, valign: "middle" });
    });
  });
}

// ---------- 10. BUSINESS MODEL ----------
{
  const s = slide("CONTENT", "ທຸລະກິດ", "ລາຍໄດ້ມາຈາກສ່ວນແບ່ງຄ່າທຳນຽມຂອງຄູ່ຮ່ວມ ແມ່ຄ້າບໍ່ຈ່າຍເພີ່ມ",
`[0:40] ຮູບແບບທຸລະກິດ
"ພວກເຮົາຫາລາຍໄດ້ແນວໃດ? ທຸກທຸລະກຳ ທະນາຄານ ຫຼື payment gateway ເກັບຄ່າທຳນຽມນ້ອຍໆຢູ່ແລ້ວ. ພວກເຮົາພາຮ້ານຄ້າໃໝ່ມາໃຫ້ — ຈຶ່ງເຈລະຈາຂໍສ່ວນແບ່ງຈາກຄ່າທຳນຽມນັ້ນ. ແມ່ຄ້າບໍ່ຈ່າຍເພີ່ມໃຫ້ພວກເຮົາ.
ທຸກຝ່າຍໄດ້ປະໂຫຍດ: ຄູ່ຮ່ວມໄດ້ຮ້ານຄ້າໃໝ່ ໂດຍບໍ່ຕ້ອງລົງທຶນລົງພື້ນທີ່; ແມ່ຄ້າໄດ້ຍອດຂາຍເພີ່ມ; ພວກເຮົາໄດ້ລາຍໄດ້ຕາມຈຳນວນຮ້ານ. ໃນອະນາຄົດ ຈະມີລາຍໄດ້ເສີມຈາກຟັງຊັນພິເສດ ແລະ ໂຄສະນາໃນແຜນທີ່ຮ້ານ."

ຕົວເລກ (ສົມມຸດຕິຖານ): 1 ຮ້ານ × 5 ທຸລະກຳ/ມື້ × ~61,500 ກີບ × 30 ມື້ ≈ 9.2 ລ້ານກີບ/ເດືອນ ຜ່ານລະບົບ. ສ່ວນແບ່ງ ~0.4% ≈ 36,000–40,000 ກີບ/ຮ້ານ/ເດືອນ.`);
  // flow
  const fx = [[M, "ນັກທ່ອງທ່ຽວຈ່າຍ", "100,000 ກີບ", K.ground, K.khram], [M + 4.1, "ທະນາຄານ / PhaJay", "ຫັກຄ່າທຳນຽມຮ້ານຄ້າ (MDR) ຕາມປົກກະຕິ", K.khramSoft, K.khram], [M + 8.2, "ແມ່ຄ້າໄດ້ຮັບ", "ເງິນກີບ ເຂົ້າບັນຊີ", K.leafSoft, K.leaf]];
  fx.forEach(([x, h, t, f, c], i) => {
    box(s, { x, y: 1.5, w: 3.73, h: 1.3, fill: { color: f }, r: 0.12 });
    T(s, h, { x: x + 0.25, y: 1.6, w: 3.3, h: 0.4, fontSize: 15, bold: true, color: c });
    T(s, t, { x: x + 0.25, y: 2.02, w: 3.3, h: 0.7, fontSize: 14 });
    if (i < 2) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 3.78, y: 1.97, w: 0.3, h: 0.35, fill: { color: K.ink3 }, line: { color: K.ink3, width: 0 } });
  });
  s.addShape(pres.shapes.DOWN_ARROW, { x: M + 5.8, y: 2.9, w: 0.35, h: 0.45, fill: { color: K.silk }, line: { color: K.silk, width: 0 } });
  box(s, { x: M + 4.1, y: 3.45, w: 3.73, h: 1.15, fill: { color: K.silk }, r: 0.12 });
  T(s, "ສ່ວນແບ່ງໃຫ້ Phalom", { x: M + 4.35, y: 3.52, w: 3.3, h: 0.4, fontSize: 15, bold: true, color: K.white });
  T(s, "~0.4% ຂອງຍອດ ≈ 36,000–40,000 ກີບ/ຮ້ານ/ເດືອນ", { x: M + 4.35, y: 3.92, w: 3.3, h: 0.6, fontSize: 13, color: K.white });
  // win-win
  const wins = [["ຄູ່ຮ່ວມ", "ໄດ້ຮ້ານຄ້າໃໝ່ ໂດຍບໍ່ຕ້ອງລົງທຶນລົງພື້ນທີ່", K.khram], ["ແມ່ຄ້າ", "ໄດ້ຍອດຂາຍເພີ່ມ ບໍ່ຈ່າຍຄ່າບໍລິການໃຫ້ Phalom", K.leaf], ["Phalom", "ລາຍໄດ້ເພີ່ມຕາມຈຳນວນຮ້ານ", K.silk]];
  wins.forEach(([h, t, c], i) => {
    const x = M + i * 4.1;
    diamond(s, x, 4.95, 0.5, c);
    T(s, h, { x: x + 0.7, y: 4.92, w: 3.1, h: 0.4, fontSize: 16, bold: true, color: c });
    T(s, t, { x: x + 0.7, y: 5.32, w: 3.1, h: 0.65, fontSize: 13.5 });
  });
  box(s, { x: M, y: 6.1, w: W - 2 * M, h: 0.45, fill: { color: K.ground }, r: 0.08 });
  T(s, "ອະນາຄົດ: ຟັງຊັນພິເສດ ແລະ ໂຄສະນາໃນແຜນທີ່ຮ້ານ · ແຜນສຳຮອງ: ຄ່າແພລດຟອມນ້ອຍໆ ຖ້າຄູ່ຮ່ວມບໍ່ແບ່ງລາຍໄດ້", { x: M + 0.25, y: 6.1, w: W - 2 * M - 0.5, h: 0.45, fontSize: 13, valign: "middle", color: K.ink2 });
}

// ---------- 11. ROADMAP ----------
{
  const s = slide("CONTENT", "ແຜນງານ", "ແຜນ 12 ເດືອນ: ຈາກ 50 ຮ້ານ ໃນວຽງຈັນ ເປັນ 700 ຮ້ານ ໃນ 3 ເຂດ",
`[0:25] ແຜນງານ
"ເດືອນ 1–3: ສ້າງ MVP, ເຊັນ MOU ກັບຄູ່ຮ່ວມ, ສຳພາດ ແລະ ນຳຮ່ອງ 50 ຮ້ານໃນວຽງຈັນ.
ເດືອນ 4–6: ເພີ່ມແປເມນູ ແລະ ແຜນທີ່ຮ້ານ — ຂະຫຍາຍເປັນ 200 ຮ້ານ.
ເດືອນ 7–12: ໄປຫຼວງພະບາງ ແລະ ວັງວຽງ — ເປົ້າໝາຍ 700 ຮ້ານ."`);
  // month axis
  const gx = M + 2.6, gw = W - M - gx, mw = gw / 12;
  for (let m = 1; m <= 12; m++) T(s, String(m), { x: gx + (m - 1) * mw, y: 1.5, w: mw, h: 0.3, fontSize: 11, color: K.ink3, align: "center" });
  T(s, "ເດືອນ", { x: M, y: 1.5, w: 2.4, h: 0.3, fontSize: 11, color: K.ink3 });
  const tasks = [
    ["ສ້າງ MVP", 1, 3, K.khram], ["ເຊັນ MOU ກັບຄູ່ຮ່ວມ", 1, 3, K.khram], ["ສຳພາດ + ນຳຮ່ອງ ວຽງຈັນ", 2, 3, K.khram],
    ["ແປເມນູ + ແຜນທີ່ຮ້ານ", 4, 6, K.silk], ["ຂະຫຍາຍ ວຽງຈັນ", 4, 6, K.silk],
    ["ຫຼວງພະບາງ", 7, 12, K.leaf], ["ວັງວຽງ", 8, 12, K.leaf],
  ];
  tasks.forEach(([t, a, b, c], i) => {
    const y = 1.92 + i * 0.47;
    if (i % 2 === 0) box(s, { x: M, y: y - 0.04, w: W - 2 * M, h: 0.47, fill: { color: "F6F7FB" } });
    T(s, t, { x: M + 0.1, y, w: 2.45, h: 0.38, fontSize: 13, valign: "middle" });
    box(s, { x: gx + (a - 1) * mw + 0.04, y: y + 0.05, w: (b - a + 1) * mw - 0.08, h: 0.3, fill: { color: c }, r: 0.08 });
  });
  const ms = [[3, "50 ຮ້ານ", K.khram], [6, "200 ຮ້ານ", K.silk], [12, "700 ຮ້ານ", K.leaf]];
  ms.forEach(([m, t, c]) => {
    const cx = gx + m * mw - mw / 2;
    diamond(s, cx - 0.2, 5.3, 0.4, c);
    T(s, t, { x: cx - 0.9, y: 5.75, w: 1.8, h: 0.4, fontSize: 18, bold: true, color: c, align: "center" });
  });
  T(s, "ເປົ້າໝາຍຈຳນວນຮ້ານ", { x: M + 0.1, y: 5.35, w: 2.4, h: 0.35, fontSize: 13, bold: true, color: K.ink2 });
  src(s, "ນຳຮ່ອງ: ໃຊ້ເດືອນທຳອິດຢືນຢັນຄ່າທຳນຽມ, ຍອດຂາຍຕໍ່ຮ້ານ ແລະ ຈຳນວນທຸລະກຳຕ່າງປະເທດຕໍ່ມື້ ກ່ອນຂະຫຍາຍ", 6.35);
}

// ---------- 12. BUDGET ----------
{
  const s = slide("CONTENT", "ແຜນງານ", "ທຶນເລີ່ມຕົ້ນ 40 ລ້ານກີບ ຄຸ້ມທຶນທີ່ປະມານ 650–770 ຮ້ານ",
`[0:40] ງົບປະມານ
"ພວກເຮົາຕ້ອງການທຶນເລີ່ມຕົ້ນ 40 ລ້ານກີບ ສຳລັບ 3 ເດືອນທຳອິດ — ສ່ວນໃຫຍ່ເປັນຄ່າລົງພື້ນທີ່ ເພາະທີມສ້າງແອັບເອງ ບໍ່ມີຄ່າພັດທະນາ.
ລາຍໄດ້ປະມານ 36,000–40,000 ກີບ ຕໍ່ຮ້ານ ຕໍ່ເດືອນ. ຈຸດຄຸ້ມທຶນຢູ່ທີ່ປະມານ 650–770 ຮ້ານ — ເຊິ່ງເຮົາຄາດວ່າຈະຮອດໃນເດືອນທີ 12–13. ປີທຳອິດຕ້ອງການທຶນລວມປະມານ 100 ລ້ານກີບ.
ຕົວເລກເຫຼົ່ານີ້ເປັນການຄາດຄະເນ — ພວກເຮົາຈະຢືນຢັນຄ່າທຳນຽມ ແລະ ຍອດຂາຍຈິງ ໃນເດືອນທຳອິດຂອງການນຳຮ່ອງ."
(ການບອກຕາມຈິງວ່າເປັນການຄາດຄະເນ ສ້າງຄວາມເຊື່ອຖື)

ການແບ່ງງົບ 40 ລ້ານກີບ ເປັນຂໍ້ສະເໜີຂອງທີມ (ປັບໄດ້): ຕົວແທນລົງພື້ນທີ່ 18, ຄ່າເດີນທາງ 6, ປ້າຍ QR ແລະ ສະແຕນ 5, ການຕະຫຼາດກັບໂຮງແຮມ/ທົວ 4, server/SMS/ໂດເມນ 3, ສຳຮອງ 4.
ຈຸດຄຸ້ມທຶນ: ຄ່າໃຊ້ຈ່າຍປະຈຳເດືອນ ~26–28 ລ້ານກີບ ÷ 36,000–40,000 ກີບ/ຮ້ານ ≈ 650–770 ຮ້ານ. 40 ລ້ານກີບ ≈ 1,780 USD; 100 ລ້ານກີບ ≈ 4,450 USD.`);
  s.addChart(pres.charts.BAR, [{ name: "ລ້ານກີບ", labels: ["ຕົວແທນລົງພື້ນທີ່", "ຄ່າເດີນທາງ", "ປ້າຍ QR ແລະ ສະແຕນ", "ການຕະຫຼາດ ໂຮງແຮມ/ທົວ", "Server, SMS", "ສຳຮອງ"], values: [18, 6, 5, 4, 3, 4] }], {
    x: M, y: 1.45, w: 6.9, h: 4.6, barDir: "bar", catAxisOrientation: "maxMin",
    chartColors: [K.khram], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 13, dataLabelColor: K.ink, dataLabelFontFace: "+mn-lt",
    catAxisLabelColor: K.ink2, catAxisLabelFontSize: 13, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: false, showTitle: true, title: "ງົບ 3 ເດືອນທຳອິດ: 40 ລ້ານກີບ (ລ້ານກີບ)", titleFontSize: 14, titleColor: K.ink2, titleFontFace: "+mn-lt", barGapWidthPct: 40,
  });
  const kp = [["36–40 ພັນ", "ກີບ ລາຍໄດ້ຕໍ່ຮ້ານ ຕໍ່ເດືອນ", K.khram], ["650–770", "ຮ້ານ ຈຸດຄຸ້ມທຶນ (ເດືອນທີ 12–13)", K.leaf], ["~100 ລ້ານ", "ກີບ ທຶນລວມປີທຳອິດ", K.silk]];
  kp.forEach(([n, t, c], i) => {
    const y = 1.5 + i * 1.5;
    box(s, { x: 7.85, y, w: 4.88, h: 1.3, fill: { color: K.ground }, r: 0.12 });
    T(s, n, { x: 8.1, y: y + 0.1, w: 4.4, h: 0.65, fontSize: 30, bold: true, color: c, valign: "middle" });
    T(s, t, { x: 8.1, y: y + 0.75, w: 4.4, h: 0.45, fontSize: 13.5, color: K.ink2 });
  });
  T(s, "ທີມສ້າງແອັບເອງ ບໍ່ມີຄ່າພັດທະນາ. ຕົວເລກທັງໝົດເປັນການຄາດຄະເນ ຈະຢືນຢັນໃນເດືອນທຳອິດຂອງການນຳຮ່ອງ.", { x: 7.85, y: 6.0, w: 4.88, h: 0.6, fontSize: 12, italic: true, color: K.ink3 });
}

// ---------- 13. RISK + SWOT ----------
{
  const s = slide("CONTENT", "ແຜນງານ", "ຄວາມສ່ຽງມີທາງອອກ ຈຸດແຂງຄືເຄືອຂ່າຍແມ່ຄ້າ",
`[0:45] ຄວາມສ່ຽງ + SWOT
"ຄວາມສ່ຽງສູງສຸດ 2 ຢ່າງ:
ໜຶ່ງ — ຄູ່ຮ່ວມບໍ່ຮ່ວມມື: ພວກເຮົາມີຫຼາຍທາງເລືອກ — ທະນາຄານສະມາຊິກ LAPNet ຫຼາຍແຫ່ງ ແລະ PhaJay — ບໍ່ຂຶ້ນກັບແຫ່ງດຽວ.
ສອງ — ແມ່ຄ້າບໍ່ຍອມປ່ຽນ: ພວກເຮົາບໍ່ເກັບຄ່າບໍລິການຈາກແມ່ຄ້າ ແລະ ຈະສະແດງຍອດຂາຍທີ່ເພີ່ມຂຶ້ນຈິງ.
ຄວາມສ່ຽງອື່ນ ເຊັ່ນ ຖ້າ Alipay ຕ້ອງໃຊ້ QR ແຍກ — ພວກເຮົາລວມໄວ້ໃນປ້າຍດຽວ ແລະ ໃຫ້ແອັບເລືອກໃຫ້ອັດຕະໂນມັດ.
ຈຸດແຂງຂອງພວກເຮົາ: ໃຊ້ເສັ້ນທາງທີ່ມີແລ້ວ, ຕົ້ນທຶນຕ່ຳ, ແລະ ເຄືອຂ່າຍແມ່ຄ້າ — ສິ່ງທີ່ລອກຍາກທີ່ສຸດ."

ໝາຍເຫດ: Alipay/WeChat Pay ໃນລາວ ໃຊ້ຜ່ານ BCEL–Wallyt ຫຼື PhaJay ເຊິ່ງແຍກຈາກເສັ້ນທາງ LAPNet–UnionPay. ເປົ້າ 2026–2030: 22 ລ້ານ ນັກທ່ອງທ່ຽວຕ່າງປະເທດ (Laotian Times, 01/2026).`);
  const risks = [
    ["ຄູ່ຮ່ວມບໍ່ຮ່ວມມື", "ສູງ", "ທະນາຄານສະມາຊິກ LAPNet ຫຼາຍແຫ່ງ ແລະ PhaJay ບໍ່ຂຶ້ນກັບແຫ່ງດຽວ"],
    ["ແມ່ຄ້າບໍ່ຍອມປ່ຽນ", "ສູງ", "ບໍ່ເກັບຄ່າບໍລິການ ສະແດງຍອດຂາຍທີ່ເພີ່ມຂຶ້ນຈິງ"],
    ["Alipay ຕ້ອງໃຊ້ QR ແຍກ", "ກາງ", "ລວມໄວ້ໃນປ້າຍດຽວ ແອັບເລືອກໃຫ້ອັດຕະໂນມັດ"],
  ];
  const hdr = ["ຄວາມສ່ຽງ", "ລະດັບ", "ວິທີຮັບມື"].map(t => ({ text: t, options: { bold: true, color: K.white, fill: { color: K.khram }, fontSize: 14 } }));
  s.addTable([hdr, ...risks.map(r => r.map((c, i) => ({ text: c, options: { fontSize: 13, bold: i === 0, color: i === 1 ? (c === "ສູງ" ? K.madder : K.silk) : K.ink, align: i === 1 ? "center" : "left" } })))],
    { x: M, y: 1.5, w: 6.1, colW: [1.9, 0.9, 3.3], rowH: [0.55, 1.25, 1.25, 1.25], border: { type: "solid", pt: 1, color: K.line }, valign: "middle", margin: [4, 8, 4, 8] });
  const sw = [
    ["S ຈຸດແຂງ", ["ໃຊ້ເສັ້ນທາງເງິນທີ່ມີແລ້ວ", "ຕົ້ນທຶນຕ່ຳ ທີມສ້າງແອັບເອງ", "ເຄືອຂ່າຍແມ່ຄ້າ ລອກຍາກ"], K.leaf, K.leafSoft],
    ["W ຈຸດອ່ອນ", ["ທີມໃໝ່ ຍັງບໍ່ມີ MOU", "ລາຍໄດ້ຕໍ່ຮ້ານນ້ອຍ", "ຂຶ້ນກັບຄູ່ຮ່ວມ"], K.madder, K.madderSoft],
    ["O ໂອກາດ", ["ນັກທ່ອງທ່ຽວ +11% ປີ 2025", "QR ຂ້າມແດນ ໄທ ຈີນ ຫວຽດ ເປີດແລ້ວ", "ເປົ້າລັດ 22 ລ້ານຄົນ 2026–2030"], K.khram, K.khramSoft],
    ["T ໄພຂົ່ມຂູ່", ["ທະນາຄານ ຫຼື ແອັບໃຫຍ່ເຮັດເອງ", "ກົດລະບຽບປ່ຽນ", "ອັດຕາແລກປ່ຽນຜັນຜວນ"], K.silk, K.silkSoft],
  ];
  sw.forEach(([h, items, c, f], i) => {
    const x = 7.0 + (i % 2) * 2.9, y = 1.5 + Math.floor(i / 2) * 2.45, w = 2.75, hh = 2.3;
    box(s, { x, y, w, h: hh, fill: { color: f }, r: 0.12 });
    T(s, h, { x: x + 0.2, y: y + 0.12, w: w - 0.3, h: 0.4, fontSize: 15, bold: true, color: c });
    T(s, items.map((t, j) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: j < items.length - 1 } })), { x: x + 0.2, y: y + 0.58, w: w - 0.35, h: 1.6, fontSize: 12.5, paraSpaceAfter: 4 });
  });
  src(s, "ເປົ້າ 22 ລ້ານ ນັກທ່ອງທ່ຽວຕ່າງປະເທດ 2026–2030: Laotian Times (16/01/2026)");
}

// ---------- 14. IMPACT ----------
{
  const s = slide("CONTENT", "ຜົນກະທົບ", "ຜົນກະທົບຫຼາຍກວ່າເງິນ: ແມ່ຄ້າມີປະຫວັດດິຈິຕອລ ຊາວໜຸ່ມມີວຽກ",
`[0:35] ຜົນກະທົບ
"ເປົ້າໝາຍປີທຳອິດ: 700 ຮ້ານ, ຢ່າງໜ້ອຍ 70% ຍັງໃຊ້ຫຼັງ 3 ເດືອນ, ແລະ 5 ທຸລະກຳຕ່າງປະເທດ ຕໍ່ຮ້ານ ຕໍ່ມື້.
ຜົນກະທົບຫຼາຍກວ່າເງິນ: ແມ່ຄ້າຂາຍທາງ ທີ່ສ່ວນຫຼາຍເປັນແມ່ຍິງ — ຈະມີປະຫວັດທຸລະກຳດິຈິຕອລ ເພື່ອເຂົ້າເຖິງສິນເຊື່ອ. ສ້າງວຽກໃຫ້ຊາວໜຸ່ມເປັນຕົວແທນລົງພື້ນທີ່. ແລະ ເງິນຕາຕ່າງປະເທດໄຫຼເຂົ້າລະບົບທະນາຄານ ແທນທີ່ຈະໝູນວຽນເປັນເງິນສົດ.
ໃນອະນາຄົດ ຂະຫຍາຍໄປ ລົດຕຸກຕຸກ, ເຮືອນພັກ, ສະຖານີລົດໄຟລາວ-ຈີນ — ແລະ ນັກທ່ອງທ່ຽວເກົາຫຼີ."

ຂໍ້ມູນ: ນັກທ່ອງທ່ຽວເກົາຫຼີ 182,709 ຄົນ ປີ 2025 (KPL). 5 ທຸລະກຳ/ມື້ × ~61,500 ກີບ ≈ 9.2 ລ້ານກີບ/ເດືອນ ຍອດຂາຍຕ່າງປະເທດເພີ່ມຕໍ່ຮ້ານ (ສົມມຸດຕິຖານ).`);
  const kpis = [["700", "ຮ້ານ ໃນປີທຳອິດ"], ["70%", "ຍັງໃຊ້ຫຼັງ 3 ເດືອນ"], ["5", "ທຸລະກຳຕ່າງປະເທດ ຕໍ່ຮ້ານ ຕໍ່ມື້"]];
  kpis.forEach(([n, t], i) => {
    const x = M + i * 4.1;
    box(s, { x, y: 1.5, w: 3.8, h: 1.55, fill: { color: K.khram }, r: 0.14 });
    T(s, n, { x: x + 0.3, y: 1.58, w: 3.3, h: 0.85, fontSize: 44, bold: true, color: K.white, valign: "middle" });
    T(s, t, { x: x + 0.3, y: 2.45, w: 3.3, h: 0.5, fontSize: 14, color: "DDE2F7" });
  });
  const soc = [["ແມ່ຍິງ", "ແມ່ຄ້າຂາຍທາງ ທີ່ສ່ວນຫຼາຍເປັນແມ່ຍິງ ມີປະຫວັດທຸລະກຳດິຈິຕອລ ເພື່ອເຂົ້າເຖິງສິນເຊື່ອ", K.madder], ["ຊາວໜຸ່ມ", "ສ້າງວຽກໃຫ້ຊາວໜຸ່ມເປັນຕົວແທນລົງພື້ນທີ່", K.silk], ["ເສດຖະກິດ", "ເງິນຕາຕ່າງປະເທດໄຫຼເຂົ້າລະບົບທະນາຄານ ແທນທີ່ຈະໝູນວຽນເປັນເງິນສົດ", K.leaf]];
  soc.forEach(([h, t, c], i) => {
    const y = 3.35 + i * 0.85;
    diamond(s, M, y + 0.08, 0.45, c);
    T(s, h, { x: M + 0.65, y, w: 1.5, h: 0.6, fontSize: 15, bold: true, color: c, valign: "middle" });
    T(s, t, { x: M + 2.15, y, w: 5.6, h: 0.6, fontSize: 14, valign: "middle" });
  });
  box(s, { x: 8.55, y: 3.35, w: 4.18, h: 2.6, fill: { color: K.ground }, r: 0.14 });
  T(s, "ຂະຫຍາຍຕໍ່", { x: 8.8, y: 3.5, w: 3.7, h: 0.4, fontSize: 15, bold: true, color: K.khram });
  T(s, ["ລົດຕຸກຕຸກ", "ເຮືອນພັກ (Homestay)", "ສະຖານີລົດໄຟລາວ-ຈີນ", "ນັກທ່ອງທ່ຽວເກົາຫຼີ (182,709 ຄົນ ປີ 2025)"].map((t, j, a) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < a.length - 1 } })), { x: 8.8, y: 3.95, w: 3.75, h: 1.9, fontSize: 14, paraSpaceAfter: 6 });
  src(s, "ເປົ້າໝາຍ KPI ເປັນຂອງທີມ. ຈຳນວນນັກທ່ອງທ່ຽວເກົາຫຼີ: KPL (01/2026)");
}

// ---------- 15. CONCLUSION ----------
{
  const s = slide("COVER", "ສະຫຼຸບ", null,
`[0:30] ສະຫຼຸບ
"ສະຫຼຸບ: ເສັ້ນທາງເງິນມີແລ້ວ — ພວກເຮົາພາແມ່ຄ້ານ້ອຍໄປເຖິງ.
ເພື່ອໃຫ້ເກີດຂຶ້ນຈິງ ພວກເຮົາຕ້ອງການ: ການແນະນຳຕໍ່ທະນາຄານ ແລະ PhaJay, ທຶນນຳຮ່ອງ, ແລະ ການຮ່ວມມືຈາກຄະນະຕະຫຼາດ ແລະ ພະແນກທ່ອງທ່ຽວ.
ນັກທ່ອງທ່ຽວຈ່າຍແບບບ້ານເຂົາ — ແມ່ຄ້າຮັບເງິນກີບແບບບ້ານເຮົາ.
ຂອບໃຈ — ພວກເຮົາພ້ອມຕອບຄຳຖາມ."
(ປິດດ້ວຍຄຳຂວັນດຽວກັບຕອນເປີດ)`);
  [[10.2, 0.5, 2.6, "2A3880"], [10.75, 1.05, 1.5, K.silk]].forEach(([x, y, d, c]) => s.addShape(pres.shapes.DIAMOND, { x, y, w: d, h: d, fill: { color: c }, line: { color: c, width: 0 } }));
  T(s, "ສະຫຼຸບ", { x: M + 0.1, y: 0.7, w: 6, h: 0.4, fontSize: 14, color: "C9D0F0" });
  T(s, "ເສັ້ນທາງເງິນມີແລ້ວ\nພວກເຮົາພາແມ່ຄ້ານ້ອຍໄປເຖິງ", { x: M + 0.1, y: 1.15, w: 9.3, h: 1.6, fontSize: 36, bold: true, color: K.white, valign: "middle" });
  T(s, "ສິ່ງທີ່ພວກເຮົາຕ້ອງການ", { x: M + 0.1, y: 3.0, w: 6, h: 0.4, fontSize: 15, bold: true, color: "F0C060" });
  const asks = ["ການແນະນຳຕໍ່ທະນາຄານ ແລະ PhaJay", "ທຶນນຳຮ່ອງ 40 ລ້ານກີບ", "ການຮ່ວມມືຈາກຄະນະຕະຫຼາດ ແລະ ພະແນກທ່ອງທ່ຽວ"];
  asks.forEach((t, i) => {
    const x = M + 0.1 + i * 4.05;
    box(s, { x, y: 3.5, w: 3.8, h: 1.0, fill: { color: "2A3880" }, r: 0.12 });
    T(s, t, { x: x + 0.25, y: 3.5, w: 3.35, h: 1.0, fontSize: 15, color: K.white, valign: "middle" });
  });
  T(s, [{ text: "ນັກທ່ອງທ່ຽວຈ່າຍແບບບ້ານເຂົາ  ", options: { color: K.white } }, { text: "ແມ່ຄ້າຮັບເງິນກີບແບບບ້ານເຮົາ", options: { color: "F0C060" } }], { x: M + 0.1, y: 4.85, w: 12, h: 0.65, fontSize: 24, bold: true });
  T(s, "ຂອບໃຈ · ພ້ອມຕອບຄຳຖາມ\nອີເມວ: [ອີເມວທີມ] · ໂທ: [ເບີໂທ] · Facebook / WhatsApp: [ຊ່ອງທາງ]", { x: M + 0.1, y: 5.75, w: 9, h: 0.9, fontSize: 14, color: "C9D0F0" });
  s.addImage({ path: SH + "demo-qr.png", x: 11.55, y: 5.35, w: 1.2, h: 1.2 });
  T(s, "ລອງແອັບ", { x: 11.35, y: 6.6, w: 1.6, h: 0.3, fontSize: 11, color: "C9D0F0", align: "center" });
}

// ---------- 16. Q&A BACKUP ----------
{
  const s = slide("CONTENT", "ສຳຮອງ", "ສຳຮອງ: ກຽມຕອບຄຳຖາມ 8 ຂໍ້",
`ສະໄລດ໌ສຳຮອງ ສຳລັບຊ່ວງ Q&A. ຂໍ້ມູນເສີມ:
- LOCA Pay ເກັບ 3% + 5,000 ກີບ ຕໍ່ຄັ້ງ ຈາກນັກທ່ອງທ່ຽວ (loca.la/locapay).
- ເສັ້ນທາງ QR ຂ້າມແດນ: ໄທ 07/2024, ຈີນ (UnionPay–LAPNet) 12/2024, ຫວຽດນາມ 01/2025.
- 3.5 ລ້ານ USD = 700 ຮ້ານ × 5 ທຸລະກຳ × 365 ມື້ × ~61,500 ກີບ.`);
  const qa = [
    ["ໄດ້ລົງພື້ນທີ່ບໍ?", "ໃຊ້ຂໍ້ມູນທາງການ + ສອບຖາມທະນາຄານ 4 ແຫ່ງ; ການສຳພາດແມ່ຄ້າຢູ່ໃນເດືອນທຳອິດຂອງນຳຮ່ອງ"],
    ["PhaJay ເຮັດແລ້ວ ເປັນຫຍັງຕ້ອງມີທ່ານ?", "PhaJay ເປັນເຄື່ອງມືນັກພັດທະນາ; ເຮົາເຮັດໃຫ້ມັນໄປເຖິງແມ່ຄ້າທີ່ຂຽນໂປຣແກຣມບໍ່ເປັນ"],
    ["ທະນາຄານບໍ່ເຮັດເອງບໍ?", "ການລົງຫາແມ່ຄ້າທີລະຄົນບໍ່ຄຸ້ມທຶນສຳລັບທະນາຄານ"],
    ["ຖືກກົດໝາຍບໍ?", "ເງິນຜ່ານທະນາຄານ/gateway ທີ່ໄດ້ຮັບອະນຸຍາດ; ທີມບໍ່ຖືເງິນ"],
    ["ຕົວເລກມາຈາກໃສ?", "TAM ຈາກລາຍງານທາງການ; ຄ່າທຳນຽມ ແລະ ຍອດຂາຍເປັນສົມມຸດຕິຖານ ຈະຢືນຢັນໃນນຳຮ່ອງ"],
    ["3.5 ລ້ານໂດລາ ແມ່ນລາຍໄດ້ທີມບໍ?", "ບໍ່. ເປັນຍອດເງິນຜ່ານລະບົບ; ລາຍໄດ້ທີມແມ່ນສ່ວນແບ່ງຄ່າທຳນຽມ"],
    ["ຖ້າຄູ່ຮ່ວມບໍ່ແບ່ງລາຍໄດ້?", "ແຜນສຳຮອງ: ຄ່າແພລດຟອມນ້ອຍໆ ຫຼື ຄ່າຟັງຊັນພິເສດ"],
    ["ເງິນເດືອນທີມລວມບໍ?", "ປີທຳອິດຍັງບໍ່ລວມ; ຕອບຕາມຈິງ"],
  ];
  const hdr = ["ຄຳຖາມ", "ຄຳຕອບສັ້ນ"].map(t => ({ text: t, options: { bold: true, color: K.white, fill: { color: K.khram }, fontSize: 14 } }));
  s.addTable([hdr, ...qa.map((r, i) => r.map((c, j) => ({ text: c, options: { fontSize: 13, bold: j === 0, color: j === 0 ? K.khram : K.ink, fill: { color: i % 2 ? K.white : "F6F7FB" } } })))],
    { x: M, y: 1.45, w: W - 2 * M, colW: [4.0, W - 2 * M - 4.0], rowH: 0.56, border: { type: "solid", pt: 1, color: K.line }, valign: "middle", margin: [3, 8, 3, 8] });
}

// ---------- 17. SOURCES ----------
{
  const s = slide("CONTENT", "ສຳຮອງ", "ແຫຼ່ງຂໍ້ມູນ",
`ລາຍການແຫຼ່ງຂໍ້ມູນທີ່ໃຊ້ໃນ deck. ກວດສອບເມື່ອ 14/10/2026.`);
  const refs = [
    "ກົມພັດທະນາການທ່ອງທ່ຽວ, Statistical Report on Tourism 2024 (tdd.gov.la): ນັກທ່ອງທ່ຽວ 4,120,832 ຄົນ; ລາຍຮັບ 1,421,992,819 USD (ຕາຕະລາງ 7, 10)",
    "KPL, \"Laos Records Strong Tourism Growth with 4.5 Million International Visitors in 2025\" (kpl.gov.la): 4,580,709 ຄົນ, +11%, ແຍກຕາມປະເທດ",
    "Laotian Times (16/01/2026): ເກີນເປົ້າ 4.3 ລ້ານ; ເປົ້າ 2026–2030 ນັກທ່ອງທ່ຽວຕ່າງປະເທດ 22 ລ້ານຄົນ",
    "Bank of Thailand, Joint Press Release (03/04/2024): ເຊື່ອມ QR ໄທ–ລາວ; Tourism Laos (17/07/2024): Krungsri ສະແກນ LAO QR, ທະນາຄານລາວ 17 ແຫ່ງ",
    "Tourism Laos (17/01/2025) ແລະ Caixin (20/12/2024): UnionPay International ເຊື່ອມ LAPNet, 8 ທະນາຄານສະມາຊິກ",
    "Greater Mekong / Internet Laos (01/2025): QR ຂ້າມແດນ ລາວ–ຫວຽດນາມ ເປີດ 9 ມັງກອນ, ທະນາຄານລາວ 14 ແຫ່ງ",
    "The Asian Banker (14/10/2019): BCEL ຮ່ວມກັບ Wallyt ຮັບ Alipay ແລະ WeChat Pay",
    "loca.la/locapay: ຕ້ອງໂຫຼດແອັບ LOCA ແລະ ຜູກບັດ; ຄ່າທຳນຽມ 3% + 5,000 LAK ຕໍ່ຄັ້ງ",
    "phajay.co ແລະ payment-doc.lailaolab.com: Payment QR, Payment Link, REST API, SDK, Alipay/WeChat Pay",
    "ອັດຕາແລກປ່ຽນສຳລັບຂະໜາດຕະຫຼາດ: ValutaFX (02/10/2026: 1 USD = 22,458 LAK)",
  ];
  T(s, refs.map((t, i) => ({ text: t, options: { bullet: { type: "number" }, breakLine: i < refs.length - 1 } })), { x: M, y: 1.45, w: W - 2 * M, h: 5.3, fontSize: 14, paraSpaceAfter: 8, color: K.ink2 });
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
