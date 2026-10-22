// Phalom merchant app. Plain Lao for the shop owner; Lao kip only.
(function () {
  const { $, $$, fmt, esc, api, WALLET, walletTile, NAT_LO, timeLo, dateLo, dayShortLo, ymdVte, chime, speakKip, qrSvg, petals, countUp, toast, sheet, store, sleep, gmap, hhmm } = window.Phalom;
  const { icon, CAT, champa, logo, kanok, flag, scene, elephant } = window.G;
  const app = $("#app");

  const S = {
    cfg: null, mid: store.get("phalom.mid"), merchant: null, dash: null, hist: null, menu: null,
    seen: new Set(), handled: new Set(), payments: {},
    sound: store.get("phalom.sound", true), voice: store.get("phalom.voice", true),
    charge: { str: "", cart: {}, mode: "keys" },
  };

  const MARKETS = ["ຕະຫຼາດກາງຄືນ ຫຼວງພະບາງ", "ຕະຫຼາດກາງຄືນ ນະຄອນຫຼວງວຽງຈັນ", "ຕະຫຼາດເຊົ້າ ວຽງຈັນ", "ວັງວຽງ", "ປາກເຊ / ວັດພູ", "ບ່ອນອື່ນ"];
  // Where each market is, so a new shop shows up on the tourist map straight away.
  const MARKET_LL = { [MARKETS[0]]: [19.8883, 102.1352], [MARKETS[1]]: [17.9622, 102.6058], [MARKETS[2]]: [17.9662, 102.6132], [MARKETS[3]]: [18.9229, 102.4463], [MARKETS[4]]: [15.1203, 105.8131], [MARKETS[5]]: [19.8883, 102.1352] };
  const BANKS = ["BCEL", "LDB", "APB", "JDB", "LVB", "BFL", "ST Bank"];
  const kipShort = (n) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + "ລ້ານ" : Math.round(n / 1000) + "ພັນ");
  const trBadge = (lang) => (lang === "en" ? '<span class="tag" style="background:#ECEEF8;color:#24307A">EN</span>' : flag({ zh: "cn", th: "th", vi: "vn", ko: "kr" }[lang] || "other", 20));
  const cat = (c) => CAT[c] || CAT.souvenir;

  // ---------------------------------------------------------------- data
  async function loadAll() {
    const [m, d, h, menu] = await Promise.all([
      api(`/api/merchants/${S.mid}`), api(`/api/merchants/${S.mid}/dashboard`),
      api(`/api/merchants/${S.mid}/history?days=7`), api(`/api/merchants/${S.mid}/menu`),
    ]);
    S.merchant = m; S.dash = d; S.hist = h; S.menu = menu;
    h.items.forEach((x) => S.seen.add(x.id));
  }

  // Watch for money arriving (from any QR: this phone's, the shop poster, or the tourist app).
  let pollBusy = false;
  async function poll() {
    if (!S.mid || pollBusy || document.hidden) return;
    pollBusy = true;
    try {
      const h = await api(`/api/merchants/${S.mid}/history?days=7`);
      const fresh = h.items.filter((x) => !S.seen.has(x.id));
      S.hist = h; fresh.forEach((x) => S.seen.add(x.id));
      S.dash = await api(`/api/merchants/${S.mid}/dashboard`);
      for (const p of fresh.reverse()) {
        if (S.handled.has(p.id)) continue;
        S.handled.add(p.id);
        announce(p);
      }
      if (fresh.length && ["home", "history"].includes(route().name)) render(true);
    } catch (e) { /* offline: try again next tick */ }
    pollBusy = false;
  }
  setInterval(poll, 4000);

  function announce(p) {
    if (S.sound) chime("paid");
    if (S.voice) speakKip(p.amount_kip, p.id);
    if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
    toast(`${walletTile(p.wallet)}<div class="grow"><b style="display:block">ໄດ້ຮັບເງິນ <span class="num">${fmt(p.amount_kip)}</span> ກີບ</b><span class="small muted">ລູກຄ້າຈາກ${NAT_LO[p.nationality] || "ຕ່າງປະເທດ"} · ${(WALLET[p.wallet] || {}).n || ""}${p.from_map ? " · ຈາກປ້າຍ QR ຮ້ານ" : ""}</span></div>${flag(p.nationality || "other", 30)}`);
  }

  // ---------------------------------------------------------------- router
  function route() {
    const [name = "home", arg] = location.hash.replace(/^#\/?/, "").split("/");
    return { name, arg };
  }
  const go = (h) => { if (location.hash === h) render(); else location.hash = h; };
  window.addEventListener("hashchange", () => render());

  async function render(soft = false) {
    const r = route();
    if (!S.mid && !["welcome", "register"].includes(r.name)) return go("#/welcome");
    if (S.mid && r.name === "welcome") return go("#/home");
    if (r.name !== "map" && !soft) S.map = null; // refresh map facts on the next visit
    if (S.mid && !S.merchant && !["welcome", "register"].includes(r.name)) {
      app.innerHTML = `<div class="page" style="display:grid;place-items:center;min-height:100dvh"><div class="center">${logo(84)}<div class="dots" style="color:var(--indigo);margin-top:18px"><i></i><i></i><i></i></div></div></div>`;
      try { await loadAll(); } catch (e) {
        if (e.status === 404 || e.status === 400) { store.del("phalom.mid"); S.mid = null; return go("#/welcome"); }
        app.innerHTML = offline(); $("#retry").onclick = () => render(); return;
      }
    }
    const view = VIEWS[r.name] || VIEWS.home;
    const y = soft ? window.scrollY : 0;
    app.innerHTML = view.html(r.arg);
    if (!soft) app.firstElementChild?.classList.add("view");
    view.mount && view.mount(r.arg);
    window.scrollTo(0, y);
  }

  const offline = () => `<div class="page center" style="padding-top:120px">${elephant(160)}<h2>ເຊື່ອມຕໍ່ອິນເຕີເນັດບໍ່ໄດ້</h2><p class="muted">ກວດເບິ່ງສັນຍານ ແລ້ວລອງໃໝ່</p><button class="btn btn-primary" id="retry">ລອງໃໝ່</button></div>`;

  const tabbar = (on) => {
    const t = (name, ic, label) => `<a class="tab ${on === name ? "on" : ""}" href="#/${name}">${icon(ic)}<span>${label}</span><i class="pip"></i></a>`;
    const m = S.merchant || {};
    return `<nav class="tabbar no-print"><div class="side-brand">${logo(44, 0.28)}<div><b>ພະລົມ</b><span>PHALOM</span></div></div>
      ${t("home", "home", "ໜ້າຫຼັກ")}${t("history", "leaf", "ປະຫວັດ")}
      <a class="tab-fab" href="#/charge"><span class="ring">${icon("qr")}</span>ຮັບເງິນ</a>
      ${t("items", "basket", "ສິນຄ້າ")}<span class="side-only">${t("map", "map", "ແຜນທີ່ຮ້ານ")}${t("poster", "print", "ປ້າຍ QR")}</span>${t("me", "shop", "ຮ້ານຂອງຂ້ອຍ")}
      <div class="side-foot side-only"><div class="sinh-band thin"></div><b class="ellipsis">${esc(m.name_lo || "")}</b><span>${icon("shield", "g-xs")} ${esc(m.bank || "")} •••• ${esc(m.account_last4 || "")}</span></div></nav>`;
  };
  const headBar = (title, back = "#/home", right = "") => `<div class="head-bar"><a class="icon-btn" href="${back}" aria-label="ກັບຄືນ">${icon("back")}</a><h1>${title}</h1>${right}</div>`;

  function greeting() {
    const h = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Vientiane" }));
    return h < 4 || h >= 21 ? "ສະບາຍດີ" : h < 11 ? "ສະບາຍດີຕອນເຊົ້າ" : h < 17 ? "ສະບາຍດີຕອນສວາຍ" : "ສະບາຍດີຕອນແລງ";
  }

  // Sparkline of the last 7 days for the today card.
  function spark(days) {
    const W = 400, H = 66, max = Math.max(1, ...days.map((d) => d.kip));
    const pts = days.map((d, i) => [(i / (days.length - 1)) * W, H - 10 - (d.kip / max) * (H - 22)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const last = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true">
      <defs><linearGradient id="spk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3D58C" stop-opacity=".45"/><stop offset="1" stop-color="#F3D58C" stop-opacity="0"/></linearGradient></defs>
      <path d="${line} L${W} ${H} L0 ${H}Z" fill="url(#spk)"/><path d="${line}" fill="none" stroke="#F3D58C" stroke-width="2.4" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
      <circle cx="${last[0] - 4}" cy="${last[1]}" r="5" fill="#F3D58C" stroke="#161F57" stroke-width="2"/></svg>`;
  }

  // PhaJay's 1.5% is added to what the tourist pays; the shop receives the full price (100,000 → tourist pays 101,500).
  const feeOf = (k) => Math.round(Number(k) * 0.015);
  const feeLines = (price, fee) => `<div class="fee-lines">
      <div class="r"><span>ລູກຄ້າຈ່າຍທັງໝົດ</span><b class="num">${fmt(price + fee)} ກີບ</b></div>
      <div class="r fee"><span>ຄ່າທຳນຽມ PhaJay 1.5% (ລູກຄ້າຈ່າຍ)</span><b class="num">${fmt(fee)} ກີບ</b></div>
      <div class="r net"><span>ເງິນເຂົ້າບັນຊີຮ້ານເຕັມ 100%</span><b class="num">${fmt(price)} ກີບ</b></div></div>`;

  function txRow(p, isNew) {
    return `<div class="tx ${isNew ? "new" : ""}">${walletTile(p.wallet)}<div class="grow"><div class="who">${flag(p.nationality || "other", 20)} ${NAT_LO[p.nationality] || "ອື່ນໆ"} <span class="muted small" style="font-weight:600">· ${(WALLET[p.wallet] || {}).n || ""}</span></div>
      <div class="when">${timeLo(p.paid_at)}${p.from_map ? ' · <span class="tag">ປ້າຍ QR ຮ້ານ</span>' : ""}</div></div>
      <div class="amt num">+${fmt(p.amount_kip)}<small>ກີບ</small><div class="net-sm">ເຂົ້າບັນຊີເຕັມ</div></div></div>`;
  }

  // ---------------------------------------------------------------- views
  const VIEWS = {};

  VIEWS.welcome = {
    html: () => `<div class="welcome">
      <div class="hero"><div class="hero-sky">${champa(150, { cls: "float" })}<div class="display">ສະບາຍດີ</div><span>Sabaidee · ແອັບຮັບເງິນຂອງແມ່ຄ້າລາວ</span></div>${scene({ h: 250 })}</div>
      <div class="brand"><div class="lg">${logo(92, 0.26)}</div><div><h1>ພະລົມ</h1><div style="font-weight:800;color:var(--gold-d);letter-spacing:.18em;font-size:13px;font-family:var(--font-num)">PHALOM</div></div></div>
      <p class="tagline">ນັກທ່ອງທ່ຽວຈ່າຍແບບບ້ານເຂົາ<br><b>ແມ່ຄ້າຮັບເງິນກີບແບບບ້ານເຮົາ</b></p>
      <div style="margin-top:14px">
        <div class="feat"><span class="ic" style="background:var(--indigo-50);color:var(--indigo)">${icon("scan")}</span><div>ລູກຄ້າສະແກນດ້ວຍ Alipay, WeChat Pay, PromptPay, VietQR</div></div>
        <div class="feat"><span class="ic" style="background:var(--jade-50);color:var(--jade)">${icon("bank")}</span><div>ເງິນກີບເຂົ້າບັນຊີທະນາຄານຂອງທ່ານທັນທີ</div></div>
        <div class="feat"><span class="ic" style="background:#EFEAFD;color:#6B4FC8">${icon("sparkle")}</span><div>ຊື່ຮ້ານ ແລະ ສິນຄ້າ ແປເປັນ 4 ພາສາໃຫ້ເອງ</div></div>
      </div>
      <div class="actions"><a class="btn btn-primary btn-block" href="#/register">${icon("shop")} ເປີດຮ້ານໃນ Phalom</a>
        <button class="btn btn-ghost btn-block" id="demo">${icon("textile")} ລອງໃຊ້ຮ້ານຕົວຢ່າງ (ຮ້ານຜ້າທໍແມ່ຄຳ)</button></div></div>`,
    mount() {
      $("#demo").onclick = async () => {
        $("#demo").innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
        S.cfg = S.cfg || (await api("/api/config"));
        S.mid = S.cfg.demoMerchantId; store.set("phalom.mid", S.mid); S.merchant = null;
        go("#/home");
      };
    },
  };

  const reg = { name: "", category: "souvenir", market: MARKETS[0], bank: "BCEL", last4: "", phone: "" };
  VIEWS.register = {
    html: () => {
      const done = [reg.name.trim(), reg.category, reg.bank && /^\d{4}$/.test(reg.last4)].filter(Boolean).length;
      return `<div class="page no-tabs">${headBar("ເປີດຮ້ານໃໝ່", "#/welcome")}
      <div class="steps">${[0, 1, 2].map((i) => `<i class="${i < done ? "on" : ""}"></i>`).join("")}</div>
      <div class="form-wrap">
        <h2>ຮ້ານຂອງທ່ານຊື່ຫຍັງ?</h2><p class="lead">ຂຽນເປັນພາສາລາວ, ລະບົບຈະແປໃຫ້ນັກທ່ອງທ່ຽວອ່ານໄດ້ເອງ.</p>
        <label class="field"><span>ຊື່ຮ້ານ</span><input class="input" id="r-name" maxlength="60" placeholder="ເຊັ່ນ: ຮ້ານຜ້າໄໝ ແມ່ບົວ" value="${esc(reg.name)}"></label>
        <div class="field"><span>ຂາຍຫຍັງ?</span><div class="pick-grid">${Object.entries(CAT).filter(([k]) => k !== "coffee").map(([k, c]) => `<button class="pick ${reg.category === k ? "on" : ""}" data-cat="${k}"><span class="ic" style="background:${c.bg};color:${c.c}">${icon(c.g)}</span>${c.lo}</button>`).join("")}</div></div>
        <div class="field"><span>ຮ້ານຢູ່ໃສ?</span><div class="chips">${MARKETS.map((m) => `<button class="chip ${reg.market === m ? "on" : ""}" data-mk="${esc(m)}">${m}</button>`).join("")}</div></div>
        <h2 style="margin-top:26px">ເງິນເຂົ້າບັນຊີໃດ?</h2><p class="lead">ເງິນຈາກລູກຄ້າເຂົ້າບັນຊີນີ້ໂດຍກົງ. Phalom ບໍ່ຖືເງິນຂອງທ່ານ.</p>
        <div class="field"><span>ທະນາຄານ</span><div class="chips">${BANKS.map((b) => `<button class="chip ${reg.bank === b ? "on" : ""}" data-bk="${b}">${icon("bank", "g-sm")}${b}</button>`).join("")}</div></div>
        <label class="field"><span>4 ໂຕທ້າຍຂອງເລກບັນຊີ</span><input class="input num" id="r-last4" inputmode="numeric" maxlength="4" placeholder="• • • •" value="${esc(reg.last4)}" style="letter-spacing:.4em;font-size:22px"></label>
        <label class="field"><span>ເບີໂທ (ບໍ່ບັງຄັບ)</span><input class="input num" id="r-phone" inputmode="tel" maxlength="16" placeholder="020 xxxx xxxx" value="${esc(reg.phone)}"></label>
        <button class="btn btn-primary btn-block" id="r-go" style="margin-top:6px">${icon("check")} ເປີດຮ້ານ</button>
        <p class="small muted center" style="margin-top:12px">${icon("shield", "g-sm", 'style="display:inline;vertical-align:-3px"')} ການຈ່າຍເງິນໃນແອັບນີ້ເປັນການສາທິດ, ບໍ່ມີເງິນຈິງເຄື່ອນໄຫວ</p>
      </div></div>`;
    },
    mount() {
      const keep = () => { reg.name = $("#r-name").value; reg.last4 = $("#r-last4").value.replace(/\D/g, ""); reg.phone = $("#r-phone").value; };
      const rerender = () => { keep(); render(true); };
      $$("[data-cat]").forEach((b) => (b.onclick = () => { reg.category = b.dataset.cat; rerender(); }));
      $$("[data-mk]").forEach((b) => (b.onclick = () => { reg.market = b.dataset.mk; rerender(); }));
      $$("[data-bk]").forEach((b) => (b.onclick = () => { reg.bank = b.dataset.bk; rerender(); }));
      ["#r-name", "#r-last4", "#r-phone"].forEach((s) => $(s).addEventListener("change", rerender));
      $("#r-go").onclick = async () => {
        keep();
        if (!reg.name.trim()) { $("#r-name").focus(); return toast(`${icon("info")}<b>ກະລຸນາຂຽນຊື່ຮ້ານ</b>`, 2500); }
        if (!/^\d{4}$/.test(reg.last4)) { $("#r-last4").focus(); return toast(`${icon("info")}<b>ກະລຸນາໃສ່ 4 ໂຕທ້າຍຂອງເລກບັນຊີ</b>`, 2500); }
        $("#r-go").innerHTML = `<span class="dots"><i></i><i></i><i></i></span> ກຳລັງເປີດຮ້ານ ແລະ ແປຊື່...`; $("#r-go").disabled = true;
        try {
          const m = await api("/api/merchants", { method: "POST", body: { name_lo: reg.name.trim(), category: reg.category, market: reg.market, bank: reg.bank, account_last4: reg.last4, phone: reg.phone || null } });
          S.mid = m.id; store.set("phalom.mid", m.id); S.merchant = null; S.seen.clear();
          const [la, ln] = MARKET_LL[reg.market] || MARKET_LL[MARKETS[0]];
          const j = () => (Math.random() - 0.5) * 0.002; // ~100 m, so shops in one market don't sit on one pin
          await api(`/api/merchants/${m.id}/location`, { method: "PUT", body: { lat: la + j(), lng: ln + j() } }).catch(() => {});
          await loadAll();
          go("#/home");
          setTimeout(() => welcomeSheet(m), 400);
        } catch (e) { toast(`${icon("info")}<b>ເປີດຮ້ານບໍ່ສຳເລັດ, ລອງໃໝ່</b>`); $("#r-go").disabled = false; $("#r-go").textContent = "ເປີດຮ້ານ"; }
      };
    },
  };

  function welcomeSheet(m) {
    petals(18); if (S.sound) chime("paid");
    const names = Object.entries(m.names || {});
    sheet(`<div class="center">${champa(64)}<h2 style="margin:6px 0 2px">ຍິນດີຕ້ອນຮັບ, ${esc(m.name_lo)}!</h2><p class="muted" style="margin:0 0 14px">ຮ້ານຂອງທ່ານພ້ອມຮັບເງິນແລ້ວ</p></div>
      ${names.length ? `<div class="card card-pad"><div class="row" style="margin-bottom:8px"><span class="ai-badge">${icon("sparkle")} AI ແປໃຫ້</span><span class="small muted">ນັກທ່ອງທ່ຽວຈະເຫັນຊື່ຮ້ານແບບນີ້</span></div>
        ${names.map(([l, t]) => `<div class="row" style="padding:6px 0">${trBadge(l)}<b>${esc(t)}</b></div>`).join("")}</div>` : ""}
      <button class="btn btn-gold btn-block" style="margin-top:16px" id="ws-go">${icon("qr")} ຮັບເງິນຄັ້ງທຳອິດ</button>`, (sh, close) => { $("#ws-go", sh).onclick = () => { close(); go("#/charge"); }; });
  }

  VIEWS.home = {
    html: () => {
      const m = S.merchant, d = S.dash, h = S.hist, c = cat(m.category);
      const foreignPct = d.total_kip ? Math.round((d.foreign_kip / d.total_kip) * 100) : 0;
      const nat = d.by_nationality || [], natMax = Math.max(1, ...nat.map((x) => x.kip));
      const recent = h.items.slice(0, 5);
      return `<div class="page">
      <div class="topbar"><div class="avatar" style="background:${c.bg};color:${c.c}">${icon(c.g)}</div>
        <div class="grow"><div class="sub">${greeting()} 🙏</div><h1 class="ellipsis">${esc(m.name_lo)}</h1></div>
        <button class="icon-btn" id="snd" aria-label="ສຽງ">${icon(S.sound ? "sound" : "mute")}</button></div>
      <div class="dash"><div class="dash-a">
      <section class="today">
        <div class="champa-deco">${champa(150, { petal: "#ffffff", edge: "#ffffff" })}</div>
        <div class="label">${icon("chart", "g-sm")} ຍອດຂາຍມື້ນີ້ <span class="live"><i></i>ສົດ</span></div>
        <div class="big"><span class="num" id="today-kip" data-v="0">0</span><span class="cur">ກີບ</span></div>
        <div class="meta"><span><b>${d.count}</b> ລາຍການ</span><span>ຈາກນັກທ່ອງທ່ຽວ <b>${foreignPct}%</b></span></div>
        <div class="spark">${spark(h.days)}</div>
        <div class="sinh-band"></div>
      </section>
      <button class="charge-cta" onclick="location.hash='#/charge'"><span class="ic">${icon("qr")}</span><div class="grow"><b>ຮັບເງິນ</b><span>ພິມຈຳນວນ ຫຼື ເລືອກສິນຄ້າ ແລ້ວໃຫ້ລູກຄ້າສະແກນ</span></div>${icon("next")}</button>
      <div class="tiles">
        <a class="tile" href="#/poster"><span class="ic" style="background:var(--red-50);color:var(--red)">${icon("print")}</span>ປ້າຍ QR<br>ຂອງຮ້ານ</a>
        <a class="tile" href="#/items"><span class="ic" style="background:var(--gold-50);color:var(--gold-d)">${icon("basket")}</span>ລາຍການ<br>ສິນຄ້າ</a>
        <a class="tile" href="#/map"><span class="ic" style="background:var(--indigo-50);color:var(--indigo)">${icon("map")}</span>ແຜນທີ່<br>ຮ້ານ</a>
        <a class="tile" href="#/me"><span class="ic" style="background:var(--jade-50);color:var(--jade)">${icon("bank")}</span>ບັນຊີ<br>ຮັບເງິນ</a>
      </div>
      </div><div class="dash-b">
      <div class="section-title"><h3>ລູກຄ້າມື້ນີ້ມາຈາກໃສ</h3></div>
      <div class="card nat-list">${nat.length ? nat.map((x, i) => `<div class="nat-row">${flag(x.nationality, 26)}<span>${NAT_LO[x.nationality] || "ອື່ນໆ"}</span><span class="bar"><i style="width:${Math.max(6, (x.kip / natMax) * 100)}%;animation-delay:${i * 0.08}s"></i></span><span class="num">${fmt(x.kip)}</span></div>`).join("") : `<div class="empty small">ຍັງບໍ່ມີລູກຄ້າມື້ນີ້</div>`}</div>
      <div class="section-title"><h3>ເງິນເຂົ້າລ່າສຸດ</h3><a href="#/history">ເບິ່ງທັງໝົດ</a></div>
      <div class="card tx-list">${recent.length ? recent.map((p) => txRow(p)).join("") : `<div class="empty">${elephant(130)}<b>ຍັງບໍ່ມີການຂາຍ</b><div class="small">ກົດ “ຮັບເງິນ” ເພື່ອເລີ່ມ</div></div>`}</div>
      </div></div>
      <div class="center small muted" style="margin:26px 0 0;display:flex;justify-content:center;align-items:center;gap:6px">${icon("shield", "g-sm")} ເງິນເຂົ້າ ${esc(m.bank)} •••• ${esc(m.account_last4)} ໂດຍກົງ</div>
      </div>${tabbar("home")}`;
    },
    mount() {
      countUp($("#today-kip"), S.dash.total_kip, 1000);
      $("#snd").onclick = () => { S.sound = !S.sound; store.set("phalom.sound", S.sound); if (S.sound) chime("paid"); render(true); };
    },
  };

  // ---- Charge: keypad or pick items ----
  const chargeAmount = () => {
    const C = S.charge;
    if (C.mode === "items") return Object.entries(C.cart).reduce((s, [id, q]) => s + (S.menu.find((i) => i.id === id)?.price_kip || 0) * q, 0);
    return Number(C.str || 0);
  };
  VIEWS.charge = {
    html: () => {
      const C = S.charge, amt = chargeAmount();
      const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"];
      const body = C.mode === "keys"
        ? `<div class="quick">${[10000, 20000, 50000, 100000, 200000].map((v) => `<button class="chip" data-q="${v}">${fmt(v)}</button>`).join("")}</div>
           <div class="keypad">${keys.map((k) => `<button class="key ${k === "⌫" ? "fn" : ""}" data-k="${k}">${k === "⌫" ? icon("backspace") : k}</button>`).join("")}</div>`
        : (S.menu.length ? `<div class="items-pick">${S.menu.map((it) => { const q = C.cart[it.id] || 0; return `<button class="ipick" data-it="${it.id}"><div class="sw" style="background:${it.color}">${icon(cat(S.merchant.category).g, "g-lg")}${q ? `<span class="qty">${q}</span><span class="minus" data-minus="${it.id}">${icon("minus", "g-sm")}</span>` : ""}</div><div class="t"><b>${esc(it.name_lo)}</b><span>${fmt(it.price_kip)} ກີບ</span></div></button>`; }).join("")}</div>`
          : `<div class="empty">${icon("basket", "g-lg")}<p>ຍັງບໍ່ມີສິນຄ້າ</p><a class="btn btn-soft" href="#/items">ເພີ່ມສິນຄ້າ</a></div>`);
      return `<div class="page no-tabs">${headBar("ຮັບເງິນ")}
        <div class="amount-box"><div class="hint">ຈຳນວນເງິນທີ່ຈະຮັບ</div><div class="val"><span class="num ${amt ? "" : "zero"}" id="amt">${fmt(amt)}</span><span class="cur">ກີບ</span></div>
          <div class="hint">${amt && amt < 1000 ? "ຢ່າງໜ້ອຍ 1,000 ກີບ" : "ລູກຄ້າຈ່າຍດ້ວຍແອັບຂອງເຂົາ, ທ່ານໄດ້ຮັບເປັນເງິນກີບ"}</div></div>
        <div class="seg"><button data-mode="keys" class="${C.mode === "keys" ? "on" : ""}">${icon("keypad", "g-sm")} ພິມຈຳນວນ</button><button data-mode="items" class="${C.mode === "items" ? "on" : ""}">${icon("basket", "g-sm")} ເລືອກສິນຄ້າ</button></div>
        ${body}
        <div class="charge-go"><button class="btn btn-gold btn-block" id="mk" ${amt >= 1000 ? "" : "disabled"}>${icon("qr")} ສ້າງ QR ຮັບເງິນ</button></div></div>`;
    },
    mount() {
      const C = S.charge;
      $$("[data-mode]").forEach((b) => (b.onclick = () => { C.mode = b.dataset.mode; render(true); }));
      $$("[data-q]").forEach((b) => (b.onclick = () => { C.str = b.dataset.q; render(true); }));
      $$("[data-k]").forEach((b) => (b.onclick = () => {
        const k = b.dataset.k;
        if (k === "⌫") C.str = C.str.slice(0, -1);
        else if ((C.str + k).replace(/^0+/, "").length <= 9) C.str = (C.str + k).replace(/^0+/, "");
        render(true);
      }));
      $$("[data-it]").forEach((b) => (b.onclick = (e) => {
        const minus = e.target.closest("[data-minus]");
        const id = b.dataset.it;
        C.cart[id] = Math.max(0, (C.cart[id] || 0) + (minus ? -1 : 1));
        if (!C.cart[id]) delete C.cart[id];
        render(true);
      }));
      $("#mk").onclick = async () => {
        const amount = chargeAmount(); if (amount < 1000) return;
        $("#mk").disabled = true; $("#mk").innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
        try {
          const p = await api("/api/payments", { method: "POST", body: { merchant_id: S.mid, amount_kip: amount } });
          S.payments[p.id] = p; C.str = ""; C.cart = {};
          go(`#/qr/${p.id}`);
        } catch (e) { toast(`${icon("info")}<b>ສ້າງ QR ບໍ່ສຳເລັດ, ລອງໃໝ່</b>`); render(true); }
      };
    },
  };

  // ---- QR shown to the customer ----
  let qrTimer = null;
  VIEWS.qr = {
    html: (pid) => {
      const p = S.payments[pid], m = S.merchant;
      if (!p) return `<div class="page">${headBar("ຮັບເງິນ", "#/charge")}<div class="empty">ບໍ່ພົບ QR ນີ້</div></div>`;
      const en = m.names?.en, zh = m.names?.zh;
      return `<div class="qr-page page no-tabs">${headBar("ໃຫ້ລູກຄ້າສະແກນ", "#/charge", `<button class="icon-btn" id="share" aria-label="ສົ່ງລິ້ງ">${icon("share")}</button>`)}
        <div class="qr-card"><div class="shop">${esc(m.name_lo)}</div><div class="shop-sub">${esc([en, zh].filter(Boolean).join(" · "))}</div>
          <div class="qr-frame">${["tl", "tr", "bl", "br"].map((k) => `<span class="k ${k}">${kanok()}</span>`).join("")}<div class="q">${qrSvg(p.pay_url, { logo: true })}</div><span class="scanline"></span></div>
          <div class="qr-amt"><span class="num">${fmt(p.amount_kip)}</span><span class="cur">ກີບ</span></div>
          <div class="scan-say"><span>ສະແກນຈ່າຍ</span> · <span>扫码付款</span> · <span>สแกนเพื่อจ่าย</span> · <span>Quét mã để trả</span> · <span>Scan to pay</span></div>
          <div class="wallets">${["alipay", "wechat", "unionpay", "promptpay", "vietqr", "kakaopay", "laoqr"].map((w) => `<span class="wallet-chip">${walletTile(w, "sm")}${WALLET[w].n}</span>`).join("")}</div>
        </div>
        <div class="waiting" id="wait"><span class="dots"><i></i><i></i><i></i></span> ລໍຖ້າລູກຄ້າຈ່າຍ... <span class="timer" id="tm">0:00</span></div>
        <div style="padding:14px 20px 0;display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <a class="btn btn-ghost" href="#/charge">${icon("close")} ຍົກເລີກ</a>
          <a class="btn btn-soft" href="${esc(p.pay_url)}" target="_blank" rel="noopener">${icon("phone")} ທົດລອງຈ່າຍ</a></div>
        <p class="small muted center" style="margin:12px 24px 0">ເມື່ອລູກຄ້າຈ່າຍແລ້ວ ໂທລະສັບຈະມີສຽງ ແລະ ບອກຈຳນວນເງິນ</p></div>`;
    },
    mount(pid) {
      const p = S.payments[pid]; if (!p) return;
      clearInterval(qrTimer);
      const t0 = Date.now();
      $("#share").onclick = async () => {
        try { if (navigator.share) await navigator.share({ title: S.merchant.name_lo, text: `${fmt(p.amount_kip)} ກີບ`, url: p.pay_url }); else { await navigator.clipboard.writeText(p.pay_url); toast(`${icon("copy")}<b>ກັອບປີ້ລິ້ງແລ້ວ</b>`, 2000); } } catch (e) {}
      };
      let busy = false;
      qrTimer = setInterval(async () => {
        if (route().name !== "qr" || route().arg !== pid) return clearInterval(qrTimer);
        const s = Math.floor((Date.now() - t0) / 1000), tm = $("#tm"); if (tm) tm.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
        if (busy) return; busy = true;
        try {
          const x = await api(`/api/payments/${pid}`);
          if (x.status === "paid") {
            clearInterval(qrTimer); S.payments[pid] = x; S.handled.add(pid); S.seen.add(pid);
            if (S.sound) chime("paid"); if (S.voice) speakKip(x.amount_kip, x.id);
            if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
            go(`#/done/${pid}`);
            api(`/api/merchants/${S.mid}/dashboard`).then((d) => (S.dash = d)).catch(() => {});
            api(`/api/merchants/${S.mid}/history?days=7`).then((h) => (S.hist = h)).catch(() => {});
          } else if (x.status === "expired") {
            clearInterval(qrTimer); $("#wait").innerHTML = `${icon("clock")} QR ນີ້ໝົດອາຍຸແລ້ວ <a href="#/charge" style="margin-left:auto;font-weight:800">ສ້າງໃໝ່</a>`;
          }
        } catch (e) {}
        busy = false;
      }, 1500);
    },
  };

  VIEWS.done = {
    html: (pid) => {
      const p = S.payments[pid], m = S.merchant;
      if (!p) return `<div class="page">${headBar("ຮັບເງິນ")}<div class="empty">—</div></div>`;
      return `<div class="done"><div class="seal"><div class="rot">${champa(150, { petal: "#D3EEE1", edge: "#8FD0B2", heart: "#5DBB93" })}</div><div class="core">${icon("check")}</div></div>
        <h2>ໄດ້ຮັບເງິນແລ້ວ</h2>
        <div class="amt"><span class="num" id="done-amt" data-v="0">0</span><span class="cur">ກີບ</span></div>
        <div class="card receipt">
          ${feeLines(Number(p.amount_kip), feeOf(p.amount_kip))}
          <div class="r"><span>ລູກຄ້າຈາກ</span><b>${flag(p.nationality || "other", 22)} ${NAT_LO[p.nationality] || "ອື່ນໆ"}</b></div>
          <div class="r"><span>ຈ່າຍດ້ວຍ</span><b>${walletTile(p.wallet, "sm")} ${(WALLET[p.wallet] || {}).n || ""}</b></div>
          <div class="r"><span>ເງິນເຂົ້າບັນຊີ</span><b>${icon("bank", "g-sm")} ${esc(m.bank)} •••• ${esc(m.account_last4)}</b></div>
          <div class="r"><span>ເວລາ</span><b class="num">${timeLo(p.paid_at)}</b></div>
          <div class="r"><span>ເລກອ້າງອີງ</span><b class="num" style="font-size:13px">${esc(p.reference || "")}</b></div>
        </div>
        <div style="margin-top:auto;padding-top:22px;display:grid;gap:10px">
          <a class="btn btn-gold btn-block" href="#/charge">${icon("qr")} ຮັບເງິນລາຍການໃໝ່</a>
          <a class="btn btn-ghost btn-block" href="#/home">${icon("home")} ກັບໜ້າຫຼັກ</a></div></div>`;
    },
    mount(pid) { const p = S.payments[pid]; if (!p) return; countUp($("#done-amt"), p.amount_kip, 900); petals(); },
  };

  // ---- History ----
  let histFilter = "all";
  function weekChart(days) {
    const W = 360, H = 170, max = Math.max(1, ...days.map((d) => d.kip)), bw = 30, gap = (W - bw * days.length) / (days.length - 1);
    const today = days[days.length - 1].day;
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" aria-label="ຍອດຂາຍ 7 ມື້">
      <defs><linearGradient id="wb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A4BA8"/><stop offset="1" stop-color="#24307A"/></linearGradient>
      <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3D58C"/><stop offset="1" stop-color="#C9962B"/></linearGradient></defs>
      ${[0.5, 1].map((k) => `<line x1="0" x2="${W}" y1="${H - 26 - k * (H - 56)}" y2="${H - 26 - k * (H - 56)}" stroke="#E9DEC9" stroke-dasharray="3 5"/>`).join("")}
      ${days.map((d, i) => {
        const x = i * (bw + gap), bh = Math.max(4, (d.kip / max) * (H - 56)), y = H - 26 - bh, isT = d.day === today;
        return `<g><rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="9" fill="url(#${isT ? "wg" : "wb"})" opacity="${isT ? 1 : 0.85}"><animate attributeName="height" from="0" to="${bh}" dur=".7s" begin="${i * 0.05}s" fill="freeze"/><animate attributeName="y" from="${H - 26}" to="${y}" dur=".7s" begin="${i * 0.05}s" fill="freeze"/></rect>
          <text x="${x + bw / 2}" y="${y - 7}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${isT ? "#9C6F12" : "#5A5570"}">${d.kip ? kipShort(d.kip) : ""}</text>
          <text x="${x + bw / 2}" y="${H - 7}" text-anchor="middle" font-size="12" font-weight="${isT ? 800 : 600}" fill="${isT ? "#161F57" : "#8D879E"}">${isT ? "ມື້ນີ້" : dayShortLo(d.day)}</text></g>`;
      }).join("")}</svg>`;
  }
  VIEWS.history = {
    html: () => {
      const h = S.hist, items = h.items.filter((x) => histFilter === "all" || x.wallet === histFilter);
      const groups = {};
      items.forEach((x) => (groups[ymdVte(x.paid_at)] ||= []).push(x));
      const todayY = h.days[h.days.length - 1].day, yestY = h.days[h.days.length - 2]?.day;
      const label = (d) => (d === todayY ? "ມື້ນີ້" : d === yestY ? "ມື້ວານ" : dateLo(d));
      const wallets = [...new Set(h.items.map((x) => x.wallet))];
      return `<div class="page"><div class="topbar"><h1 class="grow">ປະຫວັດການຂາຍ</h1><span class="icon-btn" style="color:var(--gold-d)">${icon("leaf")}</span></div>
        <div class="card week"><div class="small muted" style="font-weight:700">7 ມື້ຜ່ານມາ</div><div class="head"><span class="num">${fmt(h.total_kip)}</span><b style="color:var(--gold-d)">ກີບ</b><span class="muted small" style="margin-left:auto">${h.count} ລາຍການ</span></div>${weekChart(h.days)}${feeLines(Number(h.total_kip), h.items.length === h.count ? h.items.reduce((a, x) => a + feeOf(x.amount_kip), 0) : feeOf(h.total_kip))}</div>
        <div class="filters"><button class="chip ${histFilter === "all" ? "on" : ""}" data-f="all">ທັງໝົດ</button>${wallets.map((w) => `<button class="chip ${histFilter === w ? "on" : ""}" data-f="${w}">${walletTile(w, "sm")}${WALLET[w]?.n || w}</button>`).join("")}</div>
        ${Object.keys(groups).length ? Object.entries(groups).map(([d, xs]) => `<div class="day-h"><span>${label(d)}</span><span class="num">${fmt(xs.reduce((s, x) => s + Number(x.amount_kip), 0))} ກີບ</span></div><div class="card tx-list">${xs.map((p) => txRow(p)).join("")}</div>`).join("")
          : `<div class="empty">${elephant(140)}<b>ຍັງບໍ່ມີລາຍການ</b></div>`}
      </div>${tabbar("history")}`;
    },
    mount() { $$("[data-f]").forEach((b) => (b.onclick = () => { histFilter = b.dataset.f; render(true); })); },
  };

  // ---- Items (menu / products) ----
  VIEWS.items = {
    html: () => `<div class="page"><div class="topbar"><h1 class="grow">ລາຍການສິນຄ້າ</h1><button class="btn btn-primary" id="add" style="min-height:44px;padding:0 16px;font-size:15px">${icon("plus")} ເພີ່ມ</button></div>
      <p class="small muted" style="margin:0 20px 10px">ຂຽນຊື່ເປັນພາສາລາວ. ນັກທ່ອງທ່ຽວຈະເຫັນເປັນພາສາຂອງເຂົາເອງ.</p>
      <div class="card" style="margin:0 16px">${S.menu.length ? S.menu.map((it) => `<div class="item"><div class="sw" style="background:${it.color}">${icon(cat(S.merchant.category).g, "g-lg")}</div>
        <div class="grow"><div class="row" style="gap:8px;align-items:flex-start"><div class="nm grow">${esc(it.name_lo)}</div><button class="icon-btn" style="width:36px;height:36px;box-shadow:none;color:var(--ink-3)" data-del="${it.id}" aria-label="ລຶບ">${icon("trash", "g-sm")}</button></div>
        <div class="pr">${fmt(it.price_kip)} ກີບ</div>
        ${Object.keys(it.names || {}).length ? `<div class="tr">${it.translated_by === "workers-ai" ? `<span class="ai-badge">${icon("sparkle")} AI</span>` : ""}${Object.entries(it.names).map(([l, t]) => `<span>${trBadge(l)}${esc(t)}</span>`).join("")}</div>` : ""}</div></div>`).join("")
        : `<div class="empty">${icon("basket", "g-lg")}<p><b>ຍັງບໍ່ມີສິນຄ້າ</b><br>ເພີ່ມສິນຄ້າ ເພື່ອໃຫ້ລູກຄ້າເລືອກໄດ້ງ່າຍ</p></div>`}</div>
      </div>${tabbar("items")}`,
    mount() {
      $("#add").onclick = () => sheet(`<h2 style="margin:0 0 4px">ເພີ່ມສິນຄ້າ</h2><p class="small muted" style="margin:0 0 16px">ລະບົບຈະແປຊື່ເປັນ ຈີນ, ໄທ, ຫວຽດນາມ ແລະ ອັງກິດ ໃຫ້ເອງ</p>
        <label class="field"><span>ຊື່ສິນຄ້າ (ພາສາລາວ)</span><input class="input" id="i-n" maxlength="60" placeholder="ເຊັ່ນ: ຜ້າພັນຄໍໄໝ"></label>
        <label class="field"><span>ລາຄາ (ກີບ)</span><input class="input num" id="i-p" inputmode="numeric" placeholder="50,000"></label>
        <button class="btn btn-primary btn-block" id="i-go">${icon("sparkle")} ບັນທຶກ ແລະ ແປພາສາ</button>`, (sh, close) => {
        const pr = $("#i-p", sh);
        pr.oninput = () => { const v = pr.value.replace(/\D/g, ""); pr.value = v ? fmt(v) : ""; };
        setTimeout(() => $("#i-n", sh).focus(), 350);
        $("#i-go", sh).onclick = async () => {
          const name = $("#i-n", sh).value.trim(), price = Number(pr.value.replace(/\D/g, ""));
          if (!name) return $("#i-n", sh).focus();
          if (price < 1000) return pr.focus();
          $("#i-go", sh).disabled = true; $("#i-go", sh).innerHTML = `<span class="dots"><i></i><i></i><i></i></span> ກຳລັງແປ...`;
          try {
            const it = await api(`/api/merchants/${S.mid}/menu`, { method: "POST", body: { name_lo: name, price_kip: price } });
            S.menu.push(it); close(); render(true);
            toast(`<span class="ai-badge">${icon("sparkle")} AI</span><b>ເພີ່ມ “${esc(name)}” ແລ້ວ</b>`, 2500);
          } catch (e) { toast(`${icon("info")}<b>ບັນທຶກບໍ່ສຳເລັດ</b>`); close(); }
        };
      });
      $$("[data-del]").forEach((b) => (b.onclick = () => {
        const it = S.menu.find((x) => x.id === b.dataset.del);
        sheet(`<h2 style="margin:0 0 6px">ລຶບ “${esc(it.name_lo)}”?</h2><p class="muted" style="margin:0 0 16px">ລູກຄ້າຈະບໍ່ເຫັນສິນຄ້ານີ້ອີກ</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="btn btn-ghost" id="no">ບໍ່ລຶບ</button><button class="btn btn-danger" id="yes">${icon("trash")} ລຶບ</button></div>`, (sh, close) => {
          $("#no", sh).onclick = close;
          $("#yes", sh).onclick = async () => { try { await api(`/api/merchants/${S.mid}/menu/${it.id}`, { method: "DELETE" }); S.menu = S.menu.filter((x) => x.id !== it.id); } catch (e) {} close(); render(true); };
        });
      }));
    },
  };

  // ---- Shop QR poster (static QR on the stall) ----
  VIEWS.poster = {
    html: () => {
      const m = S.merchant, url = `${S.cfg.touristUrl}/shop/${m.id}`, n = m.names || {};
      return `<div class="page no-tabs">${headBar("ປ້າຍ QR ຂອງຮ້ານ", "#/home", `<button class="icon-btn no-print" onclick="print()" aria-label="ພິມ">${icon("print")}</button>`)}
        <p class="small muted no-print" style="margin:0 20px 12px">ພິມແລ້ວຕິດໄວ້ໜ້າຮ້ານ. ລູກຄ້າສະແກນ, ເລືອກສິນຄ້າ ແລະ ຈ່າຍເອງໄດ້ ເຖິງວ່າທ່ານກຳລັງຫຍຸ້ງ.</p>
        <div class="poster"><div class="top">${champa(46, { cls: "float" })}<h2>${esc(m.name_lo)}</h2><div class="names">${esc([n.en, n.zh, n.th, n.vi].filter(Boolean).join(" · "))}</div></div>
          <div class="sinh-band"></div>
          <div class="mid"><div class="qr-frame" style="width:min(64vw,240px)">${["tl", "tr", "bl", "br"].map((k) => `<span class="k ${k}">${kanok()}</span>`).join("")}<div class="q">${qrSvg(url, { logo: true })}</div></div>
            <div class="say"><div>${flag("cn", 20)} 扫码付款</div><div>${flag("th", 20)} สแกนจ่ายได้</div><div>${flag("vn", 20)} Quét mã để trả</div><div>${flag("kr", 20)} 스캔하여 결제</div><div style="grid-column:1/-1">${icon("globe", "g-sm")} Scan to pay · ${flag("la", 20)} ສະແກນຈ່າຍ</div></div>
            <div class="wallets">${["alipay", "wechat", "unionpay", "promptpay", "vietqr", "kakaopay", "laoqr"].map((w) => walletTile(w, "sm")).join("")}</div></div>
          <div class="sinh-band thin"></div><div class="foot">Phalom · ລາຄາເປັນເງິນກີບ · Prices in Lao kip</div></div>
        <div style="padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px" class="no-print">
          <button class="btn btn-primary" onclick="print()">${icon("print")} ພິມປ້າຍ</button>
          <a class="btn btn-ghost" href="${esc(url)}" target="_blank" rel="noopener">${icon("phone")} ເບິ່ງແບບລູກຄ້າ</a>
          <a class="btn btn-gold" style="grid-column:1/-1" href="#/tent">${icon("shop")} ປ້າຍຕັ້ງໂຕະ ຂະໜາດໃຫຍ່ (Tent card)</a></div></div>`;
    },
  };


  // ---- My shop on the map (Google Maps) and how tourists find it ----
  VIEWS.map = {
    html: () => {
      const m = S.merchant, mp = S.map, sh = mp && mp.shop, st = mp && mp.standing;
      const natName = { cn: "ຈີນ", th: "ໄທ", vn: "ຫວຽດນາມ", kr: "ເກົາຫຼີ", other: "ປະເທດອື່ນ" };
      const medal = (r) => (r === 1 ? "var(--gold)" : r === 2 ? "#A9B0C8" : r === 3 ? "#C98A5B" : "var(--paper-3)");
      return `<div class="page"><div class="topbar"><h1 class="grow">ແຜນທີ່ຮ້ານ</h1><span class="icon-btn" style="color:var(--jade)">${icon("map")}</span></div>
        <p class="small muted" style="margin:0 20px 12px">ນັກທ່ອງທ່ຽວເຫັນຮ້ານຂອງທ່ານໃນແຜນທີ່ Google ແລະ ລະບົບແນະນຳຂອງ Phalom.</p>
        <div class="map-grid"><div>
        <div class="mapcard">${sh ? gmap.embed(sh.lat, sh.lng, { z: 17, hl: "lo", title: m.name_lo }) : !mp ? '<div class="skeleton" style="position:absolute;inset:0"></div>' : `<div class="empty">${icon("pin", "g-lg")}<p><b>ຍັງບໍ່ໄດ້ປັກໝຸດຮ້ານ</b><br>ກົດປຸ່ມຂ້າງລຸ່ມ ຕອນທີ່ທ່ານຢູ່ຮ້ານ</p></div>`}</div>
        <div class="map-btns"><button class="btn btn-primary" id="here">${icon("locate")} ປັກໝຸດຢູ່ບ່ອນທີ່ຂ້ອຍຢືນ</button>
          ${sh ? `<a class="btn btn-ghost" href="${gmap.open(sh.lat, sh.lng)}" target="_blank" rel="noopener">${icon("map")} ເປີດໃນ Google Maps</a>` : ""}</div>
        <div class="section-title"><h3>ເວລາເປີດຮ້ານ</h3></div>
        <div class="card hours"><label>${icon("clock", "g-sm")} ເປີດ<input class="input num" type="time" id="h-from" value="${hhmm(sh ? sh.open_from : 1020)}"></label>
          <label>ປິດ<input class="input num" type="time" id="h-to" value="${hhmm(sh ? sh.open_to : 1380)}"></label>
          <button class="btn btn-soft" id="h-save" ${sh ? "" : "disabled"}>${icon("check")} ບັນທຶກ</button></div>
        <p class="small muted" style="margin:8px 20px 0">ຕອນຮ້ານປິດ, ລະບົບຈະບໍ່ສົ່ງນັກທ່ອງທ່ຽວມາຫາ.</p>
        </div><div>
        <div class="section-title"><h3>ຮ້ານທ່ານຢູ່ອັນດັບໃດ</h3></div>
        <div class="card rank-list">${!mp ? '<div class="skeleton" style="height:200px"></div>' : st ? st.by_nat.map((x) => `<div class="rank-row">${flag(x.nat, 26)}<span class="grow">ນັກທ່ອງທ່ຽວ${natName[x.nat]}</span><span class="medal" style="--m:${medal(x.rank)}">${x.rank}</span><span class="small muted">ຈາກ ${st.nearby} ຮ້ານ</span></div>`).join("")
          : `<div class="empty small">ປັກໝຸດຮ້ານກ່ອນ ຈຶ່ງຈະເຫັນອັນດັບ</div>`}</div>
        <p class="small muted" style="margin:8px 20px 0">ທຽບກັບຮ້ານອື່ນໃນໄລຍະ 2 ກມ, ຖ້ານັກທ່ອງທ່ຽວຢືນຢູ່ໜ້າຮ້ານທ່ານ.</p>
        <div class="section-title"><h3>ລະບົບແນະນຳຮ້ານແນວໃດ</h3></div>
        <div class="card how">${[["walk", "var(--indigo-50)", "var(--indigo)", "ຮ້ານໃກ້", "ຍ່າງໄປຮອດງ່າຍ"], ["heart", "var(--red-50)", "var(--red)", "ຄົນປະເທດດຽວກັນມັກ", "ຮຽນຈາກການຈ່າຍເງິນແທ້ໃນ Phalom"], ["clock", "var(--jade-50)", "var(--jade)", "ເປີດຢູ່ຕອນນີ້", "ບໍ່ສົ່ງລູກຄ້າໄປຮ້ານທີ່ປິດ"], ["star", "var(--gold-50)", "var(--gold-d)", "ຄະແນນດີ", "ລູກຄ້າໃຫ້ດາວ"], ["gem", "#EFEAFD", "#6B4FC8", "ຮ້ານນ້ອຍໄດ້ໂອກາດ", "ຮ້ານໃໝ່ ຫຼື ຂາຍໜ້ອຍ ໄດ້ຂຶ້ນກ່ອນແດ່"]]
          .map(([g, bg, c, b, sub], i) => `${i ? '<div class="how-line"></div>' : ""}<div class="how-step"><span class="ic" style="background:${bg};color:${c}">${icon(g)}</span><div><b>${b}</b><span>${sub}</span></div></div>`).join("")}</div>
        <div style="padding:14px 16px 0"><a class="btn btn-ghost btn-block" href="${esc(S.cfg.touristUrl)}/map?focus=${m.id}" target="_blank" rel="noopener">${icon("phone")} ເບິ່ງແບບນັກທ່ອງທ່ຽວ</a></div>
        </div></div>
      </div>${tabbar("map")}`;
    },
    async mount() {
      const save = async (body, msg) => {
        try { await api(`/api/merchants/${S.mid}/location`, { method: "PUT", body }); S.map = await api(`/api/merchants/${S.mid}/map`); render(true); toast(`${icon("check")}<b>${msg}</b>`, 2200); }
        catch (e) { toast(`${icon("info")}<b>ບັນທຶກບໍ່ສຳເລັດ</b>`); }
      };
      const toMin = (v) => { const [h, mi] = String(v || "0:0").split(":").map(Number); return h * 60 + mi; };
      $("#here").onclick = () => {
        if (!navigator.geolocation) return toast(`${icon("info")}<b>ໂທລະສັບນີ້ບອກຈຸດບໍ່ໄດ້</b>`);
        $("#here").innerHTML = '<span class="dots"><i></i><i></i><i></i></span> ກຳລັງຊອກຫາ...';
        navigator.geolocation.getCurrentPosition((p) => save({ lat: p.coords.latitude, lng: p.coords.longitude }, "ປັກໝຸດຮ້ານແລ້ວ"),
          () => { toast(`${icon("info")}<b>ເປີດການບອກຈຸດ (Location) ກ່ອນ</b>`, 3000); render(true); }, { enableHighAccuracy: true, timeout: 10000 });
      };
      $("#h-save").onclick = () => { const sh = S.map.shop; save({ lat: sh.lat, lng: sh.lng, open_from: toMin($("#h-from").value), open_to: toMin($("#h-to").value) }, "ບັນທຶກເວລາແລ້ວ"); };
      if (!S.map) { try { S.map = await api(`/api/merchants/${S.mid}/map`); render(true); } catch (e) {} }
    },
  };


  // ---- Table tent card (big folded card with the shop QR) ----
  // One sheet (A3 or A4, portrait) folds in half: two faces, the top one upside down
  // so both read the right way up once the card stands on the table.
  let tentSize = store.get("phalom.tent", "A3");
  function tentFace(m, url) {
    const n = m.names || {}, c = cat(m.category);
    return `<div class="tf">
      <div class="tf-qr"><div class="tf-qrcard">${["tl", "tr", "bl", "br"].map((k) => `<span class="k ${k}">${kanok()}</span>`).join("")}<div class="q">${qrSvg(url, { logo: true })}</div></div>
        <div class="tf-scan display">ສະແກນຈ່າຍ</div><div class="tf-scan2">Scan to pay · 扫码付款</div></div>
      <div class="tf-info">
        <div class="tf-brand">${logo(64, 0.26)}<div><b class="display">ພະລົມ</b><span>PHALOM</span></div><span class="tf-cat" style="background:${c.bg};color:${c.c}">${icon(c.g)}</span></div>
        <div class="tf-name display">${esc(m.name_lo)}</div>
        <div class="tf-names">${esc([n.en, n.zh].filter(Boolean).join(" · "))}</div>
        <div class="tf-say">
          <div>${flag("la", 34)}<b>ສະແກນ QR ຈ່າຍເງິນໄດ້ເລີຍ</b></div>
          <div>${flag("cn", 34)}<b>扫码付款，支付宝 · 微信</b></div>
          <div>${flag("th", 34)}<b>สแกนจ่ายด้วย PromptPay</b></div>
          <div>${flag("vn", 34)}<b>Quét mã trả bằng VietQR</b></div>
          <div>${flag("kr", 34)}<b>스캔하여 결제하세요</b></div>
        </div>
        <div class="tf-menu">${icon("globe")}<span>ເບິ່ງເມນູເປັນພາສາຂອງທ່ານ · Menu in your language</span></div>
        <div class="tf-wallets">${["laoqr", "alipay", "wechat", "unionpay", "promptpay", "vietqr", "kakaopay"].map((w) => walletTile(w)).join("")}</div>
      </div>
      <div class="tf-champa">${champa(260, { petal: "#ffffff", edge: "#ffffff" })}</div>
      <div class="tf-foot"><span>ລາຄາເປັນເງິນກີບ · Prices in Lao kip · 老挝基普标价</span></div>
    </div>`;
  }
  VIEWS.tent = {
    html: () => {
      const m = S.merchant, url = `${S.cfg.touristUrl}/shop/${m.id}`, face = tentFace(m, url);
      return `<div class="page no-tabs tent-page">${headBar("ປ້າຍຕັ້ງໂຕະ (Tent card)", "#/poster", `<button class="icon-btn no-print" onclick="print()" aria-label="ພິມ">${icon("print")}</button>`)}
        <p class="small muted no-print" style="margin:0 20px 12px">ຕັ້ງໄວ້ເທິງໂຕະ ຫຼື ໜ້າຮ້ານ, ເຫັນໄດ້ທັງສອງດ້ານ. ພິມໃສ່ເຈ້ຍແຂງ, ພັບເຄິ່ງຕາມເສັ້ນຈ້ຳ, ແລ້ວຕັ້ງເປັນຮູບຫຼັງຄາ.</p>
        <div class="tent-stage no-print"><div class="tent-scaler"><div class="tent3d"><div class="tent-back"></div><div class="tent-front">${face}</div><div class="tent-shadow"></div></div></div></div>
        <div class="seg no-print" style="max-width:420px;margin:18px auto 0">${["A3", "A4"].map((z) => `<button data-z="${z}" class="${tentSize === z ? "on" : ""}">${z} ${z === "A3" ? "(ໃຫຍ່ 29.7 × 21 ຊມ ຕໍ່ໜ້າ)" : "(21 × 14.8 ຊມ)"}</button>`).join("")}</div>
        <div class="no-print" style="padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:520px;margin:0 auto">
          <button class="btn btn-gold" onclick="print()">${icon("print")} ພິມ ${tentSize}</button>
          <a class="btn btn-ghost" href="${esc(url)}" target="_blank" rel="noopener">${icon("phone")} ລອງສະແກນ</a></div>
        <div class="tent-sheet ${tentSize}"><div class="tent-half flip">${face}</div><div class="tent-fold"></div><div class="tent-half">${face}</div></div>
      </div>`;
    },
    mount() {
      let st = document.getElementById("tent-page-size");
      if (!st) { st = document.createElement("style"); st.id = "tent-page-size"; document.head.appendChild(st); }
      st.textContent = `@page { size: ${tentSize} portrait; margin: 0; }`;
      $$("[data-z]").forEach((b) => (b.onclick = () => { tentSize = b.dataset.z; store.set("phalom.tent", tentSize); render(true); }));
      const fit = () => { const st3 = $(".tent-stage"); if (!st3) return; const k = Math.min(0.9, (st3.clientWidth - 24) / 1123); const sc = $(".tent-scaler"); sc.style.width = 1123 * k + "px"; sc.style.height = 794 * k + 40 * k + "px"; $(".tent3d").style.transform = `scale(${k})`; };
      fit(); window.onresize = fit;
    },
  };

  // ---- My shop / settings ----
  VIEWS.me = {
    html: () => {
      const m = S.merchant, c = cat(m.category), n = m.names || {};
      return `<div class="page"><div class="topbar"><h1 class="grow">ຮ້ານຂອງຂ້ອຍ</h1></div>
        <div class="card profile-card"><div class="avatar" style="background:${c.bg};color:${c.c};width:62px;height:62px;border-radius:20px">${icon(c.g, "g-lg")}</div>
          <div class="grow"><b style="font-size:18px;display:block">${esc(m.name_lo)}</b><span class="small muted">${c.lo} · ${esc(m.market)}</span>
          ${m.rating ? `<div class="small" style="color:var(--gold-d);font-weight:800;display:flex;align-items:center;gap:4px">${icon("star", "g-sm")} ${m.rating}</div>` : ""}</div></div>
        ${Object.keys(n).length ? `<div class="section-title"><h3>ນັກທ່ອງທ່ຽວເຫັນຊື່ຮ້ານແບບນີ້</h3></div><div class="card list">${Object.entries(n).map(([l, t]) => `<div class="li">${trBadge(l)}<span>${esc(t)}</span></div>`).join("")}</div>` : ""}
        <div class="section-title"><h3>ບັນຊີຮັບເງິນ</h3></div>
        <div class="card list"><div class="li"><span class="ic" style="background:var(--jade-50);color:var(--jade)">${icon("bank")}</span><div class="grow">${esc(m.bank)}<div class="small muted">ເງິນເຂົ້າບັນຊີນີ້ໂດຍກົງ</div></div><span class="v num">•••• ${esc(m.account_last4)}</span></div>
          ${m.phone ? `<div class="li"><span class="ic" style="background:var(--indigo-50);color:var(--indigo)">${icon("phone")}</span>ເບີໂທ<span class="v num">${esc(m.phone)}</span></div>` : ""}</div>
        <div class="section-title"><h3>ເງິນມາຫາທ່ານແນວໃດ</h3></div>
        <div class="card how">
          <div class="how-step"><span class="ic" style="background:#E6F0FF;color:#1677FF">${icon("phone")}</span><div><b>ນັກທ່ອງທ່ຽວຈ່າຍດ້ວຍແອັບຂອງເຂົາ</b><span>Alipay, WeChat Pay, PromptPay, VietQR...</span></div></div>
          <div class="how-line"></div>
          <div class="how-step"><span class="ic" style="background:var(--gold-50);color:var(--gold-d)">${icon("route")}</span><div><b>PhaJay ຄູ່ຮ່ວມຮັບຈ່າຍເງິນ</b><span>ປ່ຽນເປັນເງິນກີບ ຢ່າງຖືກກົດໝາຍ</span></div></div>
          <div class="how-line"></div>
          <div class="how-step"><span class="ic" style="background:var(--jade-50);color:var(--jade)">${icon("bank")}</span><div><b>ເຂົ້າບັນຊີ ${esc(m.bank)} ຂອງທ່ານ</b><span>Phalom ບໍ່ຖືເງິນຂອງທ່ານຈັກກີບ</span></div></div>
        </div>
        <div class="section-title"><h3>ຕັ້ງຄ່າ</h3></div>
        <div class="card list">
          <button class="li" id="t-sound"><span class="ic" style="background:var(--gold-50);color:var(--gold-d)">${icon("sound")}</span>ສຽງແຈ້ງເມື່ອເງິນເຂົ້າ<span class="v"><span class="switch ${S.sound ? "on" : ""}"></span></span></button>
          <button class="li" id="t-voice"><span class="ic" style="background:var(--indigo-50);color:var(--indigo)">${icon("bell")}</span>ອ່ານຈຳນວນເງິນອອກສຽງ<span class="v"><span class="switch ${S.voice ? "on" : ""}"></span></span></button>
          <button class="li" id="t-test"><span class="ic" style="background:var(--jade-50);color:var(--jade)">${icon("sparkle")}</span>ທົດລອງສຽງ<span class="v">${icon("next", "g-sm")}</span></button>
          <a class="li" href="#/poster"><span class="ic" style="background:var(--red-50);color:var(--red)">${icon("print")}</span>ປ້າຍ QR ຂອງຮ້ານ<span class="v">${icon("next", "g-sm")}</span></a>
          <a class="li" href="#/tent"><span class="ic" style="background:var(--gold-50);color:var(--gold-d)">${icon("shop")}</span>ປ້າຍຕັ້ງໂຕະ (Tent card)<span class="v">${icon("next", "g-sm")}</span></a>
          <a class="li" href="#/map"><span class="ic" style="background:var(--indigo-50);color:var(--indigo)">${icon("map")}</span>ແຜນທີ່ ແລະ ເວລາເປີດຮ້ານ<span class="v">${icon("next", "g-sm")}</span></a>
          <button class="li" id="t-out"><span class="ic" style="background:var(--paper-2);color:var(--ink-2)">${icon("logout")}</span>ອອກ / ປ່ຽນຮ້ານ<span class="v">${icon("next", "g-sm")}</span></button>
        </div>
        <div class="center" style="margin:30px 0 0">${logo(44)}<div class="small muted" style="margin-top:6px">Phalom 2.0 · ການຈ່າຍເງິນເປັນການສາທິດ</div></div>
      </div>${tabbar("me")}`;
    },
    mount() {
      $("#t-sound").onclick = () => { S.sound = !S.sound; store.set("phalom.sound", S.sound); render(true); };
      $("#t-voice").onclick = () => { S.voice = !S.voice; store.set("phalom.voice", S.voice); render(true); };
      $("#t-test").onclick = () => { chime("paid"); speakKip(50000); };
      $("#t-out").onclick = () => sheet(`<h2 style="margin:0 0 6px">ອອກຈາກຮ້ານນີ້?</h2><p class="muted" style="margin:0 0 16px">ຂໍ້ມູນຮ້ານຍັງຢູ່ຄົບ. ທ່ານສາມາດເປີດຮ້ານອື່ນ ຫຼື ກັບມາໃຊ້ຮ້ານຕົວຢ່າງໄດ້.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="btn btn-ghost" id="no">ຢູ່ຕໍ່</button><button class="btn btn-danger" id="yes">${icon("logout")} ອອກ</button></div>`, (sh, close) => {
        $("#no", sh).onclick = close;
        $("#yes", sh).onclick = () => { close(); store.del("phalom.mid"); Object.assign(S, { mid: null, merchant: null, dash: null, hist: null, menu: null, map: null }); S.seen.clear(); go("#/welcome"); };
      });
    },
  };

  // ---------------------------------------------------------------- start
  (async function start() {
    try { S.cfg = await api("/api/config"); } catch (e) { S.cfg = { touristUrl: location.origin }; }
    if (!location.hash || location.hash === "#") location.replace(S.mid ? "#/home" : "#/welcome");
    render();
  })();
  document.addEventListener("visibilitychange", () => { if (!document.hidden) poll(); });
})();
