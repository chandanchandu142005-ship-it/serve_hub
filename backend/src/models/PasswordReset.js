const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  userId: { type: mongoose.Schema.Types.Mixed, default: null },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  resetToken: { type: String, default: null, index: true },
  resetTokenExpiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('PasswordReset', PasswordResetSchema);
