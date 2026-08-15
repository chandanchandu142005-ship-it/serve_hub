/* ============ SERVEHUB API BASE ============
   Auto-detects the backend host so login works from the laptop
   (localhost) AND from a phone on the same Wi-Fi (LAN IP).
   Override anytime with window.SERVEHUB_API. */
window.SH_API = (() => {
  if (window.SERVEHUB_API) return window.SERVEHUB_API;
  const h = ((location && location.hostname) || '').toLowerCase();
  // Empty hostname = page opened directly from disk (file://) — use localhost.
  if (/^(|localhost|127\.0\.0\.1|0\.0\.0\.0|::1)$/.test(h)) return 'http://localhost:4000/api';
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) return `http://${h}:4000/api`;
    return '/api';
  }
  // IPv6 hostnames need brackets: http://[fe80::1]:4000/api
  return h.includes(':') ? `http://[${h}]:4000/api` : `http://${h}:4000/api`;
})();

/* ============ PWA — installable app for phone + laptop ============
   Exposes window.SH_PWA: captures the browser's beforeinstallprompt,
   registers the service worker (offline shell), and reports whether the
   app is installed (standalone) or installable. UI lives in app.js. */
window.SH_PWA = (() => {
  let deferredPrompt = null;
  const isStandalone = () =>
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
  const canInstall = () => !!deferredPrompt && !isStandalone();
  const init = () => {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
      document.dispatchEvent(new CustomEvent('sh:pwa-ready'));
    });
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      document.dispatchEvent(new CustomEvent('sh:pwa-installed'));
    });
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => { /* non-secure context etc. */ });
      });
    }
    if (isStandalone()) document.dispatchEvent(new CustomEvent('sh:pwa-standalone'));
  };
  const promptInstall = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    let accepted = false;
    try { const choice = await deferredPrompt.userChoice; accepted = choice.outcome === 'accepted'; } catch (e) { /* dismissed */ }
    deferredPrompt = null;
    return accepted;
  };
  return { init, isStandalone, canInstall, promptInstall };
})();

/* ============ SERVEHUB STATE (localStorage) ============ */
window.Store = (() => {
  const P = 'sh:';
  const load = (k, d) => { try { const v = localStorage.getItem(P + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} };

  const STATUSES = [
    { key: 'confirmed', label: 'Booking Confirmed', icon: 'check', cls: 'badge-success' },
    { key: 'assigned',  label: 'Professional Assigned', icon: 'user', cls: 'badge-primary' },
    { key: 'arriving',  label: 'Professional Arriving', icon: 'navigation', cls: 'badge-primary' },
    { key: 'started',   label: 'Service Started', icon: 'zap', cls: 'badge-warn' },
    { key: 'completed', label: 'Service Completed', icon: 'check', cls: 'badge-success' },
    { key: 'paid',      label: 'Payment Complete', icon: 'card', cls: 'badge-success' },
    { key: 'rated',     label: 'Rate Experience', icon: 'star', cls: 'badge-neutral' },
  ];

  const state = {
    user: load('user', null),
    theme: load('theme', 'light'),
    lang: load('lang', 'en'),
    bookings: load('bookings', []),
    wallet: load('wallet', 250),
    points: load('points', 120),
    favs: load('favs', []),        // professional ids
    wish: load('wish', []),        // service ids
    addr: load('addr', [
      { id: 'a1', label: 'Home', line: 'B-402, Sunrise Residency, Linking Road', city: 'Mumbai', area: 'Bandra', pin: '400050', primary: true },
      { id: 'a2', label: 'Office', line: '15th Floor, One Hub Tower, BKC', city: 'Mumbai', area: 'BKC', pin: '400051', primary: false },
    ]),
    notifs: load('notifs', []),
    tickets: load('tickets', []),
    chats: load('chats', {}),
    plan: load('plan', 'free'),
    // Selected city/area (displayed as "📍 Bengaluru, Karnataka"). Migrates
    // the legacy sh:city key; never stores exact coordinates.
    location: load('location', (() => { try { const c = localStorage.getItem('sh:city'); return c ? { city: c, area: '' } : { city: 'Mumbai', area: '' }; } catch (e) { return { city: 'Mumbai', area: '' }; } })()),
    giftcards: load('giftcards', []),
    withdrawals: load('withdrawals', []),
    proApps: load('proApps', []),
    coupons: load('coupons', []),   // unlocked coupon codes
    settings: load('settings', { push: true, email: true, sms: false, whatsapp: true, saveCards: true }),
  };

  const persist = () => { Object.keys(state).forEach(k => save(k, state[k])); };

  const currentUser = () => state.user;
  const isLoggedIn = () => !!state.user;
  const login = u => {
    state.user = u;
    if (u && u.token) localStorage.setItem('sh:token', u.token);
    else localStorage.removeItem('sh:token');
    persist();
  };
  const logout = () => { state.user = null; localStorage.removeItem('sh:token'); persist(); };

  const statusIndex = b => STATUSES.findIndex(s => s.key === b.status);
  const statusMeta = b => STATUSES[Math.max(0, Math.min(statusIndex(b), STATUSES.length - 1))];

  const addNotif = (icon, title, msg, type = 'badge-primary') => {
    state.notifs.unshift({ id: 'n' + Date.now(), icon, title, msg, type, time: Date.now(), read: false });
    if (state.notifs.length > 40) state.notifs.pop();
    persist();
  };

  const addBooking = (o) => {
    const b = { id: 'SH' + Math.floor(100000 + Math.random() * 900000), status: 'confirmed', createdAt: Date.now(), invoiceNo: 'INV-' + Math.floor(100000 + Math.random() * 900000), ...o };
    state.bookings.unshift(b);
    persist();
    return b;
  };
  const bookingById = id => state.bookings.find(b => b.id === id);

  const advanceBooking = (id, to) => {
    const b = bookingById(id); if (!b) return null;
    let idx = STATUSES.findIndex(s => s.key === b.status);
    if (to) idx = STATUSES.findIndex(s => s.key === to);
    else idx = Math.min(idx + 1, STATUSES.length - 1);
    b.status = STATUSES[idx].key;
    if (b.status === 'completed') {
      b.cashback = Math.round(b.total * 0.1);
      state.wallet += b.cashback;
      const pts = 10;
      state.points += pts;
      addNotif('wallet', 'Cashback credited', `₹${b.cashback} added to your wallet + ${pts} reward points for ${b.id}.`);
    }
    if (b.status === 'paid') addNotif('card', 'Payment complete', `Your payment of ₹${b.total} for ${b.id} was successful.`);
    if (b.status === 'assigned') addNotif('user', 'Professional assigned', `${b.proName || 'Your expert'} is assigned to booking ${b.id}.`);
    if (b.status === 'arriving') addNotif('navigation', 'On the way', `${b.proName || 'Your expert'} is arriving for booking ${b.id}.`);
    persist();
    return b;
  };

  const rateBooking = (id, rating, text, tags, imgs) => {
    const b = bookingById(id); if (!b) return;
    if (b.status === 'cancelled' || b.status === 'rejected') return;
    b.rating = rating; b.rateText = text; b.rateTags = tags; b.rateImgs = imgs || [];
    if (statusIndex(b) < STATUSES.length - 1) b.status = 'rated';
    if (rating >= 4) state.points += 15;
    addNotif('star', 'Thanks for rating!', `You earned ${rating >= 4 ? '15 bonus' : ''} reward points for rating booking ${b.id}.`);
    persist();
  };

  const toggleFav = pid => { const i = state.favs.indexOf(pid); i >= 0 ? state.favs.splice(i, 1) : state.favs.push(pid); persist(); return i < 0; };
  const toggleWish = sid => { const i = state.wish.indexOf(sid); i >= 0 ? state.wish.splice(i, 1) : state.wish.push(sid); persist(); return i < 0; };
  const isFav = pid => state.favs.includes(pid);
  const isWish = sid => state.wish.includes(sid);

  const walletTx = (amt, note) => { state.wallet += amt; addNotif('wallet', amt >= 0 ? 'Wallet credited' : 'Wallet debited', `${amt >= 0 ? '+' : ''}₹${Math.abs(amt)} ${note}.`); persist(); };
  const addPoints = n => { state.points += n; persist(); };

  const applyCoupon = (code, sub) => {
    const c = DATA.coupons.find(x => x.code.toLowerCase() === code.toLowerCase());
    if (!c) return { ok: false, msg: 'Invalid coupon code' };
    if (sub < c.min) return { ok: false, msg: `Minimum order value ₹${c.min} required` };
    const disc = c.type === 'pct' ? Math.min(Math.round(sub * c.value / 100), c.cap || Infinity) : c.value;
    if (!state.coupons.includes(c.code)) { state.coupons.push(c.code); persist(); }
    return { ok: true, disc, c };
  };

  const sendMsg = (bookingId, text, from) => {
    if (!state.chats[bookingId]) state.chats[bookingId] = [];
    state.chats[bookingId].push({ id: 'm' + Date.now(), text, from, time: Date.now() });
    persist();
    return state.chats[bookingId];
  };
  const getChat = bookingId => state.chats[bookingId] || [];

  const createTicket = t => { state.tickets.unshift({ id: 'TK' + Math.floor(1000 + Math.random() * 9000), ...t, createdAt: Date.now(), status: 'open' }); addNotif('headset', 'Ticket created', `Support ticket ${state.tickets[0].id} has been raised.`); persist(); return state.tickets[0]; };
  const markAllRead = () => { state.notifs.forEach(n => n.read = true); persist(); };
  const unreadCount = () => state.notifs.filter(n => !n.read).length;

  const demoPro = () => ({ id: 'p2', name: 'Rahul Sharma', role: 'AC & Appliance Expert', phone: '+91 98765 43210' });

  /* ---- location (city/area only — never exact coordinates) ---- */
  const setLocation = loc => {
    state.location = { ...(state.location || {}), ...loc };
    try { localStorage.setItem('sh:city', state.location.city || ''); } catch (e) {}
    persist();
    return currentLocation();
  };
  const currentLocation = () => {
    const l = state.location || { city: 'Mumbai', area: '' };
    const city = window.DATA ? DATA.cities.find(c => c.name === l.city) : null;
    const label = l.area
      ? `${l.area}, ${l.city}`
      : city ? `${l.city}, ${city.state}` : l.city || 'Mumbai';
    return { ...l, label, state: city ? city.state : '' };
  };

  let selectedPhoto = null;
  const setSelectedPhoto = p => { selectedPhoto = p; };
  const getSelectedPhoto = () => selectedPhoto;
  const clearSelectedPhoto = () => { selectedPhoto = null; };

  return { state, persist, STATUSES, currentUser, isLoggedIn, login, logout, addBooking, bookingById, advanceBooking, rateBooking, statusIndex, statusMeta, toggleFav, toggleWish, isFav, isWish, walletTx, addPoints, applyCoupon, sendMsg, getChat, createTicket, markAllRead, unreadCount, addNotif, demoPro, setLocation, currentLocation, setSelectedPhoto, getSelectedPhoto, clearSelectedPhoto };
})();
