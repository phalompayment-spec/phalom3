// Phalom glyphs and Lao illustrations, all hand-drawn inline SVG.
// Icons: 24-unit grid, 1.8 stroke, round joins, with a soft duotone fill (.d).
// Many carry a Lao object: the stilt house, the palm-leaf manuscript (bai lan),
// the sticky-rice basket (tip khao), the champa flower, That Luang, the naga.
(function (g) {
  const P = {
    home: '<path class="d" d="M5.5 10.6h13V16h-13z"/><path d="M2.6 11.2c3-1 6-3.6 9.4-7 3.4 3.4 6.4 6 9.4 7"/><path d="M2.6 11.2c-.6-.2-.8-.9-.3-1.3M21.4 11.2c.6-.2.8-.9.3-1.3"/><path d="M5.5 10.4V16h13v-5.6"/><path d="M7 16v4.2M12 16v4.2M17 16v4.2M4.5 20.2h15"/><path d="M10.4 16v-3.4h3.2V16"/>',
    qr: '<path class="d" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM20 14v1.5M14 20h1.5"/>',
    scan: '<path d="M4 8.5V5.6A1.6 1.6 0 0 1 5.6 4h2.9M15.5 4h2.9A1.6 1.6 0 0 1 20 5.6v2.9M20 15.5v2.9a1.6 1.6 0 0 1-1.6 1.6h-2.9M8.5 20H5.6A1.6 1.6 0 0 1 4 18.4v-2.9"/><path d="M3 12h18"/><path class="d" d="M7 7h10v10H7z"/>',
    leaf: '<path class="d" d="M3.5 7.2h17v9.6h-17z"/><path d="M3.6 7.2h16.8c.8 0 1.2.6 1 1.3l-.6 2.3a4 4 0 0 0 0 2.4l.6 2.3c.2.7-.2 1.3-1 1.3H3.6c-.8 0-1.2-.6-1-1.3l.6-2.3a4 4 0 0 0 0-2.4l-.6-2.3c-.2-.7.2-1.3 1-1.3Z"/><circle cx="6.2" cy="12" r="1"/><path d="M9 10.3h8.5M9 13.7h6"/>',
    basket: '<path class="d" d="M7.6 8.4h8.8l-1 10.6a1.6 1.6 0 0 1-1.6 1.4h-3.6A1.6 1.6 0 0 1 8.6 19z"/><path d="M7 5.2h10l-.9 3.2H7.9z"/><path d="M7.6 8.4h8.8l-1 10.6a1.6 1.6 0 0 1-1.6 1.4h-3.6A1.6 1.6 0 0 1 8.6 19z"/><path d="M8 11.6h8M8.3 14.8h7.4M8.6 17.8h6.8"/><path d="M10 8.4l.8 12M14 8.4l-.8 12"/><path d="M12 5.2V3.6"/>',
    shop: '<path class="d" d="M4.5 10.6h15v9.4h-15z"/><path d="M3 9.2 4.6 4h14.8L21 9.2"/><path d="M3 9.2a2.25 2.25 0 0 0 4.5 0 2.25 2.25 0 0 0 4.5 0 2.25 2.25 0 0 0 4.5 0 2.25 2.25 0 0 0 4.5 0"/><path d="M4.5 11v9h15v-9M9.5 20v-5h5v5"/>',
    user: '<circle class="d" cx="12" cy="8.5" r="4"/><circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1.2-3.8 4-5.6 7.5-5.6s6.3 1.8 7.5 5.6"/>',
    bell: '<path class="d" d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0M12 3v2"/>',
    wallet: '<path class="d" d="M3.5 7.5h17v12h-17z"/><path d="M4.8 7.5h14.7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 5 4.5h11.5v3"/><path d="M20.5 11.5h-4a2 2 0 0 0 0 4h4"/><circle cx="16.6" cy="13.5" r=".6"/>',
    bank: '<path class="d" d="M3.5 9 12 4l8.5 5z"/><path d="M3.5 9 12 4l8.5 5zM5 9v8.5M9.7 9v8.5M14.3 9v8.5M19 9v8.5M3 20h18M4 17.5h16"/><path d="M12 4V2.4"/>',
    chart: '<path class="d" d="M6 13h3v7H6zM10.5 8h3v12h-3zM15 11h3v9h-3z"/><path d="M3 20.5h18M6 20v-7h3v7M10.5 20V8h3v12M15 20v-9h3v9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    check: '<path d="M4.5 12.5l5 5 10-11"/>',
    copy: '<rect class="d" x="8" y="8" width="12" height="12" rx="2.5"/><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    share: '<circle class="d" cx="18" cy="5.5" r="2.5"/><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.3 10.8l7.4-4M8.3 13.2l7.4 4"/>',
    print: '<path class="d" d="M6 13h12v7H6z"/><path d="M6 9V3.5h12V9M6 17H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M6 13h12v7H6z"/>',
    sound: '<path class="d" d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
    mute: '<path class="d" d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5"/>',
    globe: '<circle class="d" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.5 3.8 5.5 3.8 9s-1.2 6.5-3.8 9c-2.6-2.5-3.8-5.5-3.8-9S9.4 5.5 12 3Z"/>',
    star: '<path class="d" d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z"/><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z"/>',
    shield: '<path class="d" d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6z"/><path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6z"/><path d="m8.8 12 2.2 2.2 4.4-4.6"/>',
    phone: '<rect class="d" x="6.5" y="2.5" width="11" height="19" rx="2.5"/><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    clock: '<circle class="d" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    pin: '<path class="d" d="M12 21s-7-6.3-7-11.5a7 7 0 0 1 14 0C19 14.7 12 21 12 21Z"/><path d="M12 21s-7-6.3-7-11.5a7 7 0 0 1 14 0C19 14.7 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.6"/>',
    camera: '<path class="d" d="M3.5 7.5h17v12h-17z"/><path d="M3.5 8.5a1 1 0 0 1 1-1h3l1.6-2.5h5.8l1.6 2.5h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/><circle cx="12" cy="13" r="3.6"/>',
    sparkle: '<path class="d" d="M12 3.5c.6 4.3 2.4 6.3 7 7-4.6.7-6.4 2.7-7 7-.6-4.3-2.4-6.3-7-7 4.6-.7 6.4-2.7 7-7Z"/><path d="M12 3.5c.6 4.3 2.4 6.3 7 7-4.6.7-6.4 2.7-7 7-.6-4.3-2.4-6.3-7-7 4.6-.7 6.4-2.7 7-7ZM18.5 16.5c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5Z"/>',
    trash: '<path class="d" d="M6 7h12l-1 13H7z"/><path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13M10 11v5.5M14 11v5.5"/>',
    edit: '<path class="d" d="M15.5 4.5l4 4L9 19H5v-4z"/><path d="M15.5 4.5l4 4L9 19H5v-4zM13 7l4 4"/>',
    logout: '<path d="M14 4.5H6.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H14M10.5 12H21M17.5 8.5 21 12l-3.5 3.5"/>',
    info: '<circle class="d" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
    backspace: '<path class="d" d="M8.5 5h11.5a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8.5L3 12z"/><path d="M8.5 5h11.5a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8.5L3 12zM11.5 9.5l5 5M16.5 9.5l-5 5"/>',
    keypad: '<path d="M6 5h.1M12 5h.1M18 5h.1M6 10h.1M12 10h.1M18 10h.1M6 15h.1M12 15h.1M18 15h.1M12 20h.1" stroke-width="3.4"/>',
    grid: '<rect class="d" x="4" y="4" width="7" height="7" rx="2"/><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    bolt: '<path class="d" d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/><path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',
    route: '<circle cx="5.5" cy="18.5" r="2.2"/><circle cx="18.5" cy="5.5" r="2.2"/><path d="M7.7 18.5H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7.3"/>',
    river: '<path d="M3 8c2 0 2-1.6 4.5-1.6S9.5 8 12 8s2-1.6 4.5-1.6S18.5 8 21 8M3 12.5c2 0 2-1.6 4.5-1.6s2 1.6 4.5 1.6 2-1.6 4.5-1.6 2 1.6 4.5 1.6M3 17c2 0 2-1.6 4.5-1.6S9.5 17 12 17s2-1.6 4.5-1.6S18.5 17 21 17"/>',
    map: '<path class="d" d="M9 4.5 15 6.5v13l-6-2z"/><path d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
    locate: '<circle class="d" cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
    gem: '<path class="d" d="M6.5 4.5h11l3.5 5-9 10-9-10z"/><path d="M6.5 4.5h11l3.5 5-9 10-9-10zM3 9.5h18M9.5 4.5 8 9.5l4 10 4-10-1.5-5"/>',
    walk: '<circle cx="13" cy="4.6" r="1.8"/><path d="M10.2 21l2-6.2 2.6 2.4V21M8 12.2l2.2-3.6 3.6-.6 2.2 3.4 2.2.8M12.2 14.8l1-6.6"/>',
    heart: '<path class="d" d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/><path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/>',
    fire: '<path class="d" d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.5 2.6-5.3 3.5-9.3 2 1.3 2.6 3.4 2.6 4.6 1-.6 1.7-1.8 1.9-3 2.8 2 5 4.6 5 7.7 0 3.6-2.6 6.2-6.5 6.2Z"/><path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.5 2.6-5.3 3.5-9.3 2 1.3 2.6 3.4 2.6 4.6 1-.6 1.7-1.8 1.9-3 2.8 2 5 4.6 5 7.7 0 3.6-2.6 6.2-6.5 6.2Z"/><path d="M12 21c-1.6 0-2.7-1.1-2.7-2.6 0-1.6 1.4-2.4 2.7-4.2 1.3 1.8 2.7 2.6 2.7 4.2 0 1.5-1.1 2.6-2.7 2.6Z"/>',
    // Lao objects
    champa: '<g class="d"><path d="M12 12C10 9 9.6 5.2 12.2 3.2c2.8 1.4 2.2 5.6-.2 8.8Z"/><path d="M12 12c3.4-1.4 7.2-1 8.6 1.9-1.8 2.6-5.8 1.2-8.6-1.9Z"/><path d="M12 12c1 3.5.3 7.3-2.8 8.3-2.2-2.2-.2-5.9 2.8-8.3Z"/><path d="M12 12c-3.6.4-7.2-1-7.8-4.1 2.3-2 5.9.4 7.8 4.1Z"/></g><path d="M12 12C10 9 9.6 5.2 12.2 3.2c2.8 1.4 2.2 5.6-.2 8.8ZM12 12c3.4-1.4 7.2-1 8.6 1.9-1.8 2.6-5.8 1.2-8.6-1.9ZM12 12c1 3.5.3 7.3-2.8 8.3-2.2-2.2-.2-5.9 2.8-8.3ZM12 12c-3.6.4-7.2-1-7.8-4.1 2.3-2 5.9.4 7.8 4.1Z"/><path d="M12 12c2.3 2 4.2 4.8 3.3 7.6"/><circle cx="12" cy="12" r="1.3"/>',
    stupa: '<path class="d" d="M8 13h8l1.5 4.5h-11z"/><path d="M12 2.5v3.5M10.6 6h2.8l.8 3.5H9.8zM9 9.5h6l1 3.5H8zM8 13h8l1.5 4.5h-11zM4 17.5h16v3H4z"/>',
    lantern: '<path class="d" d="M12 6.5c3.6 0 5.6 2.5 5.6 5.5S15.6 17.5 12 17.5 6.4 15 6.4 12 8.4 6.5 12 6.5Z"/><path d="M12 2.5v4M9.5 6.5h5M9.5 17.5h5M12 17.5v2.5M10.5 21.5 12 20l1.5 1.5M12 6.5c3.6 0 5.6 2.5 5.6 5.5S15.6 17.5 12 17.5 6.4 15 6.4 12 8.4 6.5 12 6.5ZM12 6.5c-1.4 1.5-2 3.3-2 5.5s.6 4 2 5.5M12 6.5c1.4 1.5 2 3.3 2 5.5s-.6 4-2 5.5"/>',
    elephant: '<path class="d" d="M5 9.5C5 6.5 7.5 5 10.5 5h3C17.5 5 20 7.5 20 11v3.5h-2.2v3.5h-2.6v-3H10v3H7.4v-4.2C6 13.5 5 12 5 9.5Z"/><path d="M5 9.5C5 6.5 7.5 5 10.5 5h3C17.5 5 20 7.5 20 11v3.5h-2.2v3.5h-2.6v-3H10v3H7.4v-4.2M5 9.5c0 2 .5 3.6.5 5.5 0 1.4-.6 2.3-1.8 2.5M8.6 8.5c0 1.6 1 2.6 2.6 2.6"/><circle cx="7.2" cy="8.3" r=".5"/>',
    textile: '<rect class="d" x="4" y="3.5" width="16" height="17" rx="2"/><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M4 7h16M4 17h16M8 12l2-2 2 2-2 2zM12 12l2-2 2 2-2 2z"/>',
    bowl: '<path class="d" d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0Z"/><path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0ZM9 20h6M14.5 3.5 10 11.5M19 4.5l-6.5 7"/><path d="M7 8.5c.6-.6.6-1.4 0-2M10 8.5c.6-.6.6-1.4 0-2" opacity=".7"/>',
    cup: '<path class="d" d="M6.5 8.5h11l-1.4 11.2a1.5 1.5 0 0 1-1.5 1.3H9.4a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M5.5 8.5h13M6.5 8.5l1.4 11.2a1.5 1.5 0 0 0 1.5 1.3h5.2a1.5 1.5 0 0 0 1.5-1.3L17.5 8.5M12.5 8.5l2.5-6 2.5.6"/><path d="M8 13h8"/><circle cx="9" cy="5.6" r="2"/>',
    ring: '<ellipse class="d" cx="12" cy="14.5" rx="7.5" ry="6"/><ellipse cx="12" cy="14.5" rx="7.5" ry="6"/><ellipse cx="12" cy="14.5" rx="4.6" ry="3.4"/><path d="m12 2.5 2.6 3.2L12 8.6 9.4 5.7z"/>',
    coffee: '<path class="d" d="M4.5 9h12v6.5a4.5 4.5 0 0 1-4.5 4.5h-3a4.5 4.5 0 0 1-4.5-4.5z"/><path d="M4.5 9h12v6.5a4.5 4.5 0 0 1-4.5 4.5h-3a4.5 4.5 0 0 1-4.5-4.5zM16.5 11h1.5a2.5 2.5 0 0 1 0 5h-1.8M8 3.5c-.8 1 .8 1.8 0 3M12 3.5c-.8 1 .8 1.8 0 3"/>',
    naga: '<path d="M3 17c3 0 3.5-4 6.5-4s3.4 4 6.4 4c2.4 0 3.6-2 3.6-4.6 0-3-2.4-5-5-5-1.8 0-3 1-3 2.6"/><path d="M19.5 12.4c1.3-.3 2-1.3 2-2.6M17.6 8.4l.8-2M15.2 7.6l.2-2.2"/><circle cx="18.2" cy="10" r=".55"/>',
    tuktuk: '<path class="d" d="M4 8h10l3 5h3v4H4z"/><path d="M4 17V8h10l3 5h3v4h-1.5M7.5 17h8M4 17h.5M4 12h9.5M14 8v4.5"/><circle cx="6" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/><path d="M3 8h12"/>',
    hand: '<path class="d" d="M7 12V7a1.5 1.5 0 0 1 3 0v4-6.5a1.5 1.5 0 0 1 3 0V11V6a1.5 1.5 0 0 1 3 0v6.5V9a1.5 1.5 0 0 1 3 0v6c0 3.5-2.5 6-6 6h-1.5c-2 0-3.3-.8-4.5-2.3L4.5 15a1.5 1.5 0 0 1 2.3-1.9z"/><path d="M7 13V7a1.5 1.5 0 0 1 3 0v4-6.5a1.5 1.5 0 0 1 3 0V11V6a1.5 1.5 0 0 1 3 0v6.5V9a1.5 1.5 0 0 1 3 0v6c0 3.5-2.5 6-6 6h-1.5c-2 0-3.3-.8-4.5-2.3L4.5 15a1.5 1.5 0 0 1 2.3-1.9L7 13"/>',
  };

  function icon(name, cls = "", extra = "") {
    return `<svg class="g ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[name] || P.info}</svg>`;
  }

  // Shop categories -> glyph and colours
  const CAT = {
    souvenir: { g: "textile", lo: "ຂອງທີ່ລະນຶກ / ຜ້າທໍ", c: "#7A2E3B", bg: "#F8E5E2" },
    food: { g: "bowl", lo: "ອາຫານ", c: "#B5531B", bg: "#FCEBDC" },
    drinks: { g: "cup", lo: "ເຄື່ອງດື່ມ", c: "#17785A", bg: "#E3F3EC" },
    silver: { g: "ring", lo: "ເຄື່ອງເງິນ", c: "#5B6386", bg: "#EAECF3" },
    coffee: { g: "coffee", lo: "ກາເຟ", c: "#6B4226", bg: "#F1E6DA" },
  };

  // Champa (dok champa, the national flower). Five overlapping petals, golden heart.
  function champa(size = 48, opt = {}) {
    const petal = opt.petal || "#FFFDF6", edge = opt.edge || "#E9D9B8", heart = opt.heart || "#F2B630";
    const id = "ch" + Math.random().toString(36).slice(2, 7);
    let petals = "";
    for (let i = 0; i < 5; i++) {
      petals += `<path transform="rotate(${i * 72} 50 50)" d="M50 50C40 40 34 22 44 10c8-6 20-2 20 10 0 12-6 22-14 30Z" fill="url(#${id}p)" stroke="${edge}" stroke-width="1.4"/>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true" class="${opt.cls || ""}">
      <defs><radialGradient id="${id}p" cx="50%" cy="50%" r="60%" fx="50%" fy="50%" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0)">
        <stop offset="0.18" stop-color="${heart}"/><stop offset="0.42" stop-color="#FCE7A6"/><stop offset="0.62" stop-color="${petal}"/></radialGradient></defs>
      <g>${petals}</g><circle cx="50" cy="50" r="5" fill="${heart}"/></svg>`;
  }

  // App mark: champa on an indigo tile with a gold sinh hem.
  function logo(size = 56, r = 0.28) {
    const id = "lg" + Math.random().toString(36).slice(2, 7);
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-label="Phalom" role="img">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A4BA8"/><stop offset="1" stop-color="#161F57"/></linearGradient>
      <clipPath id="${id}c"><rect width="100" height="100" rx="${100 * r}"/></clipPath></defs>
      <g clip-path="url(#${id}c)"><rect width="100" height="100" fill="url(#${id})"/>
      <path d="M-10 70a60 60 0 0 1 120 0" fill="none" stroke="#fff" stroke-opacity=".06" stroke-width="10"/>
      <rect y="84" width="100" height="16" fill="#C8102E"/><rect y="84" width="100" height="2" fill="#C9962B"/>
      ${[8, 30, 52, 74, 96].map((x) => `<path d="M${x} 86.5 ${x + 6} 92 ${x} 97.5 ${x - 6} 92Z" fill="#24307A"/><path d="M${x} 89.5 ${x + 2.6} 92 ${x} 94.5 ${x - 2.6} 92Z" fill="#F3D58C"/>`).join("")}</g>
      <g transform="translate(17 8) scale(.66)">${champa(100).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g></svg>`;
  }

  // Corner ornament (kanok flame curl) for framing QR codes.
  const kanok = (color = "#C9962B") => `<svg viewBox="0 0 44 44" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 41V17C3 8.7 8.7 3 17 3h24"/><path d="M17 3c-6 0-8.6 4.6-6.6 8.4 1.6 3 6.4 2.6 6.4-1 0-2-1.6-3-3-2.6"/><path d="M3 17c0 6 4.6 8.6 8.4 6.6 3-1.6 2.6-6.4-1-6.4-2 0-3 1.6-2.6 3"/><path d="M24 3c-1 2.4-.4 4.4 1.6 5.4M3 24c2.4-1 4.4-.4 5.4 1.6" stroke-width="1.8"/><circle cx="34" cy="3" r="1.6" fill="${color}" stroke="none"/><circle cx="3" cy="34" r="1.6" fill="${color}" stroke="none"/></svg>`;

  // Small country marks for where a customer comes from (drawn, not emoji, so every phone shows them).
  const FLAG = {
    cn: '<rect width="30" height="20" fill="#DE2910"/><path d="m6 3.2 1 3 3.1 0-2.5 1.9.9 3-2.5-1.8-2.5 1.8.9-3L1.9 6.2 5 6.2z" fill="#FFDE00"/><circle cx="11.5" cy="3" r=".9" fill="#FFDE00"/><circle cx="13" cy="5.3" r=".9" fill="#FFDE00"/><circle cx="13" cy="8.3" r=".9" fill="#FFDE00"/><circle cx="11.5" cy="10.4" r=".9" fill="#FFDE00"/>',
    th: '<rect width="30" height="20" fill="#A51931"/><rect y="3.3" width="30" height="13.4" fill="#F4F5F8"/><rect y="6.7" width="30" height="6.6" fill="#2D2A4A"/>',
    vn: '<rect width="30" height="20" fill="#DA251D"/><path d="m15 4.2 1.5 4.5h4.8l-3.9 2.8 1.5 4.5-3.9-2.8-3.9 2.8 1.5-4.5-3.9-2.8h4.8z" fill="#FFFF00"/>',
    kr: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="4.6" fill="#CD2E3A"/><path d="M10.4 10a4.6 4.6 0 0 0 9.2 0 2.3 2.3 0 0 0-4.6 0 2.3 2.3 0 0 1-4.6 0Z" fill="#0047A0"/><path d="M4 4.5l3 2M4.8 3.3l3 2M3.2 5.7l3 2M22.8 13.3l3 2M22 14.5l3 2M23.6 12.1l3 2M4 15.5l3-2M4.8 16.7l3-2M3.2 14.3l3-2M22.8 6.7l3-2M22 5.5l3-2M23.6 7.9l3-2" stroke="#111" stroke-width=".9"/>',
    la: '<rect width="30" height="20" fill="#CE1126"/><rect y="5" width="30" height="10" fill="#002868"/><circle cx="15" cy="10" r="4" fill="#fff"/>',
    other: '<rect width="30" height="20" fill="#E9DEC9"/><circle cx="15" cy="10" r="5" fill="none" stroke="#8D879E" stroke-width="1.4"/><path d="M10 10h10M15 5c1.6 1.4 2.2 3 2.2 5s-.6 3.6-2.2 5c-1.6-1.4-2.2-3-2.2-5s.6-3.6 2.2-5Z" fill="none" stroke="#8D879E" stroke-width="1.1"/>',
  };
  const flag = (code, w = 26) => `<svg class="flag" width="${w}" height="${(w * 2) / 3}" viewBox="0 0 30 20" style="border-radius:4px;box-shadow:0 0 0 1px rgba(0,0,0,.08);flex:none" aria-hidden="true">${FLAG[code] || FLAG.other}</svg>`;

  // ---- Big illustration: Luang Prabang at dusk ---------------------------------
  // Karst hills, That Luang, a wat roof with chofa finials, the Mekong with a
  // long-tail boat, festival lanterns and champa. Light, warm palette.
  function scene(opt = {}) {
    const h = opt.h || 220, id = "sc" + Math.random().toString(36).slice(2, 6);
    const lanterns = [[40, "#C8102E"], [96, "#C9962B"], [152, "#24307A"], [208, "#C8102E"], [262, "#C9962B"], [318, "#24307A"], [368, "#C8102E"]]
      .map(([x, c]) => { const t = x / 400; return [x, (1 - t) * (1 - t) * 6 + 2 * (1 - t) * t * 54, c]; });
    return `<svg viewBox="0 0 400 ${h}" width="100%" preserveAspectRatio="xMidYMax slice" aria-hidden="true" style="display:block">
<defs>
  <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF6EA"/><stop offset=".55" stop-color="#FCE6C8"/><stop offset="1" stop-color="#F9D2A8"/></linearGradient>
  <radialGradient id="${id}sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE7A3"/><stop offset=".55" stop-color="#F8C75A"/><stop offset="1" stop-color="#F8C75A" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC3CF"/><stop offset="1" stop-color="#5E93AA"/></linearGradient>
  <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6D27A"/><stop offset="1" stop-color="#C9962B"/></linearGradient>
</defs>
<rect width="400" height="${h}" fill="url(#${id}s)"/>
<circle cx="292" cy="${h - 112}" r="60" fill="url(#${id}sun)"/>
<circle cx="292" cy="${h - 112}" r="22" fill="#FBD372"/>
<path d="M0 ${h - 92} C30 ${h - 130} 46 ${h - 140} 62 ${h - 118} C74 ${h - 160} 98 ${h - 166} 112 ${h - 124} C130 ${h - 150} 150 ${h - 146} 166 ${h - 112} C190 ${h - 128} 214 ${h - 118} 236 ${h - 102} C262 ${h - 140} 290 ${h - 150} 318 ${h - 110} C338 ${h - 136} 366 ${h - 142} 400 ${h - 104} V${h} H0Z" fill="#D9C3DE" opacity=".75"/>
<path d="M0 ${h - 70} C24 ${h - 100} 44 ${h - 104} 60 ${h - 84} C80 ${h - 118} 104 ${h - 116} 120 ${h - 80} C150 ${h - 96} 178 ${h - 92} 204 ${h - 74} C232 ${h - 92} 262 ${h - 104} 296 ${h - 78} C324 ${h - 100} 360 ${h - 102} 400 ${h - 76} V${h} H0Z" fill="#9D96C7"/>
<g transform="translate(78 ${h - 140})">
  <path d="M22 0v14" stroke="#C9962B" stroke-width="2"/>
  <path d="M18.5 14h7l2 12h-11z" fill="url(#${id}g)"/>
  <path d="M12 26h20l3 14H9z" fill="url(#${id}g)"/>
  <path d="M4 40h36l4 12H0z" fill="url(#${id}g)"/>
  <path d="M-6 52h56v8h-56z" fill="#E4B550"/>
  <path d="M22 14v46" stroke="#FFF2C6" stroke-opacity=".55" stroke-width="2"/>
</g>
<path d="M0 ${h - 52} C40 ${h - 62} 80 ${h - 60} 120 ${h - 54} C170 ${h - 46} 210 ${h - 50} 250 ${h - 56} C300 ${h - 62} 350 ${h - 58} 400 ${h - 52} V${h} H0Z" fill="#5E63A8"/>
<g transform="translate(250 ${h - 104})">
  <path d="M8 50h108v18H8z" fill="#FFF8EA"/>
  <path d="M18 50h10v18H18zM48 50h10v18H48zM78 50h10v18H78zM98 50h10v18H98z" fill="#C9962B" opacity=".55"/>
  <path d="M58 4 L62 -8 L66 4Z M59.5 -1h5" fill="#C9962B" stroke="#C9962B" stroke-width="1.2"/><circle cx="62" cy="-15" r="1.8" fill="#C9962B"/>
  <path d="M-8 50 L20 32 H104 L132 50 Z" fill="#B8322A"/>
  <path d="M8 34 L34 16 H90 L116 34 Z" fill="#C8102E"/>
  <path d="M30 18 L50 4 H74 L94 18 Z" fill="#B8322A"/>
  <path d="M-8 50 L20 32 H104 L132 50" fill="none" stroke="#C9962B" stroke-width="2.2"/>
  <path d="M8 34 L34 16 H90 L116 34" fill="none" stroke="#C9962B" stroke-width="2"/>
  <path d="M30 18 L50 4 H74 L94 18" fill="none" stroke="#C9962B" stroke-width="1.8"/>
  <path d="M-8 50c-4-1-6-5-3-8M132 50c4-1 6-5 3-8M8 34c-4-1-5-5-2-7M116 34c4-1 5-5 2-7M62 4V-14" fill="none" stroke="#C9962B" stroke-width="2" stroke-linecap="round"/>
</g>
<path d="M0 ${h - 40} H400 V${h} H0Z" fill="url(#${id}r)"/>
<path d="M18 ${h - 28}h40M120 ${h - 20}h60M236 ${h - 30}h34M300 ${h - 14}h54M70 ${h - 10}h30" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>
<g transform="translate(150 ${h - 34})"><g class="float">
  <path d="M0 6 C20 16 70 16 96 2 L90 10 C66 20 22 20 4 12Z" fill="#6B4226"/>
  <path d="M30 7c2-9 8-12 15-12s13 3 15 12" fill="#C8102E"/>
  <path d="M30 7c2-9 8-12 15-12s13 3 15 12" fill="none" stroke="#C9962B" stroke-width="1.6"/>
  <path d="M90 4l8-6" stroke="#6B4226" stroke-width="2" stroke-linecap="round"/>
</g></g>
<g transform="translate(6 ${h - 118})">
  <path d="M26 88 C24 60 22 36 30 14" stroke="#7A5634" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M30 14c-12-6-24-4-30 6 10-4 20-4 30-6ZM30 14c-4-12-14-18-26-16 10 4 18 8 26 16ZM30 14c8-12 20-14 30-8-12 0-20 3-30 8ZM30 14c12-2 22 4 26 14-8-6-16-10-26-14Z" fill="#2E7D5B"/>
</g>
<path d="M0 6 Q200 ${54} 400 0" fill="none" stroke="#8B6A3A" stroke-width="1.2" opacity=".6"/>
${lanterns.map(([x, y, c], i) => `<g transform="translate(${x} ${y})"><g class="sway" style="animation-delay:${-i * 0.6}s"><path d="M0 0v6" stroke="#8B6A3A" stroke-width="1"/><path d="M0 6c6 0 9 4 9 9s-3 9-9 9-9-4-9-9 3-9 9-9Z" fill="${c}"/><path d="M0 6c-3 2-4 5-4 9s1 7 4 9M0 6c3 2 4 5 4 9s-1 7-4 9" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/><path d="M-4 6h8M-4 24h8" stroke="#C9962B" stroke-width="2"/><path d="M0 24v6" stroke="${c}" stroke-width="1.5"/></g></g>`).join("")}
<g transform="translate(360 ${h - 40}) scale(.42)">${champa(100).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>
<g transform="translate(332 ${h - 26}) scale(.3)">${champa(100).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>
<path d="M200 ${h - 150} l5 4 5-4M222 ${h - 162} l4 3 4-3" stroke="#6E5A80" stroke-width="1.4" fill="none" stroke-linecap="round"/>
</svg>`;
  }

  // Elephant (Lane Xang, land of a million elephants) wearing a sinh saddle cloth.
  function elephant(w = 150) {
    return `<svg width="${w}" viewBox="0 0 160 120" aria-hidden="true">
      <ellipse cx="80" cy="112" rx="58" ry="6" fill="#E9DEC9"/>
      <path d="M40 58c0-24 18-38 44-38 28 0 46 16 46 42v40h-14v-22h-10v22H92V86H66v16H52V80c-8-4-12-12-12-22Z" fill="#8C93BE"/>
      <path d="M40 58c-10 0-18 8-18 20 0 10 4 16 4 24 0 4-4 6-8 6" fill="none" stroke="#8C93BE" stroke-width="10" stroke-linecap="round"/>
      <path d="M52 42c-12 0-18 10-14 22 3 9 12 12 20 10" fill="#7880AE"/>
      <circle cx="44" cy="52" r="2.6" fill="#1C1A2B"/>
      <path d="M70 28h44c6 10 6 26 0 36H70c-4-12-4-24 0-36Z" fill="#C8102E"/>
      <path d="M70 32h44M70 60h44" stroke="#C9962B" stroke-width="2.4"/>
      ${[78, 92, 106].map((x) => `<path d="M${x} 38l6 8-6 8-6-8z" fill="#24307A"/><path d="M${x} 42.5l2.6 3.5-2.6 3.5-2.6-3.5z" fill="#F3D58C"/>`).join("")}
      <g transform="translate(92 4) scale(.24)">${champa(100).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>
    </svg>`;
  }

  g.G = { icon, P, CAT, champa, logo, kanok, flag, scene, elephant };
})(window);
