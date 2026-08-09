/* Servehub WalletTransaction model — every wallet credit/debit:
   cashback, referral rewards, refunds, withdrawals and payments. */
const mongoose = require('mongoose');

const WalletTransactionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  userId: { type: Number, required: true, index: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number, default: 0 },
  reason: { type: String, default: '' }, // cashback | referral | refund | withdrawal | payment
  reference: { type: String, default: '' }, // booking id / order id
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

module.exports = mongoose.model('WalletTransaction', WalletTransactionSchema);
