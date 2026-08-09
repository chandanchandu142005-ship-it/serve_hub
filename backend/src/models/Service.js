/* Servehub Service model — catalogue item with pricing, duration,
   rating and the list of inclusions shown on the service detail page. */
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, index: true },
  priceFrom: { type: Number, required: true, min: 0 },
  duration: { type: String, default: '1 hr' },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  bookingsCount: { type: Number, default: 0 },
  image: { type: String, default: '✨' },
  included: { type: [String], default: [] },
  description: { type: String, default: '' },
  active: { type: Boolean, default: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

module.exports = mongoose.model('Service', ServiceSchema);
