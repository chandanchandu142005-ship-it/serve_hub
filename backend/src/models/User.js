/* Servehub User model — customers, professionals (role 'pro') and admins.
   Documents carry a numeric `id` (from the counters collection) alongside
   Mongo's _id so JWT payloads and booking references stay stable. */
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  googleId: { type: String, default: '', index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'pro', 'admin'], default: 'customer' },
  passwordHash: { type: String, default: '' },
  walletBalance: { type: Number, default: 250 },
  rewardPoints: { type: Number, default: 120 },
  emailVerified: { type: Boolean, default: true },
  phoneVerified: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  membershipPlan: { type: String, default: 'free' }, // free | plus | pro
  referralCode: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

module.exports = mongoose.model('User', UserSchema);
