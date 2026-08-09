/* ------------------------------------------------------------------
   Customer routes — reviews, saved addresses, support tickets and
   notifications, all scoped to the authenticated user.
   ------------------------------------------------------------------ */
const express = require('express');
const repo = require('../repo');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/async');

const router = express.Router();
router.use(auth); // every route below needs a logged-in user

/* ================= Reviews ================= */

// POST /api/reviews — submit a review for a completed booking
router.post('/reviews', wrap(async (req, res) => {
  const { bookingId, serviceId, serviceName, rating, text, images } = req.body || {};
  // one review per booking, per customer
  if (bookingId) {
    const existing = (await repo.listReviews()).find(r => r.userId === req.user.id && r.bookingId === bookingId);
    if (existing) return res.status(409).json({ error: 'You have already reviewed this booking' });
  }
  const value = Math.min(5, Math.max(1, Number(rating) || 5));
  const review = await repo.createReview({
    bookingId: bookingId || null,
    userId: req.user.id,
    proId: null,
    serviceId: serviceId || '',
    customerName: req.user.name || 'Customer',
    serviceName: serviceName || '',
    rating: value, text: String(text || '').trim(), images: Array.isArray(images) ? images : [],
  });
  res.status(201).json({ review });
}));

// GET /api/reviews/mine — the current user's reviews
router.get('/reviews/mine', wrap(async (req, res) => {
  const all = await repo.listReviews();
  res.json({ reviews: all.filter(r => r.userId === req.user.id) });
}));

/* ================= Addresses ================= */

// GET /api/addresses — my saved addresses
router.get('/addresses', wrap(async (req, res) => {
  res.json({ addresses: await repo.listAddresses(req.user.id) });
}));

// POST /api/addresses — add a new address
router.post('/addresses', wrap(async (req, res) => {
  const { label, line, area, city, pincode, lat, lng, isDefault } = req.body || {};
  if (!line) return res.status(400).json({ error: 'Address line is required' });
  let address;
  if (isDefault) {
    await repo.clearDefaultAddresses(req.user.id);
    address = await repo.createAddress({ userId: req.user.id, label, line, area, city, pincode, lat, lng, isDefault: true });
  } else {
    address = await repo.createAddress({ userId: req.user.id, label, line, area, city, pincode, lat, lng, isDefault: false });
  }
  res.status(201).json({ address });
}));

// PATCH /api/addresses/:id — edit my address (or set as default)
router.patch('/addresses/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Address not found' });
  const existing = await repo.findAddressById(id);
  if (!existing || existing.userId !== req.user.id) return res.status(404).json({ error: 'Address not found' });
  const patch = { ...(req.body || {}) };
  delete patch.userId; // never allow ownership change
  if (patch.isDefault) await repo.clearDefaultAddresses(req.user.id);
  const address = await repo.updateAddress(id, patch);
  res.json({ address });
}));

// DELETE /api/addresses/:id — remove my address
router.delete('/addresses/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Address not found' });
  const existing = await repo.findAddressById(id);
  if (!existing || existing.userId !== req.user.id) return res.status(404).json({ error: 'Address not found' });
  await repo.deleteAddress(id);
  res.json({ ok: true });
}));

/* ================= Support tickets ================= */

// GET /api/tickets — my tickets
router.get('/tickets', wrap(async (req, res) => {
  res.json({ tickets: await repo.listTicketsByUser(req.user.id) });
}));

// POST /api/tickets — raise a ticket
router.post('/tickets', wrap(async (req, res) => {
  const { subject, category, message, priority } = req.body || {};
  if (!subject || !String(subject).trim()) return res.status(400).json({ error: 'Subject is required' });
  const ticket = await repo.createTicket({
    userId: req.user.id, customerName: req.user.name || 'Customer',
    subject: String(subject).trim(), category: category || 'other',
    priority: priority || 'medium', message: String(message || '').trim(),
  });
  res.status(201).json({ ticket });
}));

// GET /api/tickets/:id — my ticket thread
router.get('/tickets/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Ticket not found' });
  const ticket = await repo.findTicketById(id);
  if (!ticket || ticket.userId !== req.user.id) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ ticket });
}));

// POST /api/tickets/:id/reply — customer adds a message to their ticket
router.post('/tickets/:id/reply', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Ticket not found' });
  const existing = await repo.findTicketById(id);
  if (!existing || existing.userId !== req.user.id) return res.status(404).json({ error: 'Ticket not found' });
  const text = String((req.body || {}).text || '').trim();
  if (!text) return res.status(400).json({ error: 'Message is required' });
  const ticket = await repo.replyTicket(id, text, 'customer');
  res.json({ ticket });
}));

/* ================= Notifications ================= */

// GET /api/notifications — my notifications
router.get('/notifications', wrap(async (req, res) => {
  res.json({
    notifications: await repo.listNotifications(req.user.id),
    unread: await repo.unreadNotificationCount(req.user.id),
  });
}));

// POST /api/notifications/read-all
router.post('/notifications/read-all', wrap(async (req, res) => {
  await repo.markAllNotificationsRead(req.user.id);
  res.json({ ok: true });
}));

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/notifications/:id/read', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Notification not found' });
  const all = await repo.listNotifications(req.user.id);
  if (!all.some(n => n.id === id)) return res.status(404).json({ error: 'Notification not found' });
  await repo.markNotificationRead(id);
  res.json({ ok: true });
}));

// DELETE /api/notifications/:id — remove one
router.delete('/notifications/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Notification not found' });
  const all = await repo.listNotifications(req.user.id);
  if (!all.some(n => n.id === id)) return res.status(404).json({ error: 'Notification not found' });
  await repo.deleteNotification(id);
  res.json({ ok: true });
}));

module.exports = router;
