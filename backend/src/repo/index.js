/* Repository dispatcher — routes every data call to the active backend
   (MongoDB when connected, JSON file store otherwise). Routes call
   `repo.<function>(...)` without caring which storage is live. */
const db = require('../config/db');
const mongoImpl = require('./mongo');
const fileImpl = require('./file');

let cached = null;
const current = () => {
  const mode = db.mode();
  if (!cached || cached.mode !== mode) {
    cached = { mode, ...(mode === 'mongo' ? mongoImpl : fileImpl) };
  }
  return cached;
};

module.exports = new Proxy({}, {
  get: (_, name) => (...args) => current()[name](...args),
});
