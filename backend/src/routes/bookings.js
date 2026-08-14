const express = require('express');
const repo = require('../repo');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/async');

const router = express.Router();
router.use(auth); // all booking routes require a logged-in user

const STATUS_FLOW = ['confirmed', 'assigned', 'arriving', 'started', 'completed', 'paid', 'rated'];
const TERMINAL = ['cancelled', 'rejected', 'rated'];

// Server-side price computation: service base price − coupon discount.
async function computePrice({ serviceId, coupon }) {
  const service = await repo.findServiceById(serviceId);
  if (!service) return { error: 'Service not found' };
  const price = Number(service.priceFrom);
  let discount = 0;
  let couponCode = null;
  if (coupon) {
    const c = await repo.findCoupon(coupon);
    if (!c) return { error: 'Invalid coupon code' };
    if (price < c.minAmount) return { error: `Coupon requires a minimum order of ₹${c.minAmount}` };
    discount = c.type === 'percent' ? Math.round((price * c.value) / 100) : Math.min(c.value, price);
    couponCode = c.code;
  }
  return { price, discount, total: Math.max(0, price - discount), couponCode };
}

// POST /api/bookings — create booking (payment verified separately)
router.post('/', wrap(async (req, res) => {
  const { serviceId, packageName, date, time, address, proId, paymentMethod, coupon, latitude, longitude, formattedAddress, city, state, pincode, country } = req.body || {};
  if (!serviceId || !date || !time || !address) {
    return res.status(400).json({ error: 'serviceId, date, time and address are required' });
  }
  const pricing = await computePrice({ serviceId, coupon });
  if (pricing.error) return res.status(400).json({ error: pricing.error });

  const service = await repo.findServiceById(serviceId);
  // Fetch the full user record so we can store their contact details on the booking
  const booker = await repo.findUserById(req.user.id);
  const booking = await repo.createBooking({
    id: 'SH' + Math.floor(100000 + Math.random() * 900000),
    userId: req.user.id,
    customerEmail: booker ? booker.email : (req.user.email || ''),
    customerName: booker ? (booker.name || booker.fullName || '') : (req.user.name || ''),
    customerPhone: booker ? (booker.phone || '') : '',
    proId: proId ? Number(proId) : null,
    serviceId, serviceName: service.name, packageName,
    date, time, address,
    latitude: latitude || null,
    longitude: longitude || null,
    formattedAddress: formattedAddress || address || '',
    city: city || '',
    state: state || '',
    pincode: pincode || '',
    country: country || '',
    total: pricing.total, discount: pricing.discount, coupon: pricing.couponCode,
    paymentMethod,
  });
  if (proId) await repo.incrementProBookings(Number(proId));
  res.status(201).json({ booking });
}));

// GET /api/bookings — my bookings (admin sees all)
router.get('/', wrap(async (req, res) => {
  const bookings = req.user.role === 'admin'
    ? await repo.listBookings()
    : await repo.listBookingsByUser(req.user.id);
  res.json({ bookings });
}));

// GET /api/bookings/:id
router.get('/:id', wrap(async (req, res) => {
  const booking = await repo.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json({ booking });
}));

// POST /api/bookings/:id/status — advance the lifecycle one step (simulates the app's live flow)
router.post('/:id/status', wrap(async (req, res) => {
  const booking = await repo.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (TERMINAL.includes(booking.status)) return res.status(400).json({ error: 'Booking is already finished' });
  const idx = STATUS_FLOW.indexOf(booking.status);
  const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
  const updated = await repo.updateBooking(booking.id, { status: next });
  if (next === 'completed') {
    await repo.addPoints(booking.userId, 10);
    await repo.addWallet(booking.userId, Math.round(booking.total * 0.1)); // 10% cashback
  }
  res.json({ booking: updated });
}));

// POST /api/bookings/:id/cancel
router.post('/:id/cancel', wrap(async (req, res) => {
  const booking = await repo.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (TERMINAL.includes(booking.status)) return res.status(400).json({ error: 'Booking is already finished' });
  res.json({ booking: await repo.updateBooking(booking.id, { status: 'cancelled' }) });
}));

// POST /api/bookings/:id/rate — { rating: 1-5, text }
router.post('/:id/rate', wrap(async (req, res) => {
  const { rating, text } = req.body || {};
  const booking = await repo.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (booking.status !== 'paid' && booking.status !== 'rated') {
    return res.status(400).json({ error: 'Only paid bookings can be rated' });
  }
  const value = Math.min(5, Math.max(1, Number(rating) || 5));
  const updated = await repo.updateBooking(booking.id, { status: 'rated', rating: value, rate_text: text || '' });
  if (value >= 4) await repo.addPoints(booking.userId, 15);
  res.json({ booking: updated });
}));

module.exports = router;
