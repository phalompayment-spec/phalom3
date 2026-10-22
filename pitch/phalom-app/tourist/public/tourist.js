// Tourist demo: pay a Lao shop from the wallet you already use. Payments are simulated.
// Amounts are shown in Lao kip only; the tourist's own wallet does any conversion.
(function () {
  const { $, $$, fmt, esc, api, WALLET, walletTile, timeLo, petals, countUp, toast, store, sleep, gmap, distTxt, hhmm } = window.Phalom;
  const { icon, CAT, champa, scene, flag, kanok } = window.G;
  const app = $("#app");

  const T = {
    lo: { price: "ລາຄາສິນຄ້າ", feeL: "ຄ່າທຳນຽມ PhaJay 1.5%", totalPay: "ທ່ານຈ່າຍທັງໝົດ", walk: "ເສັ້ນທາງຍ່າງ", walkSub: "{n} ຮ້ານ · ຍ່າງ {d}", walkGo: "ເລີ່ມຍ່າງໃນ Google Maps", map: "ແຜນທີ່ຮ້ານ", mapSub: "ຮ້ານແນະນຳສຳລັບທ່ານ ໃນ Google Maps", near: "ໃກ້ຂ້ອຍ", all: "ທັງໝົດ", dir: "ນຳທາງ", menu: "ເມນູ ແລະ ຈ່າຍ", picks: "ແນະນຳສຳລັບທ່ານ", why: "ຈັດອັນດັບຈາກສິ່ງທີ່ນັກທ່ອງທ່ຽວຈາກ{c}ຊື້ຢູ່ນີ້, ໄລຍະທາງ ແລະ ເວລາເປີດຮ້ານ.", notLaos: "ຕອນນີ້ທ່ານບໍ່ໄດ້ຢູ່ລາວ, ແຜນທີ່ຈຶ່ງເລີ່ມທີ່ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ.", locating: "ກຳລັງຊອກຫາຈຸດຂອງທ່ານ…", r_loved: "ຄົນ{c}ມັກ", r_open: "ເປີດຢູ່", r_closed: "ປິດ · ເປີດ {t}", r_near: "ຍ່າງໄປໃກ້", r_top: "ຄະແນນສູງ", r_gem: "ຮ້ານລັບ ໜ້າລອງ", r_busy: "ມື້ນີ້ຄົນຫຼາຍ", fromP: "ເລີ່ມ", c_cn: "ຈີນ", c_th: "ໄທ", c_vn: "ຫວຽດນາມ", c_kr: "ເກົາຫຼີ", c_la: "ລາວ", c_other: "ປະເທດຂອງທ່ານ", cat_food: "ອາຫານ", cat_souvenir: "ຫັດຖະກຳ", cat_drinks: "ເຄື່ອງດື່ມ", cat_coffee: "ກາເຟ", cat_silver: "ເຄື່ອງເງິນ", hi: "ຍິນດີຕ້ອນຮັບສູ່ລາວ", wallet: "ແອັບຈ່າຍເງິນຂອງທ່ານ", walletSub: "ທົດລອງ: ເລືອກແອັບທີ່ທ່ານໃຊ້ຈ່າຍຢູ່ບ້ານ", shops: "ຮ້ານໃກ້ທ່ານ", scan: "ສະແກນ QR ຂອງຮ້ານ", words: "ເວົ້າພາສາລາວ", pay: "ຈ່າຍ", payWith: "ຈ່າຍດ້ວຍ", kipNote: "ລາຄາເປັນເງິນກີບ. ແອັບຂອງທ່ານຈະສະແດງເປັນເງິນຂອງທ່ານເອງ ຕອນກົດຢືນຢັນ.", demo: "ສາທິດເທົ່ານັ້ນ: ບໍ່ມີເງິນຈິງເຄື່ອນໄຫວ.", steps: ["ແອັບຂອງທ່ານ", "PhaJay", "ທະນາຄານຂອງຮ້ານ"], paying: "ກຳລັງຈ່າຍ…", thanks: "ຂອບໃຈ!", paid: "ຈ່າຍແລ້ວ", shopGot: "ຮ້ານໄດ້ຮັບ", ref: "ເລກອ້າງອີງ", time: "ເວລາ", back: "ກັບໄປໜ້າຮ້ານ", choose: "ເລືອກສິນຄ້າ", total: "ລວມ", already: "ບິນນີ້ຈ່າຍແລ້ວ", expired: "QR ນີ້ໝົດອາຍຸແລ້ວ. ຂໍໃຫ້ຮ້ານສ້າງໃໝ່.", notFound: "ບໍ່ພົບລາຍການ", scanHelp: "ສ່ອງໃສ່ QR ຂອງຮ້ານ", noCam: "ໃຊ້ກ້ອງຖ່າຍຮູບຂອງໂທລະສັບສະແກນ QR, ມັນຈະເປີດຢູ່ນີ້.", other: "ຈຳນວນອື່ນ", amount: "ຈຳນວນ (ກີບ)", paidToday: "ຈ່າຍມື້ນີ້" },
    en: { price: "Price", feeL: "PhaJay fee 1.5%", totalPay: "You pay in total", c_la: "Laos", walk: "Walk plan", walkSub: "{n} stops · {d} on foot", walkGo: "Start walk in Google Maps", map: "Shop map", mapSub: "Picked for you on Google Maps", near: "Near me", all: "All", dir: "Directions", menu: "Menu & pay", picks: "Picked for you", why: "Ranked by what visitors from {c} buy here, distance and opening hours.", notLaos: "You're not in Laos right now, so the map starts at Luang Prabang night market.", locating: "Finding you…", r_loved: "Loved by visitors from {c}", r_open: "Open now", r_closed: "Closed · opens {t}", r_near: "Short walk", r_top: "Top rated", r_gem: "Hidden gem", r_busy: "Busy today", fromP: "from", c_cn: "China", c_th: "Thailand", c_vn: "Vietnam", c_kr: "Korea", c_other: "your country", cat_food: "Food", cat_souvenir: "Crafts", cat_drinks: "Drinks", cat_coffee: "Coffee", cat_silver: "Silver", hi: "Welcome to Laos", wallet: "Your wallet", walletSub: "Demo: pick the app you would pay with at home", shops: "Shops near you", scan: "Scan a shop's QR", words: "Say it in Lao", pay: "Pay", payWith: "Pay with", kipNote: "The price is in Lao kip. Your wallet shows it in your own money when you confirm.", demo: "Demo only: no real money moves.", steps: ["Your wallet", "PhaJay", "Shop's bank"], paying: "Paying…", thanks: "Thank you!", paid: "Payment sent", shopGot: "The shop received", ref: "Reference", time: "Time", back: "Back to shops", choose: "Choose items", total: "Total", already: "This bill is already paid", expired: "This QR has expired. Ask the shop for a new one.", notFound: "Payment not found", scanHelp: "Point at the QR on the shop's stand", noCam: "Use your phone's camera app to scan the QR. It opens here.", other: "Other amount", amount: "Amount (kip)", paidToday: "paid today" },
    zh: { c_la: "老挝", walk: "步行路线", walkSub: "{n} 个站点 · 步行 {d}", walkGo: "在谷歌地图开始步行", map: "店铺地图", mapSub: "在谷歌地图上为你推荐", near: "我附近", all: "全部", dir: "导航", menu: "菜单与付款", picks: "为你推荐", why: "根据{c}游客在这里买什么、距离和营业时间排序。", notLaos: "你现在不在老挝，地图从琅勃拉邦夜市开始。", locating: "正在定位…", r_loved: "{c}游客最爱", r_open: "营业中", r_closed: "已打烊 · {t} 开门", r_near: "步行可达", r_top: "高分好店", r_gem: "宝藏小店", r_busy: "今天很热闹", fromP: "起", c_cn: "中国", c_th: "泰国", c_vn: "越南", c_kr: "韩国", c_other: "你的国家", cat_food: "美食", cat_souvenir: "手工艺", cat_drinks: "饮品", cat_coffee: "咖啡", cat_silver: "银饰", hi: "欢迎来到老挝", wallet: "你的钱包", walletSub: "演示：选择你平时用的支付应用", shops: "附近的店铺", scan: "扫描店铺二维码", words: "学说老挝语", pay: "付款", payWith: "使用", kipNote: "价格以老挝基普标示。确认时，你的钱包会显示你本国货币的金额。", demo: "仅为演示，不会产生真实扣款。", steps: ["你的钱包", "PhaJay", "店铺银行"], paying: "付款中…", thanks: "谢谢！", paid: "付款成功", shopGot: "店铺已收到", ref: "参考号", time: "时间", back: "返回店铺", choose: "选择商品", total: "合计", already: "此账单已付款", expired: "二维码已过期，请让店家重新生成。", notFound: "未找到付款", scanHelp: "对准店铺的二维码", noCam: "请用手机相机扫描二维码，会在这里打开。", other: "其他金额", amount: "金额（基普）", paidToday: "今日已付" },
    th: { c_la: "ลาว", walk: "เส้นทางเดิน", walkSub: "{n} จุด · เดิน {d}", walkGo: "เริ่มเดินใน Google Maps", map: "แผนที่ร้าน", mapSub: "แนะนำสำหรับคุณบน Google Maps", near: "ใกล้ฉัน", all: "ทั้งหมด", dir: "นำทาง", menu: "เมนูและจ่าย", picks: "แนะนำสำหรับคุณ", why: "จัดอันดับจากสิ่งที่นักท่องเที่ยวจาก{c}ซื้อที่นี่ ระยะทาง และเวลาเปิด", notLaos: "ตอนนี้คุณไม่ได้อยู่ในลาว แผนที่จึงเริ่มที่ตลาดกลางคืนหลวงพระบาง", locating: "กำลังหาตำแหน่ง…", r_loved: "คน{c}ชอบมาก", r_open: "เปิดอยู่", r_closed: "ปิด · เปิด {t}", r_near: "เดินไม่ไกล", r_top: "คะแนนสูง", r_gem: "ร้านลับน่าลอง", r_busy: "วันนี้คึกคัก", fromP: "เริ่ม", c_cn: "จีน", c_th: "ไทย", c_vn: "เวียดนาม", c_kr: "เกาหลี", c_other: "ประเทศของคุณ", cat_food: "อาหาร", cat_souvenir: "งานฝีมือ", cat_drinks: "เครื่องดื่ม", cat_coffee: "กาแฟ", cat_silver: "เครื่องเงิน", hi: "ยินดีต้อนรับสู่ลาว", wallet: "กระเป๋าเงินของคุณ", walletSub: "เดโม: เลือกแอปที่คุณใช้จ่ายที่บ้าน", shops: "ร้านใกล้คุณ", scan: "สแกน QR ของร้าน", words: "พูดภาษาลาว", pay: "จ่าย", payWith: "จ่ายด้วย", kipNote: "ราคาเป็นเงินกีบลาว แอปของคุณจะแสดงเป็นเงินของคุณเมื่อยืนยัน", demo: "เดโมเท่านั้น ไม่มีการตัดเงินจริง", steps: ["กระเป๋าเงินของคุณ", "PhaJay", "ธนาคารร้าน"], paying: "กำลังจ่าย…", thanks: "ขอบคุณ!", paid: "จ่ายเงินแล้ว", shopGot: "ร้านได้รับ", ref: "เลขอ้างอิง", time: "เวลา", back: "กลับไปที่ร้าน", choose: "เลือกสินค้า", total: "รวม", already: "บิลนี้จ่ายแล้ว", expired: "QR หมดอายุ ขอร้านสร้างใหม่", notFound: "ไม่พบรายการ", scanHelp: "เล็งไปที่ QR ของร้าน", noCam: "ใช้กล้องมือถือสแกน QR แล้วจะเปิดที่นี่", other: "จำนวนอื่น", amount: "จำนวน (กีบ)", paidToday: "จ่ายวันนี้" },
    vi: { c_la: "Lào", walk: "Lộ trình đi bộ", walkSub: "{n} điểm · đi bộ {d}", walkGo: "Bắt đầu đi bộ trên Google Maps", map: "Bản đồ cửa hàng", mapSub: "Gợi ý cho bạn trên Google Maps", near: "Gần tôi", all: "Tất cả", dir: "Chỉ đường", menu: "Menu & trả", picks: "Gợi ý cho bạn", why: "Xếp hạng theo những gì khách từ {c} mua ở đây, khoảng cách và giờ mở cửa.", notLaos: "Bạn chưa ở Lào, nên bản đồ bắt đầu ở chợ đêm Luang Prabang.", locating: "Đang tìm vị trí…", r_loved: "Khách {c} rất thích", r_open: "Đang mở", r_closed: "Đã đóng · mở lúc {t}", r_near: "Đi bộ gần", r_top: "Đánh giá cao", r_gem: "Viên ngọc ẩn", r_busy: "Hôm nay đông khách", fromP: "từ", c_cn: "Trung Quốc", c_th: "Thái Lan", c_vn: "Việt Nam", c_kr: "Hàn Quốc", c_other: "nước bạn", cat_food: "Ăn uống", cat_souvenir: "Thủ công", cat_drinks: "Đồ uống", cat_coffee: "Cà phê", cat_silver: "Bạc", hi: "Chào mừng đến Lào", wallet: "Ví của bạn", walletSub: "Demo: chọn ứng dụng bạn dùng ở nhà", shops: "Cửa hàng gần bạn", scan: "Quét QR của cửa hàng", words: "Nói tiếng Lào", pay: "Trả", payWith: "Trả bằng", kipNote: "Giá tính bằng kíp Lào. Ví của bạn sẽ hiển thị bằng tiền của bạn khi xác nhận.", demo: "Chỉ là demo, không trừ tiền thật.", steps: ["Ví của bạn", "PhaJay", "Ngân hàng cửa hàng"], paying: "Đang trả…", thanks: "Cảm ơn!", paid: "Đã thanh toán", shopGot: "Cửa hàng đã nhận", ref: "Mã tham chiếu", time: "Thời gian", back: "Về cửa hàng", choose: "Chọn món", total: "Tổng", already: "Hóa đơn này đã trả", expired: "Mã QR đã hết hạn. Nhờ cửa hàng tạo mã mới.", notFound: "Không tìm thấy", scanHelp: "Hướng vào mã QR của cửa hàng", noCam: "Dùng camera điện thoại để quét QR, nó sẽ mở ở đây.", other: "Số khác", amount: "Số tiền (kíp)", paidToday: "đã trả hôm nay" },
    ko: { c_la: "라오스", walk: "도보 코스", walkSub: "{n}곳 · 도보 {d}", walkGo: "구글 지도에서 걷기 시작", map: "가게 지도", mapSub: "구글 지도에서 추천", near: "내 주변", all: "전체", dir: "길찾기", menu: "메뉴·결제", picks: "추천 가게", why: "{c} 여행자가 이곳에서 사는 것, 거리, 영업시간으로 순위를 매겨요.", notLaos: "지금 라오스에 있지 않아서 루앙프라방 야시장에서 시작해요.", locating: "위치 찾는 중…", r_loved: "{c} 여행자 인기", r_open: "영업 중", r_closed: "영업 종료 · {t} 오픈", r_near: "걸어서 가까움", r_top: "평점 높음", r_gem: "숨은 명소", r_busy: "오늘 붐벼요", fromP: "부터", c_cn: "중국", c_th: "태국", c_vn: "베트남", c_kr: "한국", c_other: "내 나라", cat_food: "음식", cat_souvenir: "공예품", cat_drinks: "음료", cat_coffee: "커피", cat_silver: "은 공예", hi: "라오스에 오신 걸 환영해요", wallet: "내 지갑", walletSub: "데모: 평소 쓰는 결제 앱을 고르세요", shops: "주변 가게", scan: "가게 QR 스캔", words: "라오스어 한마디", pay: "결제", payWith: "결제 수단", kipNote: "가격은 라오스 킵입니다. 확인할 때 지갑 앱이 내 통화로 보여줍니다.", demo: "데모입니다. 실제 돈은 나가지 않아요.", steps: ["내 지갑", "PhaJay", "가게 은행"], paying: "결제 중…", thanks: "감사합니다!", paid: "결제 완료", shopGot: "가게가 받은 금액", ref: "참조 번호", time: "시간", back: "가게 목록으로", choose: "상품 선택", total: "합계", already: "이미 결제된 청구서입니다", expired: "QR이 만료되었어요. 가게에 새로 요청하세요.", notFound: "결제를 찾을 수 없어요", scanHelp: "가게 QR을 비추세요", noCam: "휴대폰 카메라로 QR을 스캔하면 여기서 열려요.", other: "다른 금액", amount: "금액 (킵)", paidToday: "오늘 결제" },
  };
  const LANGS = [["lo", "ລາວ"], ["en", "English"], ["zh", "中文"], ["th", "ไทย"], ["vi", "Tiếng Việt"], ["ko", "한국어"]];
  const KIP = { lo: "ກີບ", en: "kip", zh: "基普", th: "กีบ", vi: "kíp", ko: "킵" };
  const DEF_WALLET = { lo: "laoqr", en: "alipay", zh: "alipay", th: "promptpay", vi: "vietqr", ko: "kakaopay" };
  const WALLETS = ["laoqr", "alipay", "wechat", "unionpay", "promptpay", "vietqr", "kakaopay"];
  const PHRASES = [["ສະບາຍດີ", "sa-bai-dee", { en: "Hello", zh: "你好", th: "สวัสดี", vi: "Xin chào", ko: "안녕하세요" }],
    ["ຂອບໃຈ", "khop jai", { en: "Thank you", zh: "谢谢", th: "ขอบคุณ", vi: "Cảm ơn", ko: "감사합니다" }],
    ["ເທົ່າໃດ?", "tao dai?", { en: "How much?", zh: "多少钱？", th: "เท่าไหร่?", vi: "Bao nhiêu?", ko: "얼마예요?" }],
    ["ແຊບຫຼາຍ", "saep lai", { en: "Delicious!", zh: "很好吃！", th: "อร่อยมาก", vi: "Ngon quá!", ko: "맛있어요!" }],
    ["ບໍ່ເປັນຫຍັງ", "bo pen nyang", { en: "No worries", zh: "没关系", th: "ไม่เป็นไร", vi: "Không sao", ko: "괜찮아요" }]];

  let lang = store.get("t.lang") || "lo"; // Lao first; visitors switch with one tap
  if (!T[lang]) lang = "en";
  let wallet = store.get("t.wallet") || DEF_WALLET[lang];
  const t = (k) => T[lang][k] ?? T.en[k];
  const nameOf = (o) => (lang === "lo" ? o.name_lo : (o.names && (o.names[lang === "ko" ? "en" : lang] || o.names.en)) || o.name_lo);
  const kip = (n) => `<span class="num">${fmt(n)}</span> <span style="color:var(--gold-d);font-weight:800">${KIP[lang]}</span>`;
  // PhaJay's 1.5% is added on top of the price: the tourist pays more, the shop receives the full price.
  const feeOf = (k) => Math.round(Number(k) * 0.015);
  const cat = (c) => CAT[c] || CAT.souvenir;
  const nav = (path) => { history.pushState({}, "", path); render(); };
  window.addEventListener("popstate", () => render());
  document.addEventListener("click", (e) => { const a = e.target.closest("a[data-nav]"); if (a) { e.preventDefault(); nav(a.getAttribute("href")); } });

  function render() {
    const [, a, id] = location.pathname.split("/");
    document.documentElement.lang = lang;
    if (a === "pay" && id) return payView(id);
    if (a === "shop" && id) return shopView(id);
    if (a === "map") return mapView();
    return homeView();
  }

  // ---- Home ----
  async function homeView() {
    app.innerHTML = `<div class="view" style="padding-bottom:30px">
      <div class="t-hero">${scene({ h: 230 })}<div class="hi">${champa(46, { cls: "float" })}<div><div class="lo">ສະບາຍດີ!</div><div class="en">Sabaidee · ${esc(t("hi"))}</div></div></div></div>
      <div class="langs">${LANGS.map(([k, n]) => `<button class="chip ${k === lang ? "on" : ""}" data-l="${k}">${n}</button>`).join("")}</div>
      <div class="card card-x"><div class="row"><b class="grow">${icon("wallet", "g-sm", 'style="display:inline;vertical-align:-3px"')} ${t("wallet")}</b>${walletTile(wallet)}</div>
        <div class="small muted">${t("walletSub")}</div>
        <div class="wgrid">${WALLETS.map((w) => `<button class="wbtn ${w === wallet ? "on" : ""}" data-w="${w}">${walletTile(w)}${WALLET[w].n}</button>`).join("")}</div></div>
      <a class="map-cta" href="/map" data-nav><span class="mc-ic">${icon("map", "g-lg")}</span><div class="grow"><b>${t("map")}</b><span>${t("mapSub")}</span></div><span class="mc-pin">${icon("pin")}</span></a>
      <div style="padding:12px 16px 0"><button class="btn btn-primary btn-block" id="scan">${icon("scan")} ${t("scan")}</button></div>
      <div class="h3">${t("shops")}</div><div class="card" style="margin:0 16px" id="shops"><div class="skeleton" style="height:180px"></div></div>
      <div class="h3">${t("words")}</div>
      <div class="phr">${PHRASES.map(([lo, r, m]) => `<div><div class="l">${lo}</div><div class="r">${r}</div><div class="m">${m[lang] || m.en}</div></div>`).join("")}</div>
      <div class="center small muted" style="margin-top:22px;display:flex;gap:6px;justify-content:center;align-items:center">${champa(18)} Phalom · ${t("demo")}</div></div>`;
    $$("[data-l]").forEach((b) => (b.onclick = () => { lang = b.dataset.l; store.set("t.lang", lang); if (!store.get("t.wallet")) wallet = DEF_WALLET[lang]; render(); }));
    $$("[data-w]").forEach((b) => (b.onclick = () => { wallet = b.dataset.w; store.set("t.wallet", wallet); render(); }));
    $("#scan").onclick = scanQR;
    try {
      const shops = await api("/api/shops");
      $("#shops").innerHTML = shops.slice().reverse().slice(0, 8).map((s) => { const c = cat(s.category); return `<a class="shop" href="/shop/${s.id}" data-nav>
        <span class="ic" style="background:${c.bg};color:${c.c}">${icon(c.g, "g-lg")}</span><div class="grow"><b>${esc(nameOf(s))}</b>${lang === "lo" ? "" : `<div class="lo">${esc(s.name_lo)}</div>`}
        <div class="small muted">${s.rating ? `★ ${s.rating} · ` : ""}${s.paid_today} ${t("paidToday")}</div></div>${icon("next", "g-sm")}</a>`; }).join("");
    } catch (e) { $("#shops").innerHTML = `<div class="small muted" style="padding:16px">—</div>`; }
  }


  // ---- Shop map: Google Maps plus Phalom's own recommendations ----
  const LPB = { lat: 19.8883, lng: 102.1352 }; // Luang Prabang night market
  const MAP = { center: null, cat: "", sel: 0, list: [], note: "" };
  const nat = () => (WALLET[wallet] || {}).nat || { zh: "cn", th: "th", vi: "vn", ko: "kr" }[lang] || "other";
  const country = () => t("c_" + nat()) || t("c_other");
  const CATS = ["food", "souvenir", "drinks", "coffee", "silver"];

  function locate() {
    return new Promise((res) => {
      if (!navigator.geolocation) return res(null);
      navigator.geolocation.getCurrentPosition((p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }), () => res(null), { timeout: 8000, maximumAge: 60000 });
    });
  }

  async function mapView() {
    const qs = new URLSearchParams(location.search);
    if (!MAP.center) MAP.center = { ...LPB };
    app.innerHTML = `<div class="view mapv">${top(t("map"))}
      <div class="map-wrap" id="mw"><div class="skeleton" style="position:absolute;inset:0;border-radius:0"></div></div>
      <div class="map-tools"><button class="chip" id="near">${icon("locate", "g-sm")} ${t("near")}</button>
        <button class="chip ${MAP.cat ? "" : "on"}" data-c="">${t("all")}</button>${CATS.map((c) => `<button class="chip ${MAP.cat === c ? "on" : ""}" data-c="${c}">${icon(CAT[c].g, "g-sm")} ${t("cat_" + c)}</button>`).join("")}</div>
      <div id="mnote"></div>
      <div id="walk"></div>
      <div class="h3">${icon("sparkle", "g-sm")} ${t("picks")}</div>
      <p class="why">${flag(nat(), 18)} ${esc(t("why").replace("{c}", country()))}</p>
      <div class="recs" id="recs"><div class="skeleton" style="height:120px;border-radius:20px"></div><div class="skeleton" style="height:120px;border-radius:20px"></div></div>
      <div class="center small muted" style="margin:18px 0 26px;display:flex;gap:6px;justify-content:center;align-items:center">${champa(16)} Map © Google · Phalom</div></div>`;
    $$("[data-c]").forEach((b) => (b.onclick = () => { MAP.cat = b.dataset.c; MAP.sel = 0; mapView(); }));
    $("#near").onclick = async () => {
      $("#near").innerHTML = `<span class="dots"><i></i><i></i><i></i></span> ${t("locating")}`;
      const me = await locate();
      MAP.note = "";
      if (me) {
        // Far from every shop (not in Laos yet): keep the demo centre and say why.
        const far = Math.abs(me.lat - LPB.lat) > 4 || Math.abs(me.lng - LPB.lng) > 4;
        if (far) { MAP.center = { ...LPB }; MAP.note = t("notLaos"); } else MAP.center = me;
      } else { MAP.center = { ...LPB }; MAP.note = t("notLaos"); }
      MAP.sel = 0; mapView();
    };
    if (MAP.note) $("#mnote").innerHTML = `<div class="note" style="margin:10px 16px 0">${icon("info", "g-sm")}<span>${esc(MAP.note)}</span></div>`;
    try {
      const q = new URLSearchParams({ lat: MAP.center.lat, lng: MAP.center.lng, nat: nat(), limit: 12 });
      if (MAP.cat) q.set("cat", MAP.cat);
      const r = await api(`/api/map/recommend?${q}`);
      MAP.list = r.shops;
      const focus = qs.get("focus"), fi = MAP.list.findIndex((x) => x.id === focus);
      if (fi >= 0) MAP.sel = fi;
      drawRecs();
    } catch (e) { $("#recs").innerHTML = `<div class="small muted" style="padding:16px">—</div>`; }
  }

  const reasonChip = (code, s) => {
    const R = { loved: ["heart", "#C8102E", "#FBE8EA", t("r_loved").replace("{c}", country())], open: ["clock", "#17785A", "#E3F3EC", t("r_open")],
      closed: ["clock", "#8D879E", "#F4EAD7", t("r_closed").replace("{t}", hhmm(s.open_from))], near: ["walk", "#24307A", "#ECEEF8", t("r_near")],
      top: ["star", "#9C6F12", "#FBF1DA", t("r_top")], gem: ["gem", "#6B4FC8", "#EFEAFD", t("r_gem")], busy: ["fire", "#B5531B", "#FCEBDC", t("r_busy")] }[code];
    return R ? `<span class="rchip" style="color:${R[1]};background:${R[2]}">${code === "loved" ? flag(nat(), 14) : icon(R[0], "g-xs")}${esc(R[3])}</span>` : "";
  };

  // A short walk through the best nearby picks, in nearest-next order, handed to
  // Google Maps as one walking route with stops.
  function walkPlan() {
    const near = MAP.list.filter((x) => x.distance_m < 1500).slice(0, 6);
    const pool = (near.filter((x) => x.open).length >= 3 ? near.filter((x) => x.open) : near).slice(0, 4);
    if (pool.length < 2) return "";
    const R = 6371000, d = (a, b) => { const r = Math.PI / 180, x = (b.lng - a.lng) * r * Math.cos(((a.lat + b.lat) / 2) * r), y = (b.lat - a.lat) * r; return Math.hypot(x, y) * R; };
    let at = MAP.center, left = pool.slice(), route = [], total = 0;
    while (left.length) { left.sort((a, b) => d(at, a) - d(at, b)); const n = left.shift(); total += d(at, n); route.push(n); at = n; }
    const ll = (x) => `${x.lat.toFixed(6)},${x.lng.toFixed(6)}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${ll(MAP.center)}&destination=${ll(route[route.length - 1])}&waypoints=${route.slice(0, -1).map(ll).join("|")}&travelmode=walking`;
    const mins = Math.max(5, Math.round((total * 1.25) / 75)); // ~4.5 km/h, streets aren't straight
    const dur = { lo: `${mins} ນາທີ`, en: `${mins} min`, zh: `${mins} 分钟`, th: `${mins} นาที`, vi: `${mins} phút`, ko: `${mins}분` }[lang];
    return `<div class="walk"><div class="walk-h">${icon("walk", "g-lg")}<div class="grow"><b>${t("walk")}</b><span>${esc(t("walkSub").replace("{n}", route.length).replace("{d}", dur))}</span></div></div>
      <ol class="walk-stops">${route.map((x) => { const c = cat(x.category); return `<li><span class="ic" style="background:${c.bg};color:${c.c}">${icon(c.g, "g-sm")}</span><b>${esc(nameOf(x))}</b></li>`; }).join("")}</ol>
      <a class="btn btn-gold btn-block" href="${url}" target="_blank" rel="noopener">${icon("route")} ${t("walkGo")}</a></div>`;
  }

  function drawRecs() {
    const L = MAP.list;
    if ($("#walk")) $("#walk").innerHTML = walkPlan();
    if (!L.length) { $("#mw").innerHTML = gmap.embed(MAP.center.lat, MAP.center.lng, { z: 15, hl: lang }); $("#recs").innerHTML = `<div class="small muted" style="padding:16px">—</div>`; return; }
    const sel = L[Math.min(MAP.sel, L.length - 1)];
    $("#mw").innerHTML = `${gmap.embed(sel.lat, sel.lng, { z: 17, hl: lang, title: nameOf(sel) })}
      <div class="map-tag">${icon(cat(sel.category).g, "g-sm")}<b>${esc(nameOf(sel))}</b><span>${distTxt(sel.distance_m)}</span></div>`;
    $("#recs").innerHTML = L.map((s, i) => { const c = cat(s.category); return `<div class="rec ${i === MAP.sel ? "on" : ""}" data-r="${i}">
        <div class="rec-top"><span class="rank">${i + 1}</span><span class="ic" style="background:${c.bg};color:${c.c}">${icon(c.g, "g-lg")}</span>
          <div class="grow"><b>${esc(nameOf(s))}</b>${lang === "lo" ? "" : `<div class="lo">${esc(s.name_lo)}</div>`}
          <div class="meta">${icon("pin", "g-xs")} ${distTxt(s.distance_m)}${s.rating ? ` · ★ ${s.rating}` : ""}${s.min_price ? ` · ${t("fromP")} ${kip(s.min_price)}` : ""}</div></div></div>
        <div class="rchips">${s.reasons.map((x) => reasonChip(x, s)).join("")}</div>
        <div class="rec-act"><a class="btn btn-ghost" href="${gmap.walk(s.lat, s.lng)}" target="_blank" rel="noopener">${icon("route", "g-sm")} ${t("dir")}</a>
          <a class="btn btn-soft" href="/shop/${s.id}" data-nav>${walletTile(wallet, "sm")} ${t("menu")}</a></div></div>`; }).join("");
    $$("[data-r]").forEach((el) => (el.onclick = (e) => {
      if (e.target.closest("a")) return;
      MAP.sel = Number(el.dataset.r); drawRecs();
      $("#mw").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  // Camera scan with the browser's barcode reader where available.
  async function scanQR() {
    if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) return toast(`${icon("camera")}<b>${t("noCam")}</b>`, 5000);
    const box = document.createElement("div"); box.className = "scan-v";
    box.innerHTML = `<video playsinline muted></video><div class="win">${["0 0", "auto 0 0 auto;transform:scaleX(-1)", "auto auto 0 0;transform:scaleY(-1)", "auto 0 0 auto;transform:scale(-1,-1)"].map((p, i) => `<span style="${["left:0;top:0", "right:0;top:0;transform:scaleX(-1)", "left:0;bottom:0;transform:scaleY(-1)", "right:0;bottom:0;transform:scale(-1,-1)"][i]}">${kanok("#F3D58C")}</span>`).join("")}</div><button class="icon-btn x">${icon("close")}</button><div class="msg">${t("scanHelp")}</div>`;
    document.body.appendChild(box);
    let stream, live = true;
    const stop = () => { live = false; stream && stream.getTracks().forEach((x) => x.stop()); box.remove(); };
    $(".x", box).onclick = stop;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const v = $("video", box); v.srcObject = stream; await v.play();
      const det = new BarcodeDetector({ formats: ["qr_code"] });
      while (live) {
        const codes = await det.detect(v).catch(() => []);
        const hit = codes.map((c) => c.rawValue).find((x) => /\/(pay|shop)\/[0-9a-f-]{36}/i.test(x));
        if (hit) { stop(); return nav(new URL(hit, location.origin).pathname); }
        await sleep(250);
      }
    } catch (e) { stop(); toast(`${icon("camera")}<b>${t("noCam")}</b>`, 5000); }
  }

  const top = (title = "") => `<div class="top"><a class="icon-btn" href="/" data-nav>${icon("back")}</a><b class="grow">${title}</b>${walletTile(wallet)}</div>`;
  const shopHead = (s, c) => `<div class="sicon" style="background:${c.bg};color:${c.c}">${icon(c.g, "g-lg")}</div><h2>${esc(nameOf(s))}</h2><div class="lo">${lang === "lo" ? "" : esc(s.name_lo)}${s.market ? (lang === "lo" ? "" : " · ") + esc(s.market) : ""}</div>`;

  // ---- A payment request from a shop's QR ----
  async function payView(id) {
    app.innerHTML = `<div class="view">${top()}<div class="pay"><div class="skeleton" style="height:360px;border-radius:28px"></div></div></div>`;
    let p;
    try { p = await api(`/api/payments/${id}`); } catch (e) { return msg(t("notFound")); }
    if (p.status === "expired") return msg(t("expired"));
    const s = p.merchant, c = cat(s.category);
    if (p.status === "paid") return receipt(p, s);
    app.innerHTML = `<div class="view">${top()}<div class="pay"><div class="bill">${shopHead(s, c)}
        <div class="amt">${kip(Number(p.amount_kip) + feeOf(p.amount_kip)).replace('class="num"', 'class="num" style="font-size:46px;font-weight:700;color:var(--indigo-d)"')}</div>
        <div class="rc" style="margin-top:12px"><div class="r"><span>${t("price")}</span><b class="num">${fmt(p.amount_kip)} ${KIP[lang]}</b></div>
          <div class="r"><span>${t("feeL")}</span><b class="num">+ ${fmt(feeOf(p.amount_kip))} ${KIP[lang]}</b></div>
          <div class="r"><span><b>${t("totalPay")}</b></span><b class="num" style="font-size:20px;color:var(--indigo-d)">${fmt(Number(p.amount_kip) + feeOf(p.amount_kip))} ${KIP[lang]}</b></div></div>
        <div class="note">${icon("info", "g-sm")}<span>${t("kipNote")}</span></div>
        <div id="route"></div></div>
      <div style="margin-top:16px"><button class="btn btn-gold btn-block" id="go">${walletTile(wallet, "sm")} ${t("payWith")} ${WALLET[wallet].n}</button>
      <p class="small muted center">${icon("shield", "g-sm", 'style="display:inline;vertical-align:-3px"')} ${t("demo")}</p></div></div></div>`;
    $("#go").onclick = () => doPay(() => api(`/api/payments/${id}/simulate`, { method: "POST", body: { wallet } }), s);
  }

  // ---- A shop's own page (static QR on the stall) ----
  async function shopView(id) {
    app.innerHTML = `<div class="view">${top()}<div class="pay"><div class="skeleton" style="height:360px;border-radius:28px"></div></div></div>`;
    let s; try { s = await api(`/api/shops/${id}`); } catch (e) { return msg(t("notFound")); }
    const c = cat(s.category), cart = {};
    let other = 0;
    const total = () => s.menu.reduce((a, it) => a + (cart[it.id] || 0) * it.price_kip, 0) + other;
    const draw = () => {
      app.innerHTML = `<div class="view">${top()}<div class="bill" style="margin:6px 16px 0">${shopHead(s, c)}<div class="sinh-band" style="margin:14px -18px -18px"></div></div>
        <div class="h3">${t("choose")}</div>
        <div class="items">${s.menu.map((it) => `<button class="it" data-it="${it.id}"><span class="sw" style="background:${it.color}">${icon(c.g, "g-lg")}</span><div class="grow"><b>${esc(nameOf(it))}</b>${lang === "lo" ? "" : `<div class="lo">${esc(it.name_lo)}</div>`}</div>${cart[it.id] ? `<span class="q">${cart[it.id]}</span>` : `<span class="p">${fmt(it.price_kip)}</span>`}</button>`).join("")}
          <label class="it" style="cursor:text"><span class="sw" style="background:var(--indigo)">${icon("keypad", "g-lg")}</span><div class="grow"><b>${t("other")}</b><input class="input num" id="oth" inputmode="numeric" placeholder="${t("amount")}" value="${other ? fmt(other) : ""}" style="height:42px;margin-top:4px"></div></label></div>
        <div class="bar"><button class="btn btn-gold btn-block" id="go" ${total() >= 1000 ? "" : "disabled"}>${walletTile(wallet, "sm")} ${t("pay")} ${kip(total())}</button></div></div>`;
      $$("[data-it]").forEach((b) => (b.onclick = () => { cart[b.dataset.it] = (cart[b.dataset.it] || 0) + 1; draw(); }));
      const o = $("#oth");
      o.onchange = () => { other = Number(o.value.replace(/\D/g, "")) || 0; draw(); };
      $("#go").onclick = () => doPay(async () => {
        const p = await api("/api/payments", { method: "POST", body: { merchant_id: s.id, amount_kip: total() } });
        return api(`/api/payments/${p.id}/simulate`, { method: "POST", body: { wallet, from_map: true } });
      }, s);
    };
    draw();
  }

  // Animated route: wallet -> PhaJay -> shop's bank, then the receipt.
  async function doPay(run, shop) {
    const go = $("#go"); go.disabled = true; go.innerHTML = `<span class="dots"><i></i><i></i><i></i></span> ${t("paying")}`;
    const host = $("#route") || $(".bill");
    const steps = t("steps");
    const ics = ["phone", "route", "bank"];
    const r = document.createElement("div"); r.className = "route";
    r.innerHTML = steps.map((s, i) => `<div class="st" data-s="${i}"><span class="ic">${icon(ics[i])}</span>${s}</div>${i < 2 ? `<div class="ln" data-l="${i}"><i></i></div>` : ""}`).join("");
    host.appendChild(r);
    const light = (i) => { $(`[data-s="${i}"]`, r)?.classList.add("on"); $(`[data-l="${i - 1}"]`, r)?.classList.add("on"); };
    light(0);
    const job = run();
    await sleep(650); light(1); await sleep(650); light(2);
    try { const p = await job; await sleep(400); const full = await api(`/api/payments/${p.id}`); receipt(full, full.merchant || shop); }
    catch (e) { toast(`${icon("info")}<b>${esc(e.message)}</b>`); go.disabled = false; go.textContent = t("pay"); r.remove(); }
  }

  function receipt(p, s) {
    const c = cat(s.category);
    app.innerHTML = `<div class="done-t view">${champa(96, { cls: "float" })}<div class="kj">ຂອບໃຈ!</div><div style="font-weight:800;color:var(--ink-2)">khop jai${lang === "lo" ? "" : " · " + t("thanks")}</div>
      <div class="bill" style="margin-top:18px">${shopHead(s, c)}<div class="small muted" style="margin-top:12px;font-weight:700">${t("shopGot")}</div>
        <div class="amt" style="margin-top:2px">${kip(p.amount_kip).replace('class="num"', 'class="num" style="font-size:40px;font-weight:700"')}</div>
        <div class="rc"><div class="r"><span>${t("payWith")}</span><b>${walletTile(p.wallet, "sm")} ${(WALLET[p.wallet] || {}).n || ""}</b></div>
          <div class="r"><span>${t("time")}</span><b class="num">${timeLo(p.paid_at)}</b></div>
          <div class="r"><span>${t("ref")}</span><b class="num" style="font-size:13px">${esc(p.reference)}</b></div></div>
        <div class="sinh-band" style="margin:10px -18px -18px"></div></div>
      <div style="margin-top:18px"><a class="btn btn-ghost btn-block" href="/" data-nav>${icon("shop")} ${t("back")}</a></div></div>`;
    petals();
  }

  function msg(text) {
    app.innerHTML = `<div class="view">${top()}<div class="pay center" style="padding-top:40px">${G.elephant(150)}<h2>${esc(text)}</h2><a class="btn btn-ghost" href="/" data-nav>${t("back")}</a></div></div>`;
  }

  render();
})();
