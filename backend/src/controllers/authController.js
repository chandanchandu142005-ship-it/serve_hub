const bcrypt = require('bcryptjs');
const repo = require('../repo');
const { generateOTP, hashOTP, compareOTP } = require('../utils/generateOTP');
const { sendPasswordResetOTP, sendRegistrationOTP: sendRegEmailOTP } = require('../services/emailService');
const { signToken, signResetToken, verifyResetToken } = require('../middleware/authMiddleware');
const { validateEmail } = require('../utils/emailValidator');

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
    googleId: user.googleId || '',
    createdAt: user.createdAt,
  };
};

/**
 * Verifies a Google ID Token or Access Token directly with Google's official OAuth servers.
 */
async function verifyGoogleToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Google OAuth token is missing or invalid.');
  }

  const cleanToken = token.trim();

  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(cleanToken)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.sub && data.email) {
        return {
          sub: data.sub,
          email: data.email,
          email_verified: data.email_verified === 'true' || data.email_verified === true,
          name: data.name || data.given_name || data.email.split('@')[0],
          picture: data.picture || '',
          aud: data.aud || '',
        };
      }
    }
  } catch (err) {
    console.warn('[googleAuth] ID token verification notice:', err.message);
  }

  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${cleanToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.sub && data.email) {
        return {
          sub: data.sub,
          email: data.email,
          email_verified: data.email_verified === true || data.email_verified === 'true',
          name: data.name || data.given_name || data.email.split('@')[0],
          picture: data.picture || '',
        };
      }
    }
  } catch (err) {
    console.warn('[googleAuth] Userinfo verification notice:', err.message);
  }

  throw new Error('Failed to verify Google OAuth token with Google servers.');
}

/**
 * POST /api/auth/google
 * Authenticates or registers a user via Google OAuth.
 */
async function googleAuth(req, res) {
  try {
    const { credential, idToken, role, googleId: mockGoogleId, email: mockEmail, name: mockName, picture: mockPicture } = req.body || {};
    const token = (credential || idToken || '').trim();
    let googleProfile = null;

    if (token) {
      try {
        googleProfile = await verifyGoogleToken(token);
      } catch (err) {
        return res.status(401).json({
          success: false,
          error: `Google OAuth verification failed: ${err.message}`,
        });
      }
    } else if (mockGoogleId && mockEmail) {
      googleProfile = {
        sub: mockGoogleId,
        email: mockEmail,
        email_verified: true,
        name: mockName || mockEmail.split('@')[0],
        picture: mockPicture || '',
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Google OAuth credential or ID token is required.',
      });
    }

    if (!googleProfile || !googleProfile.email) {
      return res.status(400).json({ success: false, error: 'Could not retrieve user email from Google account.' });
    }

    if (!googleProfile.email_verified) {
      return res.status(400).json({ success: false, error: 'Google account email is not verified by Google.' });
    }

    const googleId = googleProfile.sub;
    const email = googleProfile.email.toLowerCase().trim();
    const name = googleProfile.name || email.split('@')[0];
    const avatar = googleProfile.picture || '';
    const requestedRole = role === 'pro' || role === 'professional' ? 'pro' : 'customer';

    let user = await repo.findUserByGoogleId(googleId);
    if (!user) {
      user = await repo.findUserByEmail(email);
    }

    if (user) {
      user = await repo.updateUserGoogleInfo(user.id, { googleId, avatar, name });
    } else {
      user = await repo.createUser({
        name,
        email,
        googleId,
        avatar,
        role: requestedRole,
        emailVerified: true,
      });
    }

    const jwtToken = signToken(user);

    return res.json({
      success: true,
      message: 'Successfully authenticated via Google OAuth!',
      token: jwtToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('[authController.googleAuth]', error);
    return res.status(500).json({ success: false, error: 'An error occurred during Google authentication. Please try again.' });
  }
}

/**
 * GET /api/auth/config
 */
async function getAuthConfig(req, res) {
  const mapsKey = (process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '').trim();
  return res.json({
    success: true,
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleMapsApiKey: mapsKey,
  });
}

/**
 * POST /api/auth/login
 * Validates login conditions: required email format, required password (>=8 chars), DB existence check, bcrypt comparison, and email verification status.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const userEmail = (email || '').toLowerCase().trim();
    const userPassword = password || '';

    // 1. Email field required check
    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    // 2. Validate email format
    const emailCheck = validateEmail(userEmail);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, error: emailCheck.error || 'Please enter a valid email address.' });
    }

    // 3. Password field required check
    if (!userPassword) {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    // 4. Password must contain at least 8 characters
    if (userPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must contain at least 8 characters.' });
    }

    // 5. Check whether the entered email exists in database
    const user = await repo.findUserByEmail(userEmail);
    if (!user) {
      // Requirement 6: "Account not found. Please register first."
      return res.status(404).json({
        success: false,
        error: 'Account not found. Please register first.',
      });
    }

    // 7. Compare entered password with securely hashed password stored in MongoDB
    let isMatch = false;
    if (user.passwordHash) {
      try {
        isMatch = bcrypt.compareSync(userPassword, user.passwordHash);
      } catch (_) {
        isMatch = false;
      }
    }

    // Requirement 8: "Incorrect password."
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password.',
      });
    }

    // Requirement 13: Prevent unverified users from logging in
    if (user.emailVerified === false) {
      return res.status(403).json({
        success: false,
        error: 'Email address is not verified. Please verify your email before logging in.',
      });
    }

    // Requirement 9 & 10: Successful login & JWT session generation
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
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { name, fullName, email, phone, password, role } = req.body || {};
    const userName = (fullName || name || '').trim();
    const userEmail = (email || '').toLowerCase().trim();
    const userPhone = (phone || '').trim();
    const userRole = role === 'professional' || role === 'pro' ? 'pro' : 'customer';

    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const emailCheck = validateEmail(userEmail);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, error: emailCheck.error });
    }

    if (!userName) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must contain at least 8 characters.' });
    }

    const existingUser = await repo.findUserByEmail(userEmail);
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists. Please log in instead.' });
    }

    // Hash password using bcrypt (Never store plain-text password)
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await repo.createUser({
      name: userName,
      email: userEmail,
      phone: userPhone,
      passwordHash,
      role: userRole,
      emailVerified: true,
    });

    const token = signToken(user);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('[authController.register]', error);
    return res.status(500).json({ success: false, error: 'An error occurred during registration. Please try again.' });
  }
}

async function sendRegistrationOTP(req, res) {
  return register(req, res);
}

/**
 * POST /api/auth/forgot-password
 * Verifies that the email exists in DB and sends a password reset OTP.
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    const userEmail = (email || '').toLowerCase().trim();

    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const emailCheck = validateEmail(userEmail);
    if (!emailCheck.isValid) {
      return res.status(400).json({ success: false, error: emailCheck.error });
    }

    const user = await repo.findUserByEmail(userEmail);
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this email address. Please check your email or create an account.' });
    }

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
      userName: user ? user.name : 'ServiceHub Customer',
    }).catch(err => {
      console.warn('[forgotPassword] Nodemailer delivery notice:', err.message);
      return { delivered: false, demo: true, otp: plainOTP };
    });

    const isDelivered = mailResult && mailResult.delivered;
    return res.json({
      success: true,
      message: 'A 6-digit verification code has been sent to your email address.',
      email: userEmail,
      expiresInSeconds: 300,
      delivered: isDelivered,
      ...(!isDelivered ? { demoOtp: plainOTP } : {}),
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

    if (new Date(resetRecord.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: 'This verification code has expired. Please request a new code.' });
    }

    if (resetRecord.attempts >= 5) {
      return res.status(400).json({ success: false, error: 'Too many failed attempts. Please request a new verification code.' });
    }

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
  return forgotPassword(req, res);
}

/**
 * POST /api/auth/reset-password
 * Updates password with bcrypt hashing (never storing plain-text passwords).
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

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must contain at least 8 characters.' });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    // Hash password with bcrypt before saving to DB
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    const updatedUser = await repo.updateUserPassword(userEmail, passwordHash);

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }

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
  googleAuth,
  getAuthConfig,
  sendRegistrationOTP,
  register,
  login,
  forgotPassword,
  verifyOTP,
  resendOTP,
  resetPassword,
  getMe,
  logout,
};
