/* Servehub MembershipPlan model — subscription tiers (Free / Plus / Pro). */
const mongoose = require('mongoose');

const MembershipPlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true }, // free | plus | pro
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  period: { type: String, default: 'month' },
  featured: { type: Boolean, default: false },
  perks: { type: [String], default: [] },
  active: { type: Boolean, default: true },
}, { versionKey: false });

module.exports = mongoose.model('MembershipPlan', MembershipPlanSchema);
