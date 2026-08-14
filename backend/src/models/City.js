/* Servehub City model — serviceable cities with their areas. */
const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  areas: { type: [String], default: [] },
  serviceable: { type: Boolean, default: true },
}, { versionKey: false });

module.exports = mongoose.model('City', CitySchema);
