/* Servehub Address model — customer saved addresses with optional GPS. */
const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  userId: { type: Number, required: true, index: true },
  label: { type: String, default: 'Home' }, // Home | Work | Other
  line: { type: String, default: '' },
  area: { type: String, default: '' },
  city: { type: String, default: '' },
  pincode: { type: String, default: '' },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

module.exports = mongoose.model('Address', AddressSchema);
