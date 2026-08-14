/* Servehub Coupon model — promo codes applied at checkout. */
const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  type: { type: String, enum: ['percent', 'flat'], default: 'percent' },
  value: { type: Number, required: true, min: 0 },
  minAmount: { type: Number, default: 0 },
  cap: { type: Number, default: null }, // max discount for percent coupons
  active: { type: Boolean, default: true },
  description: { type: String, default: '' },
  validUntil: { type: String, default: '' },
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
}, { versionKey: false });

module.exports = mongoose.model('Coupon', CouponSchema);
