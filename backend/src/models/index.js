/* ------------------------------------------------------------------
   Servehub data models (Mongoose).
   Every entity in the marketplace has a schema here. The repository
   layer (src/repo/mongo.js) uses these models to read & write MongoDB;
   the JSON file-store fallback (src/repo/file.js) mirrors the same
   document shapes so both backends are interchangeable.
   ------------------------------------------------------------------ */
const User = require('./User');
const Professional = require('./Professional');
const Service = require('./Service');
const Category = require('./Category');
const Coupon = require('./Coupon');
const Booking = require('./Booking');
const Review = require('./Review');
const Notification = require('./Notification');
const Address = require('./Address');
const WalletTransaction = require('./WalletTransaction');
const SupportTicket = require('./SupportTicket');
const MembershipPlan = require('./MembershipPlan');
const City = require('./City');
const GiftCard = require('./GiftCard');
const Referral = require('./Referral');
const Counter = require('./Counter');
const PasswordReset = require('./PasswordReset');

module.exports = {
  User,
  Professional,
  Service,
  Category,
  Coupon,
  Booking,
  Review,
  Notification,
  Address,
  WalletTransaction,
  SupportTicket,
  MembershipPlan,
  City,
  GiftCard,
  Referral,
  Counter,
  PasswordReset,
};

