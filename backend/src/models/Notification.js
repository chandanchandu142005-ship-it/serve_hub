/* Servehub Notification model — in-app / push / SMS / email notifications
   for booking and payment updates, offers and system messages. */
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  userId: { type: Number, required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  type: { type: String, default: 'booking' }, // booking | payment | offer | system
  channel: { type: String, default: 'inapp' }, // inapp | push | sms | email | whatsapp
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

module.exports = mongoose.model('Notification', NotificationSchema);
