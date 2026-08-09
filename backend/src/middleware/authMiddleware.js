const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const JWT_SECRET = process.env.JWT_SECRET || 'servehub-secret-key-change-in-production';

/**
 * Sign JWT token for user payload.
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Sign short-lived reset token for verified OTP.
 */
function signResetToken(email) {
  return jwt.sign(
    { email, scope: 'password_reset' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Verify reset token.
 */
function verifyResetToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.scope !== 'password_reset') return null;
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Protect routes middleware.
 */
function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Rate limiter for auth endpoints.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 OTP requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP requests. Please wait a minute before trying again.' },
});

module.exports = {
  signToken,
  signResetToken,
  verifyResetToken,
  auth,
  authLimiter,
  otpLimiter,
  JWT_SECRET,
};
