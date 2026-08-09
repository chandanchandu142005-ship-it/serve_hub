/* Servehub Professional model — includes KYC, uploaded documents,
   certificates and bank details used for the approval flow and payouts. */
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  kind: { type: String, default: 'id' }, // id | certificate | other
  name: { type: String, default: '' },
  url: { type: String, default: '' },
  verified: { type: Boolean, default: false },
}, { versionKey: false, _id: false });

const BankDetailsSchema = new mongoose.Schema({
  accountHolder: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifsc: { type: String, default: '' },
  bankName: { type: String, default: '' },
  upiId: { type: String, default: '' },
}, { versionKey: false, _id: false });

const ProfessionalSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  userId: { type: Number, default: null },
  name: { type: String, required: true, trim: true },
  email: { type: String, default: '', lowercase: true, trim: true },
  phone: { type: String, default: '' },
  services: { type: [String], default: [] }, // service ids this pro offers
  city: { type: String, default: 'Mumbai' },
  area: { type: String, default: '' },
  experience: { type: Number, default: 5 }, // years
  rating: { type: Number, default: 0 },
  bookingsCount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'active', 'rejected', 'inactive'], default: 'pending' },
  verified: { type: Boolean, default: false },
  bio: { type: String, default: '' },
  documents: { type: [DocumentSchema], default: [] },
  certificates: { type: [DocumentSchema], default: [] },
  bankDetails: { type: BankDetailsSchema, default: () => ({}) },
  kycStatus: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected'], default: 'pending' },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

module.exports = mongoose.model('Professional', ProfessionalSchema);
