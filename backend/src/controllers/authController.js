const bcrypt = require('bcryptjs');
const repo = require('../repo');
const { generateOTP, hashOTP, compareOTP } = require('../utils/generateOTP');
const { sendPasswordResetOTP } = require('../services/emailService');
const { signToken, signResetToken, verifyResetToken } = require('../middleware/authMiddleware');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{8,15}$/;
// Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#^()])[A-Za-z\d@$!%*?&_\-#^()]{8,}$/;

const sanitizeUser = user => {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name || user.fullName,
    fullName: user.name || user.fullName,
    email: user.email,
    phone: user.phone || '',
    role: user.role === 'pro' || user.role === 'professional' ? 'professional' : user.role,
    avatar: user.avatar || user.profileImage || '',
    walletBalance: user.walletBalance || 0,
    rewardPoints: user.rewardPoints || 0,
    emailVerified: !!user.emailVerified,
    phoneVerified: !!user.phoneVerified,
    createdAt: user.createdAt,
  };
};

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { name, fullName, email, phone, password, confirmPassword, role, profileImage } = req.body || {};
    const userName = (fullName || name || '').trim();
    const userEmail = (email || '').toLowerCase().trim();
    const userPhone = (phone || '').trim();
    const userRole = role === 'professional' || role === 'pro' ? 'pro' : 'customer';

    if (!userName) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }

    if (!EMAIL_REGEX.test(userEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (userPhone && !PHONE_REGEX.test(userPhone.replace(/\s+/g, ''))) {
      return res.status(400).json({ success: false, error: 'Please enter a valid phone number (e.g. +91 98765 43210).' });
    }

    if (!PASSWORD_REGEX.test(password || '')) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    const existingUser = await repo.findUserByEmail(userEmail);
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await repo.createUser({
      name: userName,
      email: userEmail,
      phone: userPhone,
      passwordHash,
      role: userRole,
      avatar: profileImage || '',
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('[authController.register]', error);
    return res.status(500).json({ success: false, error: 'An error occurred during registration. Please try again.' });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const userEmail = (email || '').toLowerCase().trim();

    if (!userEmail || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await repo.findUserByEmail(userEmail);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Email or password is incorrect.' });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('[authController.login]', error);
    return res.status(500).json({ success: false, error: 'Unable to connect to the server. Please try again.' });
  }
}

/**
 * POST /api/auth/forgot-password
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    const userEmail = (email || '').toLowerCase().trim();

    if (!EMAIL_REGEX.test(userEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const user = await repo.findUserByEmail(userEmail);
    
    // Check cooldown for existing OTP
    const existingReset = await repo.findPasswordResetByEmail(userEmail);
    if (existingReset && (Date.now() - new Date(existingReset.createdAt).getTime()) < 60000) {
      return res.status(429).json({
        success: false,
        error: 'Please wait 60 seconds before requesting another code.',
      });
    }

    const plainOTP = generateOTP();
    const otpHash = await hashOTP(plainOTP);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    await repo.createPasswordReset({
      email: userEmail,
      userId: user ? user.id : null,
      otpHash,
      expiresAt,
    });

    // Send real email OTP via Nodemailer
    const mailResult = await sendPasswordResetOTP({
      to: userEmail,
      otp: plainOTP,
      userName: user ? user.name : 'ServeHub Customer',
    }).catch(err => {
      console.warn('[forgotPassword] Nodemailer delivery notice:', err.message);
      return { delivered: false, demo: true, otp: plainOTP };
    });

    // Response
    return res.json({
      success: true,
      message: 'If an account exists for this email, a verification code has been sent.',
      email: userEmail,
      expiresInSeconds: 300,
      delivered: mailResult ? mailResult.delivered : false,
      ...(mailResult && mailResult.demo ? { demoOtp: plainOTP, note: 'Demo mode active. Provide valid EMAIL_USER and EMAIL_PASSWORD in backend/.env for real inbox delivery.' } : {}),
    });
  } catch (error) {
    console.error('[authController.forgotPassword]', error);
    return res.status(500).json({ success: false, error: 'Unable to process your request. Please try again.' });
  }
}

/**
 * POST /api/auth/verify-otp
 */
async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body || {};
    const userEmail = (email || '').toLowerCase().trim();
    const candidateOTP = (otp || '').trim();

    if (!userEmail || !candidateOTP) {
      return res.status(400).json({ success: false, error: 'Email and 6-digit verification code are required.' });
    }

    const resetRecord = await repo.findPasswordResetByEmail(userEmail);
    if (!resetRecord) {
      return res.status(400).json({ success: false, error: 'This verification code has expired. Please request a new code.' });
    }

    // Check expiration
    if (new Date(resetRecord.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: 'This verification code has expired. Please request a new code.' });
    }

    // Check attempt limit
    if (resetRecord.attempts >= 5) {
      return res.status(400).json({ success: false, error: 'Too many failed attempts. Please request a new verification code.' });
    }

    // Compare hashed OTP
    const isMatch = await compareOTP(candidateOTP, resetRecord.otpHash);
    if (!isMatch) {
      const updatedAttempts = resetRecord.attempts + 1;
      await repo.updatePasswordResetAttempts(userEmail, updatedAttempts);
      const remainingAttempts = 5 - updatedAttempts;

      if (remainingAttempts <= 0) {
        return res.status(400).json({ success: false, error: 'Too many failed attempts. Please request a new verification code.' });
      }

      return res.status(400).json({
        success: false,
        error: `The verification code is incorrect. (${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} left)`,
      });
    }

    // Generate short-lived reset authorization token (15 mins)
    const resetToken = signResetToken(userEmail);
    const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await repo.markPasswordResetVerified(userEmail, resetToken, resetTokenExpiresAt);

    return res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken,
    });
  } catch (error) {
    console.error('[authController.verifyOTP]', error);
    return res.status(500).json({ success: false, error: 'Unable to verify OTP. Please try again.' });
  }
}

/**
 * POST /api/auth/resend-otp
 */
async function resendOTP(req, res) {
  try {
    const { email } = req.body || {};
    const userEmail = (email || '').toLowerCase().trim();

    if (!EMAIL_REGEX.test(userEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const existingReset = await repo.findPasswordResetByEmail(userEmail);
    if (existingReset && (Date.now() - new Date(existingReset.createdAt).getTime()) < 60000) {
      const remainingSecs = Math.ceil((60000 - (Date.now() - new Date(existingReset.createdAt).getTime())) / 1000);
      return res.status(429).json({
        success: false,
        error: `Please wait ${remainingSecs} seconds before requesting another code.`,
      });
    }

    const user = await repo.findUserByEmail(userEmail);
    const plainOTP = generateOTP();
    const otpHash = await hashOTP(plainOTP);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await repo.createPasswordReset({
      email: userEmail,
      userId: user ? user.id : null,
      otpHash,
      expiresAt,
    });

    const mailResult = await sendPasswordResetOTP({
      to: userEmail,
      otp: plainOTP,
      userName: user ? user.name : 'ServeHub Customer',
    }).catch(err => {
      console.warn('[resendOTP] Nodemailer delivery notice:', err.message);
      return { delivered: false, demo: true, otp: plainOTP };
    });

    return res.json({
      success: true,
      message: 'A new verification code has been sent to your email.',
      expiresInSeconds: 300,
      delivered: mailResult ? mailResult.delivered : false,
      ...(mailResult && mailResult.demo ? { demoOtp: plainOTP, note: 'Demo mode active. Provide valid EMAIL_USER and EMAIL_PASSWORD in backend/.env for real inbox delivery.' } : {}),
    });
  } catch (error) {
    console.error('[authController.resendOTP]', error);
    return res.status(500).json({ success: false, error: 'Unable to resend OTP. Please try again.' });
  }
}

/**
 * POST /api/auth/reset-password
 */
async function resetPassword(req, res) {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body || {};

    if (!resetToken) {
      return res.status(400).json({ success: false, error: 'Password reset authorization token is missing.' });
    }

    const decoded = verifyResetToken(resetToken);
    if (!decoded || !decoded.email) {
      return res.status(400).json({ success: false, error: 'Your password reset session has expired. Please request a new verification code.' });
    }

    const userEmail = decoded.email.toLowerCase().trim();
    const resetRecord = await repo.findPasswordResetByToken(resetToken);

    if (!resetRecord || !resetRecord.verified) {
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset session.' });
    }

    if (resetRecord.resetTokenExpiresAt && new Date(resetRecord.resetTokenExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: 'Password reset session has expired. Please request a new code.' });
    }

    if (!PASSWORD_REGEX.test(newPassword || '')) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    const updatedUser = await repo.updateUserPassword(userEmail, passwordHash);

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }

    // Invalidate reset tokens and OTP records for this email
    await repo.deletePasswordResetByEmail(userEmail);

    return res.json({
      success: true,
      message: 'Your password has been reset successfully.',
    });
  } catch (error) {
    console.error('[authController.resetPassword]', error);
    return res.status(500).json({ success: false, error: 'Unable to reset password. Please try again.' });
  }
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res) {
  try {
    const user = await repo.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    return res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('[authController.getMe]', error);
    return res.status(500).json({ success: false, error: 'Server error fetching user session.' });
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res) {
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resendOTP,
  resetPassword,
  getMe,
  logout,
};
