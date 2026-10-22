// Shared helpers for the Phalom merchant app and the tourist demo app.
// Money is shown in Lao kip only (project policy): no other currency, no rates.
(function (g) {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = (n) => Math.round(Number(n) || 0).toLocaleString("en-US");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function api(path, opts = {}) {
    const r = await fetch(path, { ...opts, headers: { "content-type": "application/json", ...(opts.headers || {}) }, body: opts.body && typeof opts.body !== "string" ? JSON.stringify(opts.body) : opts.body });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || `HTTP ${r.status}`), { status: r.status });
    return j;
  }

  // Wallet apps tourists already use. Abbreviation tiles, not brand logos.
  const WALLET = {
    alipay: { n: "Alipay", bg: "#1677FF", ab: "支", nat: "cn" },
    wechat: { n: "WeChat Pay", bg: "#07C160", ab: "微", nat: "cn" },
    unionpay: { n: "UnionPay", bg: "#C4161C", ab: "UP", nat: "cn" },
    promptpay: { n: "PromptPay", bg: "#1C3F94", ab: "PP", nat: "th" },
    vietqr: { n: "VietQR", bg: "#0B4EA2", ab: "VQ", nat: "vn" },
    kakaopay: { n: "KakaoPay", bg: "#FFCD00", fg: "#3C1E1E", ab: "K", nat: "kr" },
    laoqr: { n: "LAO QR", bg: "#C8102E", ab: "ລາວ", nat: "la" },
  };
  const walletTile = (w, cls = "") => { const x = WALLET[w] || { n: w, bg: "#8D879E", ab: "?" }; return `<span class="wallet-tile ${cls}" style="background:${x.bg};color:${x.fg || "#fff"}">${x.ab}</span>`; };

  // Where a customer is from, in Lao (for the shop owner).
  const NAT_LO = { cn: "ຈີນ", th: "ໄທ", vn: "ຫວຽດນາມ", kr: "ເກົາຫຼີ", la: "ລາວ", other: "ອື່ນໆ" };

  // Vientiane time for display.
  const TZ = "Asia/Vientiane";
  const timeLo = (iso) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
  const DAY_LO = ["ວັນອາທິດ", "ວັນຈັນ", "ວັນອັງຄານ", "ວັນພຸດ", "ວັນພະຫັດ", "ວັນສຸກ", "ວັນເສົາ"];
  const DAY_LO_S = ["ອາ", "ຈ", "ອ", "ພ", "ພຫ", "ສ", "ສ"];
  const MONTH_LO = ["ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ", "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ"];
  const ymdVte = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });
  function dateLo(ymd) {
    const [y, m, d] = ymd.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d, 12));
    return `${DAY_LO[dt.getUTCDay()]} ${d} ${MONTH_LO[m - 1]}`;
  }
  const dayShortLo = (ymd) => { const [y, m, d] = ymd.split("-").map(Number); return DAY_LO_S[new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay()]; };

  // ---- Sound: a short phrase on the Lao pentatonic scale, voiced like a khaen
  // (several reeds, gently detuned, soft attack). Played when money arrives.
  let actx;
  function chime(kind = "paid") {
    try {
      actx = actx || new (g.AudioContext || g.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const t0 = actx.currentTime + 0.02;
      const notes = kind === "paid" ? [523.25, 587.33, 659.25, 783.99, 1046.5] : [659.25, 523.25];
      const out = actx.createGain(); out.gain.value = 0.22; out.connect(actx.destination);
      const lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600; lp.connect(out);
      notes.forEach((f, i) => {
        const t = t0 + i * 0.11, dur = i === notes.length - 1 ? 0.9 : 0.32;
        [-4, 0, 4].forEach((cents, k) => {
          const o = actx.createOscillator(), gn = actx.createGain();
          o.type = k === 1 ? "triangle" : "sawtooth";
          o.frequency.value = f * Math.pow(2, cents / 1200);
          const peak = k === 1 ? 0.5 : 0.08;
          gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(peak, t + 0.03); gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
          o.connect(gn); gn.connect(lp); o.start(t); o.stop(t + dur + 0.05);
        });
      });
    } catch (e) { /* no audio */ }
  }
  // Unlock audio on the first tap (mobile browsers require it).
  g.addEventListener("pointerdown", () => { try { actx = actx || new (g.AudioContext || g.webkitAudioContext)(); actx.resume(); } catch (e) {} }, { once: true });

  // Say the amount aloud. The Android app speaks Lao (or Thai if no Lao voice);
  // in a browser we use a Lao voice when the phone has one, else Thai.
  // Plays the spoken alert for a paid payment (ElevenLabs via the Worker); any failure falls back to the phone's own voice.
  function speakKip(kip, pid) {
    if (pid && g.fetch && g.Audio) {
      const ac = new AbortController(), t = setTimeout(() => ac.abort(), 6000);
      fetch(`/api/payments/${pid}/voice`, { signal: ac.signal })
        .then((r) => { if (!r.ok) throw new Error("voice " + r.status); return r.blob(); })
        .then((b) => { clearTimeout(t); const a = new Audio(URL.createObjectURL(b)); a.onended = () => URL.revokeObjectURL(a.src); return a.play(); })
        .catch(() => { clearTimeout(t); speakKipLocal(kip); });
      return;
    }
    speakKipLocal(kip);
  }
  function speakKipLocal(kip) {
    const lo = "ໄດ້ຮັບເງິນ " + fmt(kip) + " ກີບ", th = "ได้รับเงิน " + fmt(kip) + " กีบ";
    if (g.PhalomAndroid && g.PhalomAndroid.speak) { try { setTimeout(() => g.PhalomAndroid.speak(lo, th), 700); return; } catch (e) {} }
    const ss = g.speechSynthesis; if (!ss) return;
    const vs = ss.getVoices();
    const v = vs.find((x) => /^lo/i.test(x.lang)) || vs.find((x) => /^th/i.test(x.lang));
    if (!v) return;
    const u = new SpeechSynthesisUtterance(/^lo/i.test(v.lang) ? lo : th); u.voice = v; u.lang = v.lang; u.rate = 0.95;
    setTimeout(() => ss.speak(u), 700);
  }

  // QR code as SVG (Kazuhiko Arase's qrcode.js). Error level H leaves room for the champa in the middle.
  function qrSvg(text, opt = {}) {
    const q = g.qrcode(0, opt.level || "H"); q.addData(text); q.make();
    const n = q.getModuleCount(), m = 4, size = n + m * 2; // 4-module white quiet zone helps scanners
    const hole = opt.logo ? Math.ceil(n * 0.22) | 1 : 0, h0 = (n - hole) / 2;
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (!q.isDark(r, c)) continue;
      if (hole && r >= h0 - 0.5 && r < h0 + hole - 0.5 && c >= h0 - 0.5 && c < h0 + hole - 0.5) continue;
      const finder = (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
      if (finder) continue;
      d += `M${c + m + 0.03} ${r + m + 0.03}h.94v.94h-.94Z`; // square modules: the most reliable for every scanner
    }
    const fg = opt.fg || "#0B0F2E", ac = opt.accent || "#C8102E";
    const eye = (x, y) => `<rect x="${x + m + 0.5}" y="${y + m + 0.5}" width="6" height="6" rx="1.8" fill="none" stroke="${fg}" stroke-width="1"/><rect x="${x + m + 2}" y="${y + m + 2}" width="3" height="3" rx=".9" fill="${ac}"/>`;
    const logoSvg = opt.logo && g.G ? `<g transform="translate(${m + h0 - 0.2} ${m + h0 - 0.2}) scale(${(hole + 0.4) / 100})">${g.G.logo(100, 0.3).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>` : "";
    return `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" shape-rendering="geometricPrecision" role="img" aria-label="QR" class="qr-svg" style="background:#fff;color-scheme:only light"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="${fg}"/>${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}${logoSvg}</svg>`;
  }

  // Falling champa petals for a successful payment.
  function petals(n = 26) {
    const box = document.createElement("div"); box.className = "petals";
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span"), size = 18 + Math.random() * 26;
      s.style.left = Math.random() * 100 + "%";
      s.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
      s.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      s.style.animationDuration = 2.4 + Math.random() * 2.2 + "s";
      s.style.animationDelay = Math.random() * 0.6 + "s";
      s.innerHTML = g.G.champa(size);
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 5600);
  }

  // Animated count-up for big numbers.
  function countUp(el, to, ms = 900) {
    const from = Number(el.dataset.v || 0); el.dataset.v = to;
    if (from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function toast(html, ms = 4200) {
    let wrap = $(".toast-wrap"); if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
    const t = document.createElement("div"); t.className = "toast"; t.innerHTML = html; wrap.appendChild(t);
    const close = () => { t.classList.add("out"); setTimeout(() => t.remove(), 360); };
    t.onclick = close; setTimeout(close, ms);
    return t;
  }

  function sheet(html, onMount) {
    const bg = document.createElement("div"); bg.className = "sheet-bg";
    const sh = document.createElement("div"); sh.className = "sheet"; sh.innerHTML = html;
    const close = () => { bg.remove(); sh.remove(); };
    bg.onclick = close;
    document.body.append(bg, sh);
    if (onMount) onMount(sh, close);
    return close;
  }

  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };

  // Google Maps: the keyless embed (one pin) and the official deep links, which
  // open the Google Maps app on a phone. A Maps JavaScript API key would allow
  // all shops as pins on one map; see README.
  const ll = (lat, lng) => `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
  const gmap = {
    embed: (lat, lng, { z = 17, hl = "lo", title = "Google Maps" } = {}) =>
      `<iframe class="gmap" title="${esc(title)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen src="https://www.google.com/maps?q=${ll(lat, lng)}&z=${z}&hl=${encodeURIComponent(hl)}&output=embed"></iframe>`,
    walk: (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${ll(lat, lng)}&travelmode=walking`,
    open: (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${ll(lat, lng)}`,
  };
  const distTxt = (m, km = "km", mm = "m") => (m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} ${mm}` : `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} ${km}`);
  const hhmm = (min) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

  g.Phalom = { $, $$, fmt, esc, sleep, api, WALLET, walletTile, NAT_LO, timeLo, dateLo, dayShortLo, ymdVte, chime, speakKip, qrSvg, petals, countUp, toast, sheet, store, gmap, distTxt, hhmm };
})(window);
