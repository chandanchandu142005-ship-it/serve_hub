/* Servehub Category model — top-level service buckets shown on the
   landing page and the categories page. */
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: 'sparkles' },
  gradient: { type: String, default: 'linear-gradient(135deg,#2563EB,#0EA5E9)' },
  tag: { type: String, default: '' },
  price: { type: Number, default: 499 },
  rating: { type: Number, default: 4.5 },
  bookings: { type: Number, default: 0 },
  description: { type: String, default: '' },
  active: { type: Boolean, default: true },
}, { versionKey: false });

module.exports = mongoose.model('Category', CategorySchema);
