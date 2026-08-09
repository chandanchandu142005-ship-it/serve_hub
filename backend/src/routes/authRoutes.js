const express = require('express');
const authController = require('../controllers/authController');
const { auth, authLimiter, otpLimiter } = require('../middleware/authMiddleware');

const router = express.Router();

// Registration
router.post('/register', authLimiter, authController.register);

// Login
router.post('/login', authLimiter, authController.login);

// Password Reset Flow
router.post('/forgot-password', otpLimiter, authController.forgotPassword);
router.post('/verify-otp', authLimiter, authController.verifyOTP);
router.post('/resend-otp', otpLimiter, authController.resendOTP);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Session management
router.get('/me', auth, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
