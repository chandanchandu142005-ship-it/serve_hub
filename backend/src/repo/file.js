/* JSON file store — same repository interface as pg.js, but persists to
   backend/data/store.json. Used automatically when PostgreSQL is unavailable,
   so the API runs anywhere with zero setup. */
const fs = require('fs');
const path = require('path');
const SEED = require('../db/seed-data');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

let db = null;
let timer = null;

function load() {
  if (db) return db;
  let existing = null;
  if (fs.existsSync(DATA_FILE)) {
    try { existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { /* corrupt → recreate */ }
  }
  if (existing) {
    // Migrate older store files: fill any collections added in later versions.
    existing.services = existing.services || JSON.parse(JSON.stringify(SEED.SERVICES));
    existing.pros = existing.pros || SEED.PROS.map((p, i) => ({ ...p, id: i + 1 }));
    existing.coupons = existing.coupons || JSON.parse(JSON.stringify(SEED.COUPONS));
    existing.plans = existing.plans || JSON.parse(JSON.stringify(SEED.PLANS));
    existing.reviews = existing.reviews || JSON.parse(JSON.stringify(SEED.REVIEWS));
    existing.giftCards = existing.giftCards || JSON.parse(JSON.stringify(SEED.GIFT_CARDS));
    existing.tickets = existing.tickets || JSON.parse(JSON.stringify(SEED.TICKETS));
    existing.seq = existing.seq || { user: 1, pro: SEED.PROS.length + 1, address: 1, notif: 1 };
    if (existing.seq.gift == null) existing.seq.gift = SEED.GIFT_CARDS.length + 1;
    if (existing.seq.review == null) existing.seq.review = SEED.REVIEWS.length + SEED.DEMO_REVIEWS.length + 1;
    if (existing.seq.ticket == null) existing.seq.ticket = SEED.TICKETS.length + 1;
    if (existing.seq.address == null) existing.seq.address = SEED.ADDRESSES.length + 1;
    if (existing.seq.notif == null) existing.seq.notif = SEED.NOTIFICATIONS.length + 1;
    if (existing.seq.wallet == null) existing.seq.wallet = SEED.WALLET_TXNS.length + 1;
    if (existing.seq.referral == null) existing.seq.referral = SEED.REFERRALS.length + 1;
    if (existing.seq.user == null || existing.seq.user <= SEED.DEMO_USER_ID) existing.seq.user = SEED.DEMO_USER_ID + 1;
    existing.addresses = existing.addresses || JSON.parse(JSON.stringify(SEED.ADDRESSES));
    existing.notifications = existing.notifications || JSON.parse(JSON.stringify(SEED.NOTIFICATIONS));
    existing.walletTxns = existing.walletTxns || JSON.parse(JSON.stringify(SEED.WALLET_TXNS));
    existing.referrals = existing.referrals || JSON.parse(JSON.stringify(SEED.REFERRALS));
    // merge demo reviews into older store files (they were seeded before the demo account)
    if (existing.reviews) {
      const have = new Set(existing.reviews.map(r => r.id));
      for (const r of SEED.DEMO_REVIEWS) if (!have.has(r.id)) existing.reviews.push(JSON.parse(JSON.stringify(r)));
    }
    // ensure the demo customer exists so per-user dashboard sections have content
    if (!existing.users.some(u => u.id === SEED.DEMO_USER.id)) existing.users.unshift(JSON.parse(JSON.stringify(SEED.DEMO_USER)));
    db = existing;
    return db;
  }
  db = {
    users: [JSON.parse(JSON.stringify(SEED.DEMO_USER))], pros: [], bookings: [],
    services: JSON.parse(JSON.stringify(SEED.SERVICES)),
    pros: SEED.PROS.map((p, i) => ({ ...p, id: i + 1 })),
    coupons: JSON.parse(JSON.stringify(SEED.COUPONS)),
    plans: JSON.parse(JSON.stringify(SEED.PLANS)),
    reviews: JSON.parse(JSON.stringify([...SEED.REVIEWS, ...SEED.DEMO_REVIEWS])),
    giftCards: JSON.parse(JSON.stringify(SEED.GIFT_CARDS)),
    tickets: JSON.parse(JSON.stringify(SEED.TICKETS)),
    addresses: JSON.parse(JSON.stringify(SEED.ADDRESSES)),
    notifications: JSON.parse(JSON.stringify(SEED.NOTIFICATIONS)),
    walletTxns: JSON.parse(JSON.stringify(SEED.WALLET_TXNS)),
    referrals: JSON.parse(JSON.stringify(SEED.REFERRALS)),
    seq: { user: SEED.DEMO_USER_ID + 1, pro: SEED.PROS.length + 1, gift: SEED.GIFT_CARDS.length + 1, review: SEED.REVIEWS.length + SEED.DEMO_REVIEWS.length + 1, ticket: SEED.TICKETS.length + 1, address: SEED.ADDRESSES.length + 1, notif: SEED.NOTIFICATIONS.length + 1, wallet: SEED.WALLET_TXNS.length + 1, referral: SEED.REFERRALS.length + 1 },
  };
  return db;
}

function save() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  }, 60);
}

const now = () => new Date().toISOString();
const clone = x => JSON.parse(JSON.stringify(x));

module.exports = {
  async seed() { load(); }, // file store is pre-seeded on first load

  /* ---------- users ---------- */
  async findUserByEmail(email) { return load().users.find(u => u.email === email) || null; },
  async findUserById(id) { return load().users.find(u => u.id === id) || null; },
  async createUser(o) {
    const d = load();
    const u = {
      id: d.seq.user++, name: o.name, email: o.email, phone: o.phone || '',
      role: o.role || 'customer', passwordHash: o.passwordHash,
      walletBalance: 250, rewardPoints: 120, createdAt: now(),
    };
    d.users.push(u); save();
    return clone(u);
  },
  async listUsers() { return [...load().users].reverse().map(clone); },
  async addPoints(userId, pts) { const u = load().users.find(x => x.id === userId); if (u) { u.rewardPoints += pts; save(); } },
  async addWallet(userId, amt) { const u = load().users.find(x => x.id === userId); if (u) { u.walletBalance += amt; save(); } },
  async updateUserPassword(email, passwordHash) {
    const d = load();
    const u = d.users.find(x => x.email === email);
    if (u) { u.passwordHash = passwordHash; save(); }
    return u ? clone(u) : null;
  },

  /* ---------- password reset ---------- */
  async createPasswordReset({ email, userId, otpHash, expiresAt }) {
    const d = load();
    if (!d.passwordResets) d.passwordResets = [];
    d.passwordResets = d.passwordResets.filter(x => x.email !== email);
    const rec = {
      email, userId: userId || null, otpHash, expiresAt: new Date(expiresAt).toISOString(),
      attempts: 0, verified: false, resetToken: null, resetTokenExpiresAt: null, createdAt: now()
    };
    d.passwordResets.push(rec); save();
    return clone(rec);
  },
  async findPasswordResetByEmail(email) {
    const d = load();
    if (!d.passwordResets) return null;
    const list = d.passwordResets.filter(x => x.email === email);
    if (!list.length) return null;
    return clone(list[list.length - 1]);
  },
  async updatePasswordResetAttempts(email, attempts) {
    const d = load();
    if (!d.passwordResets) return;
    const rec = d.passwordResets.find(x => x.email === email);
    if (rec) { rec.attempts = attempts; save(); }
  },
  async markPasswordResetVerified(email, resetToken, resetTokenExpiresAt) {
    const d = load();
    if (!d.passwordResets) return;
    const rec = d.passwordResets.find(x => x.email === email);
    if (rec) { rec.verified = true; rec.resetToken = resetToken; rec.resetTokenExpiresAt = new Date(resetTokenExpiresAt).toISOString(); save(); }
  },
  async findPasswordResetByToken(resetToken) {
    const d = load();
    if (!d.passwordResets) return null;
    const rec = d.passwordResets.find(x => x.resetToken === resetToken);
    return rec ? clone(rec) : null;
  },
  async deletePasswordResetByEmail(email) {
    const d = load();
    if (!d.passwordResets) return;
    d.passwordResets = d.passwordResets.filter(x => x.email !== email);
    save();
  },

  /* ---------- professionals ---------- */
  async listPros(filter = {}) {
    let list = load().pros;
    if (filter.status) list = list.filter(p => p.status === filter.status);
    if (filter.serviceId) list = list.filter(p => (p.services || []).includes(filter.serviceId));
    if (filter.city) list = list.filter(p => p.city === filter.city);
    return list.slice().sort((a, b) => b.rating - a.rating).map(clone);
  },
  async findProById(id) { const p = load().pros.find(x => x.id === id); return p ? clone(p) : null; },
  async findProByUserId(userId) { const p = load().pros.find(x => x.userId === userId); return p ? clone(p) : null; },
  async createPro(o) {
    const d = load();
    const p = {
      id: d.seq.pro++, userId: o.userId || null, name: o.name, email: o.email || '', phone: o.phone || '',
      services: o.services || [], city: o.city || 'Mumbai', experience: o.experience || 5,
      rating: 0, bookingsCount: 0, status: 'pending', verified: false, bio: o.bio || '', createdAt: now(),
    };
    d.pros.push(p); save();
    return clone(p);
  },
  async setProStatus(id, status) {
    const p = load().pros.find(x => x.id === id);
    if (!p) return null;
    p.status = status; p.verified = status === 'active'; save();
    return clone(p);
  },
  async listPendingPros() { return load().pros.filter(p => p.status === 'pending').map(clone); },
  async incrementProBookings(id) { const p = load().pros.find(x => x.id === id); if (p) { p.bookingsCount += 1; save(); } },

  /* ---------- services & coupons ---------- */
  async listCategories() { return SEED.CATEGORIES.map(name => ({ name, count: load().services.filter(s => s.category === name).length })); },
  async listServices(category) {
    let list = load().services;
    if (category) list = list.filter(s => s.category === category);
    return list.slice().sort((a, b) => b.bookingsCount - a.bookingsCount).map(clone);
  },
  async findServiceById(id) { const s = load().services.find(x => x.id === id); return s ? clone(s) : null; },
  async findCoupon(code) {
    const c = load().coupons.find(x => x.code === String(code).toUpperCase() && x.active !== false);
    return c ? clone(c) : null;
  },
  async listCoupons() { return [...load().coupons].sort((a, b) => a.code.localeCompare(b.code)).map(clone); },
  async createCoupon(o) {
    const d = load();
    const c = {
      code: String(o.code || '').toUpperCase(), type: o.type || 'percent', value: Number(o.value) || 0,
      minAmount: Number(o.minAmount) || 0, cap: o.cap != null ? Number(o.cap) : null,
      active: o.active !== false, description: o.description || '', validUntil: o.validUntil || '',
    };
    if (d.coupons.some(x => x.code === c.code)) throw new Error('Coupon code already exists');
    d.coupons.push(c); save();
    return clone(c);
  },
  async updateCoupon(code, patch) {
    const c = load().coupons.find(x => x.code === String(code).toUpperCase());
    if (!c) return null;
    const norm = {};
    for (const [k, v] of Object.entries(patch)) norm[k.replace(/_([a-z])/g, (_, x) => x.toUpperCase())] = v;
    if ('value' in norm) norm.value = Number(norm.value);
    if ('minAmount' in norm) norm.minAmount = Number(norm.minAmount);
    Object.assign(c, norm); save();
    return clone(c);
  },
  async deleteCoupon(code) {
    const d = load();
    d.coupons = d.coupons.filter(x => x.code !== String(code).toUpperCase()); save();
  },

  /* ---------- reviews ---------- */
  async listReviews(filter = {}) {
    let list = load().reviews;
    if (filter.status) list = list.filter(r => r.status === filter.status);
    return list.slice().sort((a, b) => b.id - a.id).map(clone);
  },
  async findReviewById(id) { const r = load().reviews.find(x => x.id === id); return r ? clone(r) : null; },
  async updateReview(id, patch) {
    const r = load().reviews.find(x => x.id === id);
    if (!r) return null;
    const norm = {};
    for (const [k, v] of Object.entries(patch)) norm[k.replace(/_([a-z])/g, (_, x) => x.toUpperCase())] = v;
    Object.assign(r, norm); save();
    return clone(r);
  },
  async deleteReview(id) { load().reviews = load().reviews.filter(x => x.id !== id); save(); },
  async createReview(o) {
    const d = load();
    const r = {
      id: d.seq.review++, bookingId: o.bookingId || null, userId: o.userId || null, proId: o.proId || null,
      serviceId: o.serviceId || '', customerName: o.customerName || '', serviceName: o.serviceName || '',
      rating: Number(o.rating) || 5, text: o.text || '', images: o.images || [], videos: o.videos || [],
      status: 'pending', verified: false, helpful: 0, createdAt: now(),
    };
    d.reviews.push(r); save();
    return clone(r);
  },

  /* ---------- addresses ---------- */
  async listAddresses(userId) {
    return load().addresses.filter(a => a.userId === userId).sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0) || a.id - b.id).map(clone);
  },
  async findAddressById(id) { const a = load().addresses.find(x => x.id === id); return a ? clone(a) : null; },
  async createAddress(o) {
    const d = load();
    const a = {
      id: d.seq.address++, userId: o.userId, label: o.label || 'Home',
      line: o.line || '', area: o.area || '', city: o.city || '', pincode: o.pincode || '',
      lat: o.lat != null ? o.lat : null, lng: o.lng != null ? o.lng : null, isDefault: !!o.isDefault, createdAt: now(),
    };
    d.addresses.push(a); save();
    return clone(a);
  },
  async updateAddress(id, patch) {
    const a = load().addresses.find(x => x.id === id);
    if (!a) return null;
    const norm = {};
    for (const [k, v] of Object.entries(patch)) norm[k.replace(/_([a-z])/g, (_, x) => x.toUpperCase())] = v;
    Object.assign(a, norm); save();
    return clone(a);
  },
  async deleteAddress(id) { load().addresses = load().addresses.filter(x => x.id !== id); save(); },
  async clearDefaultAddresses(userId) {
    load().addresses.forEach(a => { if (a.userId === userId) a.isDefault = false; }); save();
  },

  /* ---------- notifications ---------- */
  async listNotifications(userId) { return load().notifications.filter(n => n.userId === userId).sort((a, b) => b.id - a.id).map(clone); },
  async createNotification(o) {
    const d = load();
    const n = {
      id: d.seq.notif++, userId: o.userId, title: o.title || '', body: o.body || '',
      type: o.type || 'system', channel: o.channel || 'inapp', link: o.link || '', read: false, createdAt: now(),
    };
    d.notifications.push(n); save();
    return clone(n);
  },
  async markNotificationRead(id) { const n = load().notifications.find(x => x.id === id); if (n) { n.read = true; save(); } },
  async markAllNotificationsRead(userId) { load().notifications.forEach(n => { if (n.userId === userId) n.read = true; }); save(); },
  async deleteNotification(id) { load().notifications = load().notifications.filter(x => x.id !== id); save(); },
  async unreadNotificationCount(userId) { return load().notifications.filter(n => n.userId === userId && !n.read).length; },

  /* ---------- gift cards ---------- */
  async listGiftCards() { return [...load().giftCards].sort((a, b) => b.id - a.id).map(clone); },
  async createGiftCard(o) {
    const d = load();
    const g = {
      id: d.seq.gift++, code: String(o.code || 'GIFT' + Math.floor(1000 + Math.random() * 9000)).toUpperCase(),
      value: Number(o.value) || 500, balance: Number(o.value) || 500,
      expiresAt: o.expiresAt || '', status: 'active', createdAt: now(),
    };
    d.giftCards.push(g); save();
    return clone(g);
  },
  async updateGiftCard(id, patch) {
    const g = load().giftCards.find(x => x.id === id);
    if (!g) return null;
    const norm = {};
    for (const [k, v] of Object.entries(patch)) norm[k.replace(/_([a-z])/g, (_, x) => x.toUpperCase())] = v;
    Object.assign(g, norm); save();
    return clone(g);
  },
  async deleteGiftCard(id) { load().giftCards = load().giftCards.filter(x => x.id !== id); save(); },

  /* ---------- membership plans ---------- */
  async listPlans() { return [...load().plans].sort((a, b) => a.price - b.price).map(clone); },
  async updatePlan(id, patch) {
    const p = load().plans.find(x => x.id === id);
    if (!p) return null;
    const norm = {};
    for (const [k, v] of Object.entries(patch)) norm[k.replace(/_([a-z])/g, (_, x) => x.toUpperCase())] = v;
    if ('price' in norm) norm.price = Number(norm.price);
    Object.assign(p, norm); save();
    return clone(p);
  },

  /* ---------- support tickets ---------- */
  async listTickets() { return [...load().tickets].sort((a, b) => b.id - a.id).map(clone); },
  async listTicketsByUser(userId) { return load().tickets.filter(t => t.userId === userId).sort((a, b) => b.id - a.id).map(clone); },
  async createTicket(o) {
    const d = load();
    const t = {
      id: d.seq.ticket++, userId: o.userId || null, customerName: o.customerName || '',
      subject: o.subject || '', category: o.category || 'other', priority: o.priority || 'medium',
      messages: [{ from: 'customer', text: o.message || '', createdAt: now() }], createdAt: now(),
    };
    d.tickets.push(t); save();
    return clone(t);
  },
  async findTicketById(id) { const t = load().tickets.find(x => x.id === id); return t ? clone(t) : null; },
  async replyTicket(id, text, from = 'admin') {
    const t = load().tickets.find(x => x.id === id);
    if (!t) return null;
    t.messages = t.messages || [];
    t.messages.push({ from, text, createdAt: now() });
    if (!['resolved', 'closed'].includes(t.status)) t.status = 'in-progress'; // don't reopen terminal tickets
    save();
    return clone(t);
  },
  async updateTicket(id, patch) {
    const t = load().tickets.find(x => x.id === id);
    if (!t) return null;
    const norm = {};
    for (const [k, v] of Object.entries(patch)) norm[k.replace(/_([a-z])/g, (_, x) => x.toUpperCase())] = v;
    Object.assign(t, norm); save();
    return clone(t);
  },

  /* ---------- bookings ---------- */
  async createBooking(o) {
    const d = load();
    const b = {
      id: o.id, userId: o.userId,
      customerEmail: o.customerEmail || '',
      customerName: o.customerName || '',
      customerPhone: o.customerPhone || '',
      proId: o.proId || null, serviceId: o.serviceId,
      serviceName: o.serviceName, packageName: o.packageName || null, status: 'confirmed',
      date: o.date, time: o.time, address: o.address,
      total: o.total, discount: o.discount || 0, coupon: o.coupon || null,
      paymentMethod: o.paymentMethod || 'wallet', paymentStatus: 'pending',
      rating: null, rateText: '', createdAt: now(),
    };
    d.bookings.unshift(b); save();
    return clone(b);
  },
  async findBookingById(id) { const b = load().bookings.find(x => x.id === id); return b ? clone(b) : null; },
  async listBookingsByUser(userId) { return load().bookings.filter(b => b.userId === userId).map(clone); },
  async listBookings() { return load().bookings.map(clone); },
  async updateBooking(id, patch) {
    const b = load().bookings.find(x => x.id === id);
    if (!b) return null;
    // Route patches use SQL-style snake_case keys → map to the camelCase store fields.
    const norm = {};
    for (const [k, v] of Object.entries(patch)) {
      norm[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
    }
    Object.assign(b, norm); save();
    return clone(b);
  },
  async countByStatus(status) { return load().bookings.filter(b => b.status === status).length; },
  async sumRevenue() { return load().bookings.filter(b => b.paymentStatus === 'paid').reduce((a, b) => a + Number(b.total), 0); },
  async countUsers(role) { return load().users.filter(u => u.role === role).length; },

  /* ---------- analytics ---------- */
  async dashboardStats() {
    const d = load();
    const revenue = d.bookings.filter(b => b.paymentStatus === 'paid').reduce((a, b) => a + Number(b.total), 0);
    const activeBookings = d.bookings.filter(b => !['cancelled', 'rejected', 'rated', 'completed'].includes(b.status)).length;
    return {
      totalBookings: d.bookings.length, revenue,
      customers: d.users.filter(u => u.role === 'customer').length,
      professionals: d.pros.length,
      activeBookings, avgRating: '4.8',
      recentBookings: d.bookings.slice(0, 8).map(clone),
    };
  },
};
