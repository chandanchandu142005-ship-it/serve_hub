const express = require('express');
const authController = require('../controllers/authController');
const { auth, authLimiter, otpLimiter } = require('../middleware/authMiddleware');
const repo = require('../repo');
const wrap = require('../middleware/async');
const { sendSms, sendWhatsApp } = require('../services/notifier');

const router = express.Router();

// Primary authentication routes
router.get('/config', authController.getAuthConfig);
router.post('/google', authLimiter, authController.googleAuth);
router.post('/send-registration-otp', otpLimiter, authController.sendRegistrationOTP);
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', otpLimiter, authController.forgotPassword);
router.post('/verify-otp', authLimiter, authController.verifyOTP);
router.post('/resend-otp', otpLimiter, authController.resendOTP);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.get('/me', auth, authController.getMe);
router.post('/logout', authController.logout);

// Legacy phone/SMS OTP endpoints for compatibility
const otpStore = new Map();
const PHONE_RE = /^\+?\d{8,15}$/;
const MAX_OTP_TRIES = 5;
const OTP_COOLDOWN_MS = 15000;
const OTP_BYPASS = process.env.OTP_BYPASS !== 'false';
const genCode = () => String(Math.floor(100000 + Math.random() * 900000));

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of otpStore) if (v.exp < now) otpStore.delete(k);
}, 60 * 1000).unref?.();

router.post('/otp/request', wrap(async (req, res) => {
  const { phone, channel = 'sms' } = req.body || {};
  const to = String(phone || '').trim().replace(/[^\d+]/g, '');
  if (!PHONE_RE.test(to)) return res.status(400).json({ error: 'A valid phone number is required (e.g. +919876543210)' });
  const ch = String(channel).toLowerCase() === 'whatsapp' ? 'whatsapp' : 'sms';
  const storeKey = 'p:' + to;

  const prev = otpStore.get(storeKey);
  if (prev && Date.now() - (prev.created || 0) < OTP_COOLDOWN_MS) {
    return res.status(429).json({ error: 'Please wait a few seconds before requesting another code' });
  }

  const otp = genCode();
  otpStore.set(storeKey, { otp, exp: Date.now() + 10 * 60 * 1000, tries: 0, created: Date.now() });
  const text = `Servehub: your verification code is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`;

  let sent;
  try {
    sent = ch === 'whatsapp' ? await sendWhatsApp(to, text) : await sendSms(to, text);
  } catch (err) {
    console.error('[notify] delivery failed:', err.message);
    sent = { delivered: false, demo: false, error: err.message };
  }

  res.json({
    ok: true,
    sentTo: to,
    channel: ch,
    delivered: !!sent.delivered,
    provider: sent.demo ? 'demo' : sent.provider || (sent.error ? 'provider-error' : 'provider'),
    ...(sent.error ? { error: sent.error } : {}),
    ...(OTP_BYPASS ? { otp, note: 'Demo mode: OTP returned in response instead of being delivered.' } : {}),
  });
}));

router.post('/otp/verify', wrap(async (req, res) => {
  const { phone, email, otp } = req.body || {};
  if (email && !phone) {
    return authController.verifyOTP(req, res);
  }

  const key = (phone ? String(phone).replace(/[^\d+]/g, '') : String(email || '').trim());
  const recKey = ['p:', 'e:'].map(pre => pre + key).find(k => otpStore.has(k)) || key;
  const rec = otpStore.get(recKey);
  if (!rec || rec.exp < Date.now()) return res.status(400).json({ error: 'OTP expired — request a new one' });
  if (rec.otp !== String(otp).trim()) {
    rec.tries = (rec.tries || 0) + 1;
    if (rec.tries >= MAX_OTP_TRIES) { otpStore.delete(recKey); return res.status(400).json({ error: 'Too many attempts — request a new code' }); }
    otpStore.set(recKey, rec);
    return res.status(400).json({ error: 'Invalid OTP' });
  }
  otpStore.delete(recKey);
  res.json({ ok: true, success: true });
}));

module.exports = router;
