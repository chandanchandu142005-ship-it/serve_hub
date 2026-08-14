/* Auto-increment counter — used by the repository to assign stable
   numeric ids (user, pro, booking, …) across collections. */
const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // counter name: 'user' | 'pro' | ...
  // NOTE: no default on `seq` — the repo pre-creates counters with $max/upsert
  // and bumps with $inc; a default would conflict with the $inc on a fresh doc.
  seq: { type: Number },
}, { versionKey: false });

module.exports = mongoose.model('Counter', CounterSchema);
