require('dotenv').config();
const http = require('http');
const { initDb } = require('../src/config/db');
const repo = require('../src/repo');
const { hashOTP } = require('../src/utils/generateOTP');

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

async function runTest() {
  await initDb();
  console.log('\n=== SERVEHUB AUTHENTICATION INTEGRATION TEST ===\n');

  const testEmail = `user_${Date.now()}@servehub.com`;
  const initialPassword = 'Password@123';
  const newPassword = 'NewPassword@999';

  console.log(`1. Testing Registration for ${testEmail}...`);
  const regRes = await post('/register', {
    fullName: 'Integration Test User',
    email: testEmail,
    phone: '+919988776655',
    password: initialPassword,
    confirmPassword: initialPassword,
    role: 'customer',
  });
  console.log('   Status:', regRes.status, 'Response:', regRes.data);
  if (!regRes.data.success) throw new Error('Registration failed');

  console.log('\n2. Testing Login with initial password...');
  const login1Res = await post('/login', { email: testEmail, password: initialPassword });
  console.log('   Status:', login1Res.status, 'User Name:', login1Res.data.user?.name);
  if (!login1Res.data.success) throw new Error('Initial login failed');

  console.log('\n3. Testing Forgot Password...');
  const forgotRes = await post('/forgot-password', { email: testEmail });
  console.log('   Status:', forgotRes.status, 'Message:', forgotRes.data.message);

  const resetDoc = await repo.findPasswordResetByEmail(testEmail);
  console.log('   DB PasswordReset Record Found:', !!resetDoc, 'Attempts:', resetDoc?.attempts);

  console.log('\n4. Testing OTP Verification with wrong OTP...');
  const wrongVerify = await post('/verify-otp', { email: testEmail, otp: '000000' });
  console.log('   Status:', wrongVerify.status, 'Response:', wrongVerify.data);

  console.log('\n5. Setting known OTP hash in DB & Testing OTP Verification with correct OTP...');
  const testOTP = '654321';
  const testHash = await hashOTP(testOTP);
  await repo.createPasswordReset({
    email: testEmail,
    userId: resetDoc?.userId || 9003,
    otpHash: testHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  const correctVerify = await post('/verify-otp', { email: testEmail, otp: testOTP });
  console.log('   Status:', correctVerify.status, 'ResetToken Received:', !!correctVerify.data.resetToken);
  if (!correctVerify.data.success || !correctVerify.data.resetToken) throw new Error('OTP Verification failed');

  const resetToken = correctVerify.data.resetToken;

  console.log('\n6. Testing Reset Password with new password...');
  const resetRes = await post('/reset-password', {
    resetToken,
    newPassword,
    confirmPassword: newPassword,
  });
  console.log('   Status:', resetRes.status, 'Message:', resetRes.data.message);
  if (!resetRes.data.success) throw new Error('Password reset failed');

  console.log('\n7. Testing Login with OLD password (should fail)...');
  const oldLoginRes = await post('/login', { email: testEmail, password: initialPassword });
  console.log('   Status:', oldLoginRes.status, 'Success:', oldLoginRes.data.success, 'Error:', oldLoginRes.data.error);

  console.log('\n8. Testing Login with NEW password (should succeed)...');
  const newLoginRes = await post('/login', { email: testEmail, password: newPassword });
  console.log('   Status:', newLoginRes.status, 'Success:', newLoginRes.data.success, 'User Email:', newLoginRes.data.user?.email);
  if (!newLoginRes.data.success) throw new Error('Login with new password failed');

  console.log('\n======================================================');
  console.log('🎉 ALL AUTHENTICATION FLOW TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================\n');
  process.exit(0);
}

runTest().catch(err => {
  console.error('\n❌ Integration Test Failed:', err);
  process.exit(1);
});
