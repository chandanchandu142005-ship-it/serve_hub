/* Servehub SupportTicket model — customer help-center requests. */
const mongoose = require('mongoose');

const TicketMessageSchema = new mongoose.Schema({
  from: { type: String, default: 'customer' }, // customer | admin
  text: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false, _id: false });

const SupportTicketSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  userId: { type: Number, default: null, index: true },
  customerName: { type: String, default: '' },
  subject: { type: String, default: '' },
  category: { type: String, default: 'other' }, // booking | payment | refund | pro | other
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  messages: { type: [TicketMessageSchema], default: [] },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
