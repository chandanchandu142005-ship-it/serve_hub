/* Servehub Referral model — referrer → referee reward tracking. */
const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  referrerUserId: { type: Number, required: true, index: true },
  refereeUserId: { type: Number, index: true },
  refereeName: { type: String, default: '' },
  code: { type: String, index: true },
  status: { type: String, enum: ['pending', 'rewarded', 'expired'], default: 'pending' },
  reward: { type: Number, default: 100 },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

module.exports = mongoose.model('Referral', ReferralSchema);
