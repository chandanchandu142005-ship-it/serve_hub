/* Servehub GiftCard model — purchasable gift cards redeemed into wallet. */
const mongoose = require('mongoose');

const GiftCardSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  value: { type: Number, required: true, min: 0 },
  balance: { type: Number, required: true, min: 0 },
  ownerUserId: { type: Number, default: null },
  status: { type: String, enum: ['active', 'redeemed', 'expired'], default: 'active' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  expiresAt: { type: String, default: '' },
}, { versionKey: false });

module.exports = mongoose.model('GiftCard', GiftCardSchema);
