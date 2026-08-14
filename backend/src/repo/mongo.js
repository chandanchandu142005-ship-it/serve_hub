/* MongoDB repository — same interface as file.js, backed by the Mongoose
   models in src/models/. Documents keep a numeric `id` field (alongside
   Mongo's _id) so JWT payloads, booking ownership checks and pro references
   stay identical across storage backends. */
const SEED = require('../db/seed-data');
const M = require('../models');

const camel = key => key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const clean = doc => {
  if (!doc) return null;
  const { _id, ...rest } = doc.toObject ? doc.toObject() : doc;
  return rest;
};

/* Atomically bump a counter and return the next id (users, pros, bookings…). */
async function nextId(name) {
  const doc = await M.Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return doc.seq;
}

module.exports = {
  /* ---------- seeding ---------- */
  async seed() {
    // Counter floors — nextId $incs before returning, so first new user = 9001
    // (9000 is reserved for the seeded demo customer) and the first applied pro
    // = SEED.PROS.length + 1 (seeded pros occupy ids 1..length).
    await M.Counter.updateOne({ _id: 'user' }, { $max: { seq: SEED.DEMO_USER_ID } }, { upsert: true });
    await M.Counter.updateOne({ _id: 'pro' }, { $max: { seq: SEED.PROS.length } }, { upsert: true });
    await M.Counter.updateOne({ _id: 'gift' }, { $max: { seq: SEED.GIFT_CARDS.length } }, { upsert: true });
    await M.Counter.updateOne({ _id: 'review' }, { $max: { seq: SEED.REVIEWS.length + SEED.DEMO_REVIEWS.length } }, { upsert: true });
    await M.Counter.updateOne({ _id: 'ticket' }, { $max: { seq: SEED.TICKETS.length } }, { upsert: true });
    await M.Counter.updateOne({ _id: 'address' }, { $max: { seq: SEED.ADDRESSES.length } }, { upsert: true });
    await M.Counter.updateOne({ _id: 'notif' }, { $max: { seq: SEED.NOTIFICATIONS.length } }, { upsert: true });
    await M.Counter.updateOne({ _id: 'wallet' }, { $max: { seq: SEED.WALLET_TXNS.length } }, { upsert: true });
    await M.Counter.updateOne({ _id: 'referral' }, { $max: { seq: SEED.REFERRALS.length } }, { upsert: true });
    // Core catalogue seeds once; the auxiliary collections are idempotent.
    if ((await M.Service.countDocuments()) === 0) {
      await M.Service.insertMany(SEED.SERVICES.map(s => ({ ...s })));
      await M.Professional.insertMany(SEED.PROS.map((p, i) => ({ ...p, id: i + 1 })));
      await M.Coupon.insertMany(SEED.COUPONS.map(c => ({ ...c })));
      console.log('[db] seeded', SEED.SERVICES.length, 'services,', SEED.PROS.length, 'professionals,', SEED.COUPONS.length, 'coupons');
    }
    // Idempotent auxiliary seeds — fill gaps only (safe to run on an existing DB).
    await M.MembershipPlan.bulkWrite(SEED.PLANS.map(p => ({
      updateOne: { filter: { id: p.id }, update: { $setOnInsert: { ...p } }, upsert: true },
    })));
    await M.Review.bulkWrite([...SEED.REVIEWS, ...SEED.DEMO_REVIEWS].map(r => ({
      updateOne: { filter: { id: r.id }, update: { $setOnInsert: { ...r } }, upsert: true },
    })));
    await M.GiftCard.bulkWrite(SEED.GIFT_CARDS.map(g => ({
      updateOne: { filter: { id: g.id }, update: { $setOnInsert: { ...g } }, upsert: true },
    })));
    await M.SupportTicket.bulkWrite(SEED.TICKETS.map(t => ({
      updateOne: { filter: { id: t.id }, update: { $setOnInsert: { ...t } }, upsert: true },
    })));
    // Demo customer + per-user collections (addresses, notifications, wallet,
    // referrals) so every dashboard section has content out of the box.
    await M.User.updateOne(
      { id: SEED.DEMO_USER.id },
      { $setOnInsert: { ...SEED.DEMO_USER } },
      { upsert: true }
    );
    await M.Address.bulkWrite(SEED.ADDRESSES.map(a => ({
      updateOne: { filter: { id: a.id }, update: { $setOnInsert: { ...a } }, upsert: true },
    })));
    await M.Notification.bulkWrite(SEED.NOTIFICATIONS.map(n => ({
      updateOne: { filter: { id: n.id }, update: { $setOnInsert: { ...n } }, upsert: true },
    })));
    await M.WalletTransaction.bulkWrite(SEED.WALLET_TXNS.map(w => ({
      updateOne: { filter: { id: w.id }, update: { $setOnInsert: { ...w } }, upsert: true },
    })));
    await M.Referral.bulkWrite(SEED.REFERRALS.map(rf => ({
      updateOne: { filter: { id: rf.id }, update: { $setOnInsert: { ...rf } }, upsert: true },
    })));
    // ONE-TIME purge of legacy demo-user rows from the first (low-id) seed version.
    // Guarded by a marker counter so it never touches data created later at runtime
    // (e.g. addresses/tickets/notifications the demo account genuinely adds).
    if (!(await M.Counter.findOne({ _id: 'seed_demo_ids_fixed' }).lean())) {
      const demoIds = { addr: SEED.ADDRESSES.map(a => a.id), notif: SEED.NOTIFICATIONS.map(n => n.id), review: SEED.DEMO_REVIEWS.map(r => r.id), ticket: SEED.TICKETS.filter(t => t.userId === SEED.DEMO_USER_ID).map(t => t.id), wallet: SEED.WALLET_TXNS.map(w => w.id), ref: SEED.REFERRALS.map(rf => rf.id) };
      await M.Address.deleteMany({ userId: SEED.DEMO_USER_ID, id: { $nin: demoIds.addr } });
      await M.Notification.deleteMany({ userId: SEED.DEMO_USER_ID, id: { $nin: demoIds.notif } });
      await M.Review.deleteMany({ userId: SEED.DEMO_USER_ID, id: { $nin: demoIds.review } });
      await M.SupportTicket.deleteMany({ userId: SEED.DEMO_USER_ID, id: { $nin: demoIds.ticket } });
      await M.WalletTransaction.deleteMany({ userId: SEED.DEMO_USER_ID, id: { $nin: demoIds.wallet } });
      await M.Referral.deleteMany({ referrerUserId: SEED.DEMO_USER_ID, id: { $nin: demoIds.ref } });
      await M.Counter.updateOne({ _id: 'seed_demo_ids_fixed' }, { $set: { seq: 1 } }, { upsert: true });
      console.log('[db] one-time cleanup: removed legacy low-id demo rows');
    }
    console.log('[db] auxiliary seeds ensured: plans, reviews, gift cards, tickets, demo customer, addresses, notifications, wallet, referrals');
  },

  /* ---------- users ---------- */
  async findUserByEmail(email) { return clean(await M.User.findOne({ email: (email || '').toLowerCase() }).lean()); },
  async findUserByGoogleId(googleId) { return clean(await M.User.findOne({ googleId }).lean()); },
  async findUserById(id) { return clean(await M.User.findOne({ id }).lean()); },
  async createUser(o) {
    const doc = await M.User.create({
      name: o.name, email: (o.email || '').toLowerCase(), phone: o.phone || '',
      googleId: o.googleId || '', avatar: o.avatar || '',
      role: o.role || 'customer', passwordHash: o.passwordHash || '',
      walletBalance: 250, rewardPoints: 120, id: await nextId('user'),
      emailVerified: true,
    });
    return clean(doc);
  },
  async updateUserGoogleInfo(id, { googleId, avatar, name }) {
    const set = {};
    if (googleId) set.googleId = googleId;
    if (avatar) set.avatar = avatar;
    if (name) set.name = name;
    await M.User.updateOne({ id }, { $set: set });
    return clean(await M.User.findOne({ id }).lean());
  },
  async listUsers() { return (await M.User.find().sort({ id: -1 }).lean()).map(clean); },
  async addPoints(userId, pts) { await M.User.updateOne({ id: userId }, { $inc: { rewardPoints: pts } }); },
  async addWallet(userId, amt) { await M.User.updateOne({ id: userId }, { $inc: { walletBalance: amt } }); },
  async updateUserPassword(email, passwordHash) {
    await M.User.updateOne({ email: (email || '').toLowerCase() }, { $set: { passwordHash } });
    return clean(await M.User.findOne({ email: (email || '').toLowerCase() }).lean());
  },

  /* ---------- password reset ---------- */
  async createPasswordReset({ email, userId, otpHash, expiresAt }) {
    await M.PasswordReset.deleteMany({ email });
    const doc = await M.PasswordReset.create({
      email,
      userId: userId || null,
      otpHash,
      expiresAt,
      attempts: 0,
      verified: false,
    });
    return clean(doc);
  },
  async findPasswordResetByEmail(email) {
    return clean(await M.PasswordReset.findOne({ email }).sort({ createdAt: -1 }).lean());
  },
  async updatePasswordResetAttempts(email, attempts) {
    await M.PasswordReset.updateOne({ email }, { $set: { attempts } });
  },
  async markPasswordResetVerified(email, resetToken, resetTokenExpiresAt) {
    await M.PasswordReset.updateOne(
      { email },
      { $set: { verified: true, resetToken, resetTokenExpiresAt } }
    );
  },
  async findPasswordResetByToken(resetToken) {
    return clean(await M.PasswordReset.findOne({ resetToken }).lean());
  },
  async deletePasswordResetByEmail(email) {
    await M.PasswordReset.deleteMany({ email });
  },

  /* ---------- professionals ---------- */
  async listPros(filter = {}) {
    const q = {};
    if (filter.status) q.status = filter.status;
    if (filter.serviceId) q.services = filter.serviceId; // matches docs whose services array contains it
    if (filter.city) q.city = filter.city;
    return (await M.Professional.find(q).sort({ rating: -1 }).lean()).map(clean);
  },
  async findProById(id) { return clean(await M.Professional.findOne({ id }).lean()); },
  async findProByUserId(userId) { return clean(await M.Professional.findOne({ userId }).lean()); },
  async createPro(o) {
    const doc = await M.Professional.create({
      id: await nextId('pro'), userId: o.userId || null, name: o.name, email: o.email || '',
      phone: o.phone || '', services: o.services || [], city: o.city || 'Mumbai',
      experience: o.experience || 5, bio: o.bio || '',
    });
    return clean(doc);
  },
  async setProStatus(id, status) {
    await M.Professional.updateOne({ id }, { $set: { status, verified: status === 'active' } });
    return clean(await M.Professional.findOne({ id }).lean());
  },
  async listPendingPros() { return (await M.Professional.find({ status: 'pending' }).sort({ id: -1 }).lean()).map(clean); },
  async incrementProBookings(id) { await M.Professional.updateOne({ id }, { $inc: { bookingsCount: 1 } }); },

  /* ---------- services & coupons ---------- */
  async listCategories() {
    return SEED.CATEGORIES.map(name => ({ name, count: SEED.SERVICES.filter(s => s.category === name).length }));
  },
  async listServices(category) {
    const q = category ? { category } : {};
    return (await M.Service.find(q).sort({ bookingsCount: -1 }).lean()).map(clean);
  },
  async findServiceById(id) { return clean(await M.Service.findOne({ id }).lean()); },
  async findCoupon(code) {
    return clean(await M.Coupon.findOne({ code: String(code).toUpperCase(), active: { $ne: false } }).lean());
  },
  async listCoupons() { return (await M.Coupon.find().sort({ code: 1 }).lean()).map(clean); },
  async createCoupon(o) {
    const doc = await M.Coupon.create({
      code: String(o.code || '').toUpperCase(), type: o.type || 'percent', value: Number(o.value) || 0,
      minAmount: Number(o.minAmount) || 0, cap: o.cap != null ? Number(o.cap) : null,
      active: o.active !== false, description: o.description || '', validUntil: o.validUntil || '',
    });
    return clean(doc);
  },
  async updateCoupon(code, patch) {
    const set = {};
    for (const [k, v] of Object.entries(patch)) set[camel(k)] = v;
    if ('value' in set) set.value = Number(set.value);
    if ('minAmount' in set) set.minAmount = Number(set.minAmount);
    await M.Coupon.updateOne({ code: String(code).toUpperCase() }, { $set: set });
    return clean(await M.Coupon.findOne({ code: String(code).toUpperCase() }).lean());
  },
  async deleteCoupon(code) { await M.Coupon.deleteOne({ code: String(code).toUpperCase() }); },

  /* ---------- reviews ---------- */
  async listReviews(filter = {}) {
    const q = {};
    if (filter.status) q.status = filter.status;
    return (await M.Review.find(q).sort({ id: -1 }).lean()).map(clean);
  },
  async findReviewById(id) { return clean(await M.Review.findOne({ id }).lean()); },
  async updateReview(id, patch) {
    const set = {};
    for (const [k, v] of Object.entries(patch)) set[camel(k)] = v;
    await M.Review.updateOne({ id }, { $set: set });
    return clean(await M.Review.findOne({ id }).lean());
  },
  async deleteReview(id) { await M.Review.deleteOne({ id }); },
  async createReview(o) {
    const doc = await M.Review.create({
      id: await nextId('review'), bookingId: o.bookingId || null,
      userId: o.userId || null, proId: o.proId || null, serviceId: o.serviceId || '',
      customerName: o.customerName || '', serviceName: o.serviceName || '',
      rating: Number(o.rating) || 5, text: o.text || '', images: o.images || [], videos: o.videos || [],
      status: 'pending', verified: false, helpful: 0,
    });
    return clean(doc);
  },

  /* ---------- addresses ---------- */
  async listAddresses(userId) { return (await M.Address.find({ userId }).sort({ isDefault: -1, id: 1 }).lean()).map(clean); },
  async findAddressById(id) { return clean(await M.Address.findOne({ id }).lean()); },
  async createAddress(o) {
    const doc = await M.Address.create({
      id: await nextId('address'), userId: o.userId, label: o.label || 'Home',
      line: o.line || '', area: o.area || '', city: o.city || '', pincode: o.pincode || '',
      lat: o.lat != null ? o.lat : null, lng: o.lng != null ? o.lng : null, isDefault: !!o.isDefault,
    });
    return clean(doc);
  },
  async updateAddress(id, patch) {
    const set = {};
    for (const [k, v] of Object.entries(patch)) set[camel(k)] = v;
    await M.Address.updateOne({ id }, { $set: set });
    return clean(await M.Address.findOne({ id }).lean());
  },
  async deleteAddress(id) { await M.Address.deleteOne({ id }); },
  async clearDefaultAddresses(userId) { await M.Address.updateMany({ userId }, { $set: { isDefault: false } }); },

  /* ---------- notifications ---------- */
  async listNotifications(userId) { return (await M.Notification.find({ userId }).sort({ id: -1 }).lean()).map(clean); },
  async createNotification(o) {
    const doc = await M.Notification.create({
      id: await nextId('notif'), userId: o.userId, title: o.title || '', body: o.body || '',
      type: o.type || 'system', channel: o.channel || 'inapp', link: o.link || '', read: false,
    });
    return clean(doc);
  },
  async markNotificationRead(id) { await M.Notification.updateOne({ id }, { $set: { read: true } }); },
  async markAllNotificationsRead(userId) { await M.Notification.updateMany({ userId }, { $set: { read: true } }); },
  async deleteNotification(id) { await M.Notification.deleteOne({ id }); },
  async unreadNotificationCount(userId) { return M.Notification.countDocuments({ userId, read: false }); },

  /* ---------- gift cards ---------- */
  async listGiftCards() { return (await M.GiftCard.find().sort({ id: -1 }).lean()).map(clean); },
  async createGiftCard(o) {
    const doc = await M.GiftCard.create({
      id: await nextId('gift'), code: String(o.code || 'GIFT' + Math.floor(1000 + Math.random() * 9000)).toUpperCase(),
      value: Number(o.value) || 500, balance: Number(o.value) || 500,
      expiresAt: o.expiresAt || '', status: 'active',
    });
    return clean(doc);
  },
  async updateGiftCard(id, patch) {
    const set = {};
    for (const [k, v] of Object.entries(patch)) set[camel(k)] = v;
    await M.GiftCard.updateOne({ id }, { $set: set });
    return clean(await M.GiftCard.findOne({ id }).lean());
  },
  async deleteGiftCard(id) { await M.GiftCard.deleteOne({ id }); },

  /* ---------- membership plans ---------- */
  async listPlans() { return (await M.MembershipPlan.find().sort({ price: 1 }).lean()).map(clean); },
  async updatePlan(id, patch) {
    const set = {};
    for (const [k, v] of Object.entries(patch)) set[camel(k)] = v;
    if ('price' in set) set.price = Number(set.price);
    await M.MembershipPlan.updateOne({ id }, { $set: set });
    return clean(await M.MembershipPlan.findOne({ id }).lean());
  },

  /* ---------- support tickets ---------- */
  async listTickets() { return (await M.SupportTicket.find().sort({ id: -1 }).lean()).map(clean); },
  async listTicketsByUser(userId) { return (await M.SupportTicket.find({ userId }).sort({ id: -1 }).lean()).map(clean); },
  async createTicket(o) {
    const doc = await M.SupportTicket.create({
      id: await nextId('ticket'), userId: o.userId || null, customerName: o.customerName || '',
      subject: o.subject || '', category: o.category || 'other', priority: o.priority || 'medium',
      messages: [{ from: 'customer', text: o.message || '', createdAt: new Date().toISOString() }],
    });
    return clean(doc);
  },
  async findTicketById(id) { return clean(await M.SupportTicket.findOne({ id }).lean()); },
  async replyTicket(id, text, from = 'admin') {
    // Replying reopens the thread unless it was already resolved/closed.
    const t = await M.SupportTicket.findOne({ id }).lean();
    if (!t) return null;
    const reopen = !['resolved', 'closed'].includes(t.status);
    await M.SupportTicket.updateOne({ id }, { $push: { messages: { from, text, createdAt: new Date().toISOString() } }, ...(reopen ? { $set: { status: 'in-progress' } } : {}) });
    return clean(await M.SupportTicket.findOne({ id }).lean());
  },
  async updateTicket(id, patch) {
    const set = {};
    for (const [k, v] of Object.entries(patch)) set[camel(k)] = v;
    await M.SupportTicket.updateOne({ id }, { $set: set });
    return clean(await M.SupportTicket.findOne({ id }).lean());
  },

  /* ---------- bookings ---------- */
  async createBooking(o) {
    const doc = await M.Booking.create({
      id: o.id, userId: o.userId,
      customerEmail: o.customerEmail || '',
      customerName: o.customerName || '',
      customerPhone: o.customerPhone || '',
      proId: o.proId || null, serviceId: o.serviceId,
      serviceName: o.serviceName, packageName: o.packageName || null,
      date: o.date, time: o.time, address: o.address,
      latitude: o.latitude || null,
      longitude: o.longitude || null,
      formattedAddress: o.formattedAddress || o.address || '',
      city: o.city || '',
      state: o.state || '',
      pincode: o.pincode || '',
      country: o.country || '',
      total: o.total, discount: o.discount || 0, coupon: o.coupon || null,
      paymentMethod: o.paymentMethod || 'wallet',
    });
    return clean(doc);
  },
  async findBookingById(id) { return clean(await M.Booking.findOne({ id }).lean()); },
  async listBookingsByUser(userId) { return (await M.Booking.find({ userId }).sort({ createdAt: -1 }).lean()).map(clean); },
  async listBookings() { return (await M.Booking.find().sort({ createdAt: -1 }).lean()).map(clean); },
  async updateBooking(id, patch) {
    const set = {};
    for (const [k, v] of Object.entries(patch)) set[camel(k)] = v;
    await M.Booking.updateOne({ id }, { $set: set });
    return clean(await M.Booking.findOne({ id }).lean());
  },
  async countByStatus(status) { return M.Booking.countDocuments({ status }); },
  async sumRevenue() {
    const rows = await M.Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    return rows[0] ? rows[0].total : 0;
  },
  async countUsers(role) { return M.User.countDocuments({ role }); },

  /* ---------- analytics ---------- */
  async dashboardStats() {
    const [totalBookings, revenue, activeBookings, customers, professionals, avgRating] = await Promise.all([
      M.Booking.countDocuments(),
      this.sumRevenue(),
      M.Booking.countDocuments({ status: { $nin: ['cancelled', 'rejected', 'rated', 'completed'] } }),
      this.countUsers('customer'),
      M.Professional.countDocuments(),
      M.Booking.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    ]);
    return {
      totalBookings, revenue, customers, professionals, activeBookings,
      avgRating: (avgRating[0] && avgRating[0].avg != null ? avgRating[0].avg : 0).toFixed(1),
      recentBookings: (await M.Booking.find().sort({ createdAt: -1 }).limit(8).lean()).map(clean),
    };
  },
};
