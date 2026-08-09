/* Wraps async route handlers so rejected promises reach Express' error middleware. */
module.exports = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
