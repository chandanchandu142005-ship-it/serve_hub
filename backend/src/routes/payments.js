const express = require('express');
const repo = require('../repo');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/async');

const router = express.Router();
router.use(auth);

// POST /api/payments/intent — mock gateway: create a payment order
router.post('/intent', wrap(async (req, res) => {
  const { bookingId, method } = req.body || {};
  const booking = await repo.findBookingById(bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json({
    orderId: 'PAY' + Date.now(),
    amount: booking.total,
    method: method || booking.paymentMethod,
    currency: 'INR',
    status: 'created',
    note: 'Mock gateway — in production integrate Stripe/Razorpay here.',
  });
}));

// POST /api/payments/verify — mark a booking as paid after (mock) gateway success
router.post('/verify', wrap(async (req, res) => {
  const { bookingId, method } = req.body || {};
  const booking = await repo.findBookingById(bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const updated = await repo.updateBooking(booking.id, {
    payment_status: 'paid',
    payment_method: method || booking.paymentMethod,
  });
  res.json({ ok: true, booking: updated });
}));

// GET /api/payments/wallet — wallet balance + reward points
router.get('/wallet', wrap(async (req, res) => {
  const user = await repo.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ walletBalance: user.walletBalance, rewardPoints: user.rewardPoints });
}));

module.exports = router;
