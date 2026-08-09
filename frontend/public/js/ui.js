/* ============ SERVEHUB UI HELPERS ============ */
window.U = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const ICONS = {
    home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    users:'<circle cx="9" cy="8" r="4"/><path d="M2 21c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5"/><path d="M16 4.6a4 4 0 0 1 0 7"/><path d="M18.3 15.9c2.1.6 3.7 2 3.7 5.1"/>',
    star:'<path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z"/>',
    starF:'<path fill="currentColor" stroke="none" d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"/>',
    video:'<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    location:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    wallet:'<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
    card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    percent:'<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    heart:'<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3.4 1-4.5 2.5C10.9 4 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    wrench:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z"/>',
    sparkles:'<path d="m12 3 1.9 5.6 5.6 1.4-5.6 1.9L12 17.5l-1.9-5.6-5.6-1.4 5.6-1.9z"/><path d="M19 15v4M17 17h4"/>',
    shield:'<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10z"/>',
    shieldCheck:'<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    check:'<path d="m20 6-11 11-5-5"/>',
    checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 5-5"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
    chevronDown:'<path d="m6 9 6 6 6-6"/>',
    chevronRight:'<path d="m9 6 6 6-6 6"/>',
    arrowRight:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowLeft:'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
    upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    gift:'<rect x="3" y="8" width="18" height="4"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    award:'<circle cx="12" cy="8" r="6"/><path d="M8.6 13.5 7 22l5-3 5 3-1.6-8.5"/>',
    crown:'<path d="m2 18 2-10 5 4L12 4l3 8 5-4 2 10z"/>',
    zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    headset:'<path d="M3 13a9 9 0 0 1 18 0"/><path d="M4 13a2 2 0 0 1 2-2h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2z"/><path d="M20 13a2 2 0 0 0-2-2h-1a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2z"/><path d="M6 13v1a6 6 0 0 0 12 0v-1"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff:'<path d="M2 12s3.5-7 10-7c1.7 0 3.2.6 4.5 1.4M6.6 6.6C4.5 7.9 3.1 10 2.4 12c1.9 4.3 5.7 7 9.6 7 2 0 3.9-.7 5.5-1.9"/><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c3.9 0 7.7 2.7 9.6 7-.4.9-.9 1.8-1.5 2.6"/><path d="m3 3 18 18"/>',
    edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    trash:'<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    minus:'<path d="M5 12h14"/>',
    filter:'<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
    navigation:'<path d="m3 11 19-9-9 19-2-8-8-2z"/>',
    truck:'<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    thumbsUp:'<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
    download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
    briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    barChart:'<path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>',
    lineChart:'<path d="m3 17 6-6 4 4 8-8"/><path d="M21 7h-4v-4"/>',
    building:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    coins:'<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.4 18.1"/><path d="M7 6h1v4"/><path d="m16.7 10.3.9.9"/>',
    refresh:'<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/>',
    alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    graduation:'<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/><path d="M22 10v6"/>',
    droplet:'<path d="M12 2.7s6.5 6.9 6.5 11.3a6.5 6.5 0 0 1-13 0C5.5 9.6 12 2.7 12 2.7z"/>',
    droplets:'<path d="M12 2.7s6.5 6.9 6.5 11.3a6.5 6.5 0 0 1-13 0C5.5 9.6 12 2.7 12 2.7z"/><path d="M8.5 14a3.5 3.5 0 0 0 3.5 3.5"/>',
    snowflake:'<path d="M12 2v20M2 12h20M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>',
    hammer:'<path d="m15 12-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9"/><path d="M17.6 6.4a2 2 0 0 0 0-2.8L14 0l-4 4 3.6 3.6a2 2 0 0 0 2.8 0l3.8-3.8a1.8 1.8 0 0 1 2.5 2.5z"/>',
    brush:'<path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>',
    scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
    bug:'<path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="m8 2 1.9 1.9M16 2l-1.9 1.9M9 7v-1a3 3 0 0 1 6 0v1"/><path d="M6.5 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M17.5 9c1.9-.2 3.5-1.9 3.5-4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>',
    monitor:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    flower:'<circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/><path d="M12 7.5V9M12 15v1.5M7.5 12H9M15 12h1.5"/>',
    lotus:'<path d="M12 20c-4.5 0-8-3-8-7 2 0 4 1 5.5 2.5"/><path d="M12 20c4.5 0 8-3 8-7-2 0-4 1-5.5 2.5"/><path d="M12 20V10"/><path d="M12 10c-1-2.5-3.5-4-6.5-4 .5 2.5 2 4.5 4.5 5"/><path d="M12 10c1-2.5 3.5-4 6.5-4-.5 2.5-2 4.5-4.5 5"/>',
    leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    external:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    printer:'<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    tag:'<path d="M12.6 2H2v10.6L13.4 24a2 2 0 0 0 2.8 0l7.8-7.8a2 2 0 0 0 0-2.8z"/><circle cx="7" cy="7" r="1.5"/>',
    play:'<path d="m6 4 14 8-14 8z"/>',
    map:'<path d="M9 3 3.5 5v16L9 19l6 2 5.5-2V3L15 5z"/><path d="M9 3v16M15 5v16"/>',
    timer:'<path d="M10 2h4"/><path d="M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
    badgeCheck:'<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    rocket:'<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    key:'<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
    calendarX:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m10 14 4 4M14 14l-4 4"/>',
    refreshCw:'<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    loader:'<path d="M21 12a9 9 0 1 1-6.2-8.6"/><path d="M21 3v5h-5"/>',
    pause:'<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    play:'<path d="m7 4 13 8-13 8z"/>',
    server:'<rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2"/><path d="M6 6.5h.01M6 17.5h.01"/>',
    cash:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9h.01M18 15h.01"/>',
    android:'<path d="M6 7h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="9" cy="12.2" r="1.2"/><circle cx="15" cy="12.2" r="1.2"/><path d="M8 6.6 6.6 3M16 6.6l1.4-3.6"/>',
    smartphone:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    credit:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>',
    bank:'<path d="m3 9 9-6 9 6"/><path d="M4 9v11M9 9v11M15 9v11M20 9v11M2 21h20"/>',
    save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    activity:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    trendingUp:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    toggle:'<rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="16" cy="12" r="3"/>',
    send2:'<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
    walletCard:'<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  };
  const icon = (name, size, cls = '') => {
    const p = ICONS[name] || ICONS.help;
    const s = size ? `width:${size}px;height:${size}px` : '';
    return `<svg class="ic ${cls}" style="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  };

  const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const stars = (r, size) => {
    let h = '<span class="stars" role="img" aria-label="' + r + ' out of 5">';
    for (let i = 1; i <= 5; i++) h += `<span style="color:${i <= Math.round(r) ? '#F59E0B' : 'var(--line)'}">${icon(i <= Math.round(r) ? 'starF' : 'star', size || 13)}</span>`;
    return h + '</span>';
  };
  const ratingPill = r => `<span class="rating">${icon('star')}${r}</span>`;

  const avatar = (name, size = 40, seed = 0) => {
    const initials = (name || 'S H').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const grads = ['linear-gradient(135deg,#2563EB,#0EA5E9)', 'linear-gradient(135deg,#10B981,#14B8A6)', 'linear-gradient(135deg,#8B5CF6,#EC4899)', 'linear-gradient(135deg,#F59E0B,#F97316)', 'linear-gradient(135deg,#F43F5E,#EC4899)', 'linear-gradient(135deg,#0EA5E9,#6366F1)'];
    const g = grads[Math.abs((name || '').length + (seed || 0)) % grads.length];
    return `<span class="ava" style="width:${size}px;height:${size}px;font-size:${size * 0.36}px;background:${g}">${initials}</span>`;
  };

  const uid = p => p + Math.floor(1000 + Math.random() * 9000);
  const rand = (a, b) => a + Math.random() * (b - a);
  const debounce = (fn, ms = 250) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const fmtDate = ts => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtTime = ts => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const timeAgo = ts => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  };

  /* ---- toasts ---- */
  const toastWrap = () => document.getElementById('toasts');
  const toast = (msg, type = 'success') => {
    const colors = { success: ['#10B981', 'check'], error: ['#EF4444', 'alert'], info: ['#3B82F6', 'info'], warn: ['#F59E0B', 'alert'] };
    const [c, ic] = colors[type] || colors.info;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="t-ic" style="background:${c}22;color:${c}">${icon(ic, 15)}</span><span>${msg}</span>`;
    toastWrap().appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 3200);
  };

  /* ---- modal ---- */
  const openModal = (inner, opts = {}) => {
    const back = document.createElement('div');
    back.className = 'modal-backdrop';
    back.innerHTML = `<div class="modal ${opts.wide ? 'search-modal' : ''}" role="dialog" aria-modal="true" style="max-width:${opts.wide ? 640 : 480}px">${inner}</div>`;
    back.addEventListener('click', e => { if (e.target === back && opts.dismiss !== false) closeModal(); });
    document.getElementById('modals').appendChild(back);
    document.body.style.overflow = 'hidden';
    const inp = back.querySelector('input'); if (inp) setTimeout(() => inp.focus(), 60);
    return back;
  };
  const closeModal = () => { const m = document.getElementById('modals'); m.innerHTML = ''; document.body.style.overflow = ''; };
  const modalShell = (title, body, foot = '') =>
    `<div class="modal-head"><h3>${title}</h3><button class="icon-btn" data-act="close-modal" aria-label="Close">${icon('x')}</button></div><div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}`;

  /* ---- skeleton ---- */
  const skel = (w = '100%', h = 14, r = 8, style = '') => `<div class="skel" style="width:${w};height:${h}px;border-radius:${r}px;${style}"></div>`;
  const pageSkel = (kind = 'grid') => {
    if (kind === 'hero') return `<div class="container" style="padding-top:120px">${skel('60%', 44)}<br>${skel('42%', 16)}<br><br>${skel('90%', 64, 20)}<br><br><div style="display:flex;gap:16px">${skel('30%', 130, 16)}${skel('30%', 130, 16)}${skel('30%', 130, 16)}</div></div>`;
    return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;padding:24px">${skel('100%', 150, 16)}${skel('100%', 150, 16)}${skel('100%', 150, 16)}${skel('100%', 150, 16)}${skel('100%', 150, 16)}${skel('100%', 150, 16)}</div>`;
  };

  /* ---- reveal + counters ---- */
  const observeReveals = root => {
    const els = (root || document).querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.08 });
    els.forEach(e => io.observe(e));
  };
  const countUp = (el, target, dur = 1100) => {
    if (!el) return;
    const t0 = performance.now();
    const step = t => { const p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN'); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  /* ---- charts ---- */
  const areaChart = (data, { color = '#2563EB', height = 220, labels = [] } = {}) => {
    const W = 600, H = height, pad = 26;
    const max = Math.max(...data) * 1.15, min = 0;
    const px = i => pad + (i * (W - pad * 2)) / Math.max(data.length - 1, 1);
    const py = v => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
    const pts = data.map((v, i) => `${px(i)},${py(v)}`).join(' ');
    const gid = 'g' + Math.random().toString(36).slice(2, 7);
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
      ${[0.25, 0.5, 0.75].map(f => `<line x1="${pad}" x2="${W - pad}" y1="${pad + f * (H - pad * 2)}" y2="${pad + f * (H - pad * 2)}" stroke="var(--line)" stroke-dasharray="4 5"/>`).join('')}
      <polygon points="${pad},${H - pad} ${pts} ${px(data.length - 1)},${H - pad}" fill="url(#${gid})"/>
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${data.map((v, i) => `<circle cx="${px(i)}" cy="${py(v)}" r="3.5" fill="${color}" stroke="#fff" stroke-width="2"><title>${v}</title></circle>`).join('')}
      ${labels.map((l, i) => `<text x="${px(i)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="var(--ink-4)">${l}</text>`).join('')}
    </svg>`;
  };
  const barChart = (data, labels, { unit = '' } = {}) =>
    `<div class="bars">${data.map((v, i) => {
      const max = Math.max(...data) || 1;
      return `<div class="bar"><span class="bar-val">${v}${unit}</span><div class="bar-fill" style="height:0" data-h="${(v / max) * 100}%"></div><span class="bar-lbl">${labels[i]}</span></div>`;
    }).join('')}</div>`;
  const animateBars = root => (root || document).querySelectorAll('.bar-fill[data-h]').forEach((b, i) => setTimeout(() => b.style.height = b.dataset.h, 80 + i * 60));
  const donut = (segments, centerTop, centerBottom) => {
    const total = segments.reduce((a, s) => a + s.value, 0) || 1;
    let acc = 0; const C = 2 * Math.PI * 70;
    const rings = segments.map(s => { const frac = s.value / total; const dash = frac * C; const el = `<circle r="70" cx="95" cy="95" fill="none" stroke="${s.color}" stroke-width="22" stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-acc * C}" stroke-linecap="butt"><title>${s.label}: ${s.value}</title></circle>`; acc += frac; return el; }).join('');
    return `<div class="donut"><svg viewBox="0 0 190 190" style="width:100%;height:auto"><circle r="70" cx="95" cy="95" fill="none" stroke="var(--surface-2)" stroke-width="22"/>${rings}</svg><div class="donut-center"><div><div style="font-size:26px;font-weight:900">${centerTop}</div><div class="xsmall muted">${centerBottom}</div></div></div></div>`;
  };

  /* ---- misc builders ---- */
  const crumbs = items => `<nav class="crumbs" aria-label="Breadcrumb">${items.map((it, i) => it.href ? `<a href="#/${it.href}">${it.label}</a>${i < items.length - 1 ? '<span>/</span>' : ''}` : `<span>${it.label}</span>`).join('')}</nav>`;
  const statusPill = key => {
    const m = Store.STATUSES.find(s => s.key === key);
    if (m) return `<span class="badge ${m.cls}">${icon(m.icon, 12)}${m.label}</span>`;
    const map = { cancelled: ['x', 'Cancelled', 'badge-danger'], rejected: ['x', 'Rejected', 'badge-danger'] };
    const fallback = map[key] || ['alert', key[0].toUpperCase() + key.slice(1), 'badge-neutral'];
    return `<span class="badge ${fallback[2]}">${icon(fallback[0], 12)}${fallback[1]}</span>`;
  };

  /* ---- stepper ---- */
  const stepper = (steps, current) => `<ol class="steps" style="list-style:none">${steps.map((s, i) => {
    const state = i < current ? 'done' : i === current ? 'active' : '';
    return `<li class="step ${state}"><span class="s-dot">${i < current ? icon('check', 15) : i + 1}</span><span>${s}</span></li>`;
  }).join('')}</ol>`;

  /* ---- accordion / tabs / carousel wiring ---- */
  const wireAcc = root => (root || document).querySelectorAll('.acc').forEach(a => {
    const head = a.querySelector('.acc-head');
    head.addEventListener('click', () => { const open = a.classList.contains('open'); $$('.acc.open', root).forEach(x => { x.classList.remove('open'); x.querySelector('.acc-body').style.maxHeight = '0'; }); if (!open) { a.classList.add('open'); a.querySelector('.acc-body').style.maxHeight = a.querySelector('.acc-body').scrollHeight + 'px'; } });
  });
  const wireTabs = root => (root || document).querySelectorAll('[data-tabs]').forEach(grp => {
    const panels = $$('[data-panel]', grp);
    $$('.tab-btn', grp).forEach(btn => btn.addEventListener('click', () => {
      $$('.tab-btn', grp).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      panels.forEach(p => p.hidden = p.dataset.panel !== btn.dataset.tab);
    }));
  });
  const wireCarousel = root => (root || document).querySelectorAll('[data-carousel]').forEach(c => {
    const track = $('.car-track', c);
    const step = 340;
    $('.car-btn.prev', c)?.addEventListener('click', () => track.scrollBy({ left: -step, behavior: 'smooth' }));
    $('.car-btn.next', c)?.addEventListener('click', () => track.scrollBy({ left: step, behavior: 'smooth' }));
  });

  const skeletonWrap = (root, inner, ms = 420) => {
    root.innerHTML = pageSkel();
    setTimeout(() => { root.innerHTML = inner; observeReveals(root); }, ms);
  };

  const fileToDataURL = file => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });

  const genMap = () => `<div class="map" style="height:320px">
      <div class="m-road" style="top:22%;left:0;right:0"></div>
      <div class="m-road" style="top:64%;left:0;right:0"></div>
      <div class="m-road v" style="left:24%;top:0;bottom:0"></div>
      <div class="m-road v" style="left:58%;top:0;bottom:0"></div>
      <div class="m-road v" style="left:82%;top:0;bottom:0"></div>
      <div class="m-block" style="top:12%;left:8%;width:64px;height:40px"></div>
      <div class="m-block" style="top:38%;left:34%;width:80px;height:52px"></div>
      <div class="m-block" style="top:76%;left:66%;width:60px;height:40px"></div>
      <div class="m-block" style="top:10%;left:70%;width:72px;height:46px"></div>
      <div class="m-route" style="top:55%"></div>
      <div class="m-pin" style="top:64%;left:22%;transform:rotate(-45deg)"><i>${icon('home', 15, '')}</i></div>
      <div class="m-pin" style="top:50%;left:84%;background:var(--primary);box-shadow:0 4px 12px rgba(37,99,235,.5);transform:rotate(-45deg)"><i>${icon('zap', 15, '')}</i></div>
      <div class="m-eta"><span class="dot-blue"></span>ETA ~8 min</div>
    </div>`;

  return { $, $$, icon, money, esc, stars, ratingPill, avatar, uid, rand, debounce, fmtDate, fmtTime, timeAgo, toast, openModal, closeModal, modalShell, skel, pageSkel, observeReveals, countUp, areaChart, barChart, animateBars, donut, crumbs, statusPill, stepper, wireAcc, wireTabs, wireCarousel, skeletonWrap, fileToDataURL, genMap };
})();
