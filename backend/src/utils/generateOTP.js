const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a secure 6-digit random numeric OTP string.
 */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Hash an OTP string securely using bcrypt.
 */
async function hashOTP(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

/**
 * Compare plain OTP with hashed OTP.
 */
async function compareOTP(candidateOTP, hashedOTP) {
  return bcrypt.compare(candidateOTP, hashedOTP);
}

module.exports = {
  generateOTP,
  hashOTP,
  compareOTP,
};
