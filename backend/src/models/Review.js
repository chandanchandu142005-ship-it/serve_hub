/* Servehub Review model — post-service ratings with images/videos,
   verified-customer flag and helpful votes. */
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  bookingId: { type: String, default: null }, // e.g. 'SH395684'
  userId: { type: Number, index: true },
  proId: { type: Number, index: true },
  serviceId: { type: String, index: true },
  customerName: { type: String, default: '' },
  serviceName: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, default: '' },
  images: { type: [String], default: [] },
  videos: { type: [String], default: [] },
  status: { type: String, enum: ['pending', 'published', 'hidden'], default: 'published' },
  verified: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

module.exports = mongoose.model('Review', ReviewSchema);
