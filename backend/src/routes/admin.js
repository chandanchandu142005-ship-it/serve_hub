const express = require('express');
const repo = require('../repo');
const { auth, requireRole } = require('../middleware/auth');
const wrap = require('../middleware/async');

const router = express.Router();
router.use(auth, requireRole('admin'));

// GET /api/admin/stats — dashboard KPIs
router.get('/stats', wrap(async (req, res) => {
  res.json(await repo.dashboardStats());
}));

// GET /api/admin/bookings
router.get('/bookings', wrap(async (req, res) => {
  res.json({ bookings: await repo.listBookings() });
}));

// GET /api/admin/users
router.get('/users', wrap(async (req, res) => {
  // Never expose password hashes.
  const users = (await repo.listUsers()).map(({ passwordHash, ...u }) => u);
  res.json({ users });
}));

// GET /api/admin/professionals — all, including pending applications
router.get('/professionals', wrap(async (req, res) => {
  res.json({ professionals: await repo.listPros() });
}));

// PATCH /api/admin/professionals/:id/approve — { status: 'active' | 'reject' }
router.patch('/professionals/:id/approve', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Professional not found' });
  const { status } = req.body || {};
  const professional = await repo.setProStatus(id, status === 'reject' ? 'rejected' : 'active');
  if (!professional) return res.status(404).json({ error: 'Professional not found' });
  res.json({ professional });
}));

/* ================= Reviews (moderation) ================= */

// GET /api/admin/reviews?status=pending|published|hidden
router.get('/reviews', wrap(async (req, res) => {
  const { status } = req.query;
  res.json({ reviews: await repo.listReviews(status ? { status } : {}) });
}));

// PATCH /api/admin/reviews/:id — { status: 'published' | 'hidden' }
router.patch('/reviews/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Review not found' });
  const { status } = req.body || {};
  if (!['published', 'hidden', 'pending'].includes(status)) return res.status(400).json({ error: 'Invalid review status' });
  const review = await repo.updateReview(id, { status });
  if (!review) return res.status(404).json({ error: 'Review not found' });
  res.json({ review });
}));

// DELETE /api/admin/reviews/:id — permanently remove
router.delete('/reviews/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Review not found' });
  await repo.deleteReview(id);
  res.json({ ok: true });
}));

/* ================= Coupons (CRUD) ================= */

// GET /api/admin/coupons
router.get('/coupons', wrap(async (req, res) => {
  res.json({ coupons: await repo.listCoupons() });
}));

// POST /api/admin/coupons — { code, type, value, minAmount, cap, active, description, validUntil }
router.post('/coupons', wrap(async (req, res) => {
  const { code } = req.body || {};
  if (!code || !String(code).trim()) return res.status(400).json({ error: 'Coupon code is required' });
  try {
    const coupon = await repo.createCoupon(req.body || {});
    res.status(201).json({ coupon });
  } catch (err) {
    if (String(err.message).includes('already exists') || String(err.code || '').startsWith('11000')) {
      return res.status(409).json({ error: 'A coupon with this code already exists' });
    }
    throw err;
  }
}));

// PATCH /api/admin/coupons/:code
router.patch('/coupons/:code', wrap(async (req, res) => {
  const coupon = await repo.updateCoupon(req.params.code, req.body || {});
  if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
  res.json({ coupon });
}));

// DELETE /api/admin/coupons/:code
router.delete('/coupons/:code', wrap(async (req, res) => {
  await repo.deleteCoupon(req.params.code);
  res.json({ ok: true });
}));

/* ================= Gift cards (CRUD) ================= */

// GET /api/admin/giftcards
router.get('/giftcards', wrap(async (req, res) => {
  res.json({ giftCards: await repo.listGiftCards() });
}));

// POST /api/admin/giftcards — { value, expiresAt }
router.post('/giftcards', wrap(async (req, res) => {
  const value = Number((req.body || {}).value);
  if (!Number.isFinite(value) || value <= 0) return res.status(400).json({ error: 'A positive gift card value is required' });
  const giftCard = await repo.createGiftCard(req.body || {});
  res.status(201).json({ giftCard });
}));

// PATCH /api/admin/giftcards/:id — { status: 'active' | 'expired' }
router.patch('/giftcards/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Gift card not found' });
  const giftCard = await repo.updateGiftCard(id, req.body || {});
  if (!giftCard) return res.status(404).json({ error: 'Gift card not found' });
  res.json({ giftCard });
}));

// DELETE /api/admin/giftcards/:id
router.delete('/giftcards/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Gift card not found' });
  await repo.deleteGiftCard(id);
  res.json({ ok: true });
}));

/* ================= Membership plans ================= */

// GET /api/admin/plans
router.get('/plans', wrap(async (req, res) => {
  res.json({ plans: await repo.listPlans() });
}));

// PATCH /api/admin/plans/:id — { price, featured, active, perks }
router.patch('/plans/:id', wrap(async (req, res) => {
  const plan = await repo.updatePlan(req.params.id, req.body || {});
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  res.json({ plan });
}));

/* ================= Support tickets (inbox) ================= */

// GET /api/admin/tickets?status=open
router.get('/tickets', wrap(async (req, res) => {
  const all = await repo.listTickets();
  const { status } = req.query;
  res.json({ tickets: status ? all.filter(t => t.status === status) : all });
}));

// GET /api/admin/tickets/:id — full thread
router.get('/tickets/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Ticket not found' });
  const ticket = await repo.findTicketById(id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ ticket });
}));

// POST /api/admin/tickets/:id/reply — { text } (admin reply)
router.post('/tickets/:id/reply', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Ticket not found' });
  const text = String((req.body || {}).text || '').trim();
  if (!text) return res.status(400).json({ error: 'Reply text is required' });
  const ticket = await repo.replyTicket(id, text, 'admin');
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  // notify the customer that support replied (in-app; other channels via notifier)
  if (ticket.userId != null) {
    await repo.createNotification({
      userId: ticket.userId, title: 'Support replied',
      body: 'Support replied to ticket ' + id + ': "' + text.slice(0, 80) + '"',
      type: 'support', channel: 'inapp', link: '/dashboard/support',
    });
  }
  res.json({ ticket });
}));

// PATCH /api/admin/tickets/:id — { status: 'open'|'in-progress'|'resolved'|'closed', priority }
router.patch('/tickets/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Ticket not found' });
  const ticket = await repo.updateTicket(id, req.body || {});
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ ticket });
}));

module.exports = router;
