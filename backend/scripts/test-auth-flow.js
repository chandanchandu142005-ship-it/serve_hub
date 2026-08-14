require('dotenv').config();
process.env.ALLOW_MOCK_GOOGLE = 'true';
const http = require('http');
const { initDb } = require('../src/config/db');
const repo = require('../src/repo');

const API_BASE = 'http://localhost:4000/api/auth';

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(API_BASE + path);
    const req = http.request(u, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(buf) }); }
        catch (e) { resolve({ status: res.statusCode, raw: buf }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(API_BASE + path);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const req = http.get(u, { headers }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(buf) }); }
        catch (e) { resolve({ status: res.statusCode, raw: buf }); }
      });
    });
    req.on('error', reject);
  });
}

async function runTest() {
  await initDb();
  console.log('\n=== SERVEHUB AUTHENTICATION & LOGIN CONDITIONS TEST ===\n');

  console.log('1. Testing GET /api/auth/config...');
  const cfgRes = await get('/config');
  console.log('   Status:', cfgRes.status, 'Data:', cfgRes.data);
  if (cfgRes.status !== 200 || !cfgRes.data.success) throw new Error('GET /config failed');

  console.log('\n2. Testing POST /api/auth/login without email (must be rejected)...');
  const noEmailRes = await post('/login', { password: 'Password123!' });
  console.log('   Status:', noEmailRes.status, 'Error Message:', noEmailRes.data.error);
  if (noEmailRes.status !== 400 || noEmailRes.data.error !== 'Email address is required.') {
    throw new Error('Missing email was not rejected with 400!');
  }

  console.log('\n3. Testing POST /api/auth/login with invalid email format (must be rejected)...');
  const invalidEmailRes = await post('/login', { email: 'invalid-email-format', password: 'Password123!' });
  console.log('   Status:', invalidEmailRes.status, 'Error Message:', invalidEmailRes.data.error);
  if (invalidEmailRes.status !== 400) throw new Error('Invalid email format was not rejected with 400!');

  console.log('\n4. Testing POST /api/auth/login with unregistered email (must return 404)...');
  const unregRes = await post('/login', { email: 'unregistered_user_999@gmail.com', password: 'Password123!' });
  console.log('   Status:', unregRes.status, 'Error Message:', unregRes.data.error);
  if (unregRes.status !== 404 || unregRes.data.error !== 'Account not found. Please register first.') {
    throw new Error('Unregistered email did not return 404 "Account not found. Please register first."');
  }

  const testEmail = `user_${Date.now()}@gmail.com`;
  const initialPassword = 'Password123!';
  const newPassword = 'NewSecretPassword123!';

  console.log(`\n5. Creating user account for ${testEmail}...`);
  const regRes = await post('/register', {
    name: 'Test Auth User',
    email: testEmail,
    password: initialPassword,
    role: 'customer',
  });
  console.log('   Status:', regRes.status, 'Success:', regRes.data.success, 'Token Created:', !!regRes.data.token);
  if (regRes.status !== 201 || !regRes.data.success) throw new Error('User registration failed!');

  console.log('\n6. Testing POST /api/auth/login with INCORRECT password (must return 401)...');
  const wrongPassRes = await post('/login', { email: testEmail, password: 'WrongPassword123!' });
  console.log('   Status:', wrongPassRes.status, 'Error Message:', wrongPassRes.data.error);
  if (wrongPassRes.status !== 401 || wrongPassRes.data.error !== 'Incorrect password.') {
    throw new Error('Incorrect password did not return 401 "Incorrect password."');
  }

  console.log('\n7. Testing POST /api/auth/login with CORRECT password (must return 200 & JWT)...');
  const correctPassRes = await post('/login', { email: testEmail, password: initialPassword });
  console.log('   Status:', correctPassRes.status, 'Success:', correctPassRes.data.success, 'Token:', !!correctPassRes.data.token, 'User:', correctPassRes.data.user);
  if (correctPassRes.status !== 200 || !correctPassRes.data.token) throw new Error('Valid login failed!');

  console.log('\n8. Testing Forgot Password flow POST /api/auth/forgot-password...');
  const forgotRes = await post('/forgot-password', { email: testEmail });
  console.log('   Status:', forgotRes.status, 'Message:', forgotRes.data.message, 'Delivered:', forgotRes.data.delivered);
  if (forgotRes.status !== 200 || !forgotRes.data.success) throw new Error('Forgot password request failed!');

  const resetRecord = await repo.findPasswordResetByEmail(testEmail);
  const demoOtp = forgotRes.data.demoOtp;

  if (demoOtp) {
    console.log('\n9. Testing OTP verification POST /api/auth/verify-otp...');
    const verifyRes = await post('/verify-otp', { email: testEmail, otp: demoOtp });
    console.log('   Status:', verifyRes.status, 'Reset Token Created:', !!verifyRes.data.resetToken);
    if (verifyRes.status !== 200 || !verifyRes.data.resetToken) throw new Error('OTP verification failed!');

    const resetToken = verifyRes.data.resetToken;

    console.log('\n10. Testing Password Reset POST /api/auth/reset-password...');
    const resetRes = await post('/reset-password', { resetToken, newPassword, confirmPassword: newPassword });
    console.log('   Status:', resetRes.status, 'Message:', resetRes.data.message);
    if (resetRes.status !== 200 || !resetRes.data.success) throw new Error('Password reset failed!');

    console.log('\n11. Testing Login with NEW password...');
    const newPassLoginRes = await post('/login', { email: testEmail, password: newPassword });
    console.log('   Status:', newPassLoginRes.status, 'Logged in:', newPassLoginRes.data.success, 'Token:', !!newPassLoginRes.data.token);
    if (newPassLoginRes.status !== 200 || !newPassLoginRes.data.token) throw new Error('Login with new password failed!');
  }

  const googleId = 'g_' + Date.now();
  const googleEmail = `google_user_${Date.now()}@gmail.com`;

  console.log(`\n12. Testing Google OAuth Authentication for ${googleEmail}...`);
  const oauthRes = await post('/google', {
    googleId,
    email: googleEmail,
    name: 'Google Auth User',
    picture: 'https://lh3.googleusercontent.com/a/test-avatar',
    role: 'customer',
  });
  console.log('   Status:', oauthRes.status, 'Token Generated:', !!oauthRes.data.token);
  if (oauthRes.status !== 200 || !oauthRes.data.token) throw new Error('Google OAuth failed!');

  console.log('\n13. Checking User Session via GET /api/auth/me...');
  const meRes = await get('/me', correctPassRes.data.token);
  console.log('   Status:', meRes.status, 'User Email:', meRes.data.user?.email);
  if (meRes.status !== 200 || meRes.data.user?.email !== testEmail) throw new Error('Session retrieval failed!');

  console.log('\n======================================================');
  console.log('🎉 ALL AUTHENTICATION & LOGIN CONDITION TESTS PASSED!');
  console.log('======================================================\n');
  process.exit(0);
}

runTest().catch(err => {
  console.error('\n❌ Authentication Integration Test Failed:', err);
  process.exit(1);
});
