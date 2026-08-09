/* Servehub Booking model — the full booking lifecycle:
   confirmed → assigned → arriving → started → completed → paid → rated
   (+ cancelled / rejected). */
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true }, // e.g. 'SH704179'
  userId: { type: Number, required: true, index: true },
  customerEmail: { type: String, default: '', index: true }, // email of the person who booked
  customerName: { type: String, default: '' },               // full name of the person who booked
  customerPhone: { type: String, default: '' },              // phone of the person who booked
  proId: { type: Number, default: null },
  serviceId: { type: String, required: true },
  serviceName: { type: String, default: '' },
  packageName: { type: String, default: null },
  status: { type: String, default: 'confirmed', index: true },
  date: { type: String, default: '' },
  time: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  total: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  coupon: { type: String, default: null },
  paymentMethod: { type: String, default: 'wallet' }, // card | upi | netbanking | wallet | cash | emi
  paymentStatus: { type: String, default: 'pending', index: true }, // pending | paid | refunded
  rating: { type: Number, default: null, min: 1, max: 5 },
  rateText: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

module.exports = mongoose.model('Booking', BookingSchema);
