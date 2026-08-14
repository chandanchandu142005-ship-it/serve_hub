/* Automated Integration Test for Booking Location Coordinates & Address Persistence */
require('dotenv').config();
const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api' + path,
      method: 'POST',
      headers,
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api' + path,
      method: 'GET',
      headers,
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTest() {
  console.log('=== SERVEHUB GPS LOCATION & BOOKING INTEGRATION TEST ===\n');

  const testEmail = `gps_user_${Date.now()}@gmail.com`;
  const testPassword = 'GpsUser123!';

  // 1. Create User
  console.log('1. Creating test user for GPS location test...');
  const regRes = await post('/auth/register', { name: 'GPS Location Tester', email: testEmail, password: testPassword });
  console.log('   Status:', regRes.status, 'Success:', regRes.data.success);
  if (regRes.status !== 201 || !regRes.data.token) throw new Error('User creation failed!');
  const token = regRes.data.token;

  // 2. Create Booking with GPS Coordinates & Address Details
  console.log('\n2. Creating booking with GPS coordinates & structured address details...');
  const locationPayload = {
    serviceId: 's1',
    packageName: 'Standard Cleaning',
    date: '2026-08-20',
    time: '10:30 AM',
    address: 'B-402, Sunrise Residency, Linking Road, Bandra West, Mumbai, Maharashtra 400050',
    latitude: 19.0596,
    longitude: 72.8295,
    formattedAddress: 'B-402, Sunrise Residency, Linking Road, Bandra West, Mumbai, Maharashtra 400050, India',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    country: 'India',
    paymentMethod: 'wallet',
  };

  const bookingRes = await post('/bookings', locationPayload, token);
  console.log('   Status:', bookingRes.status, 'Booking ID:', bookingRes.data.booking?.id);
  if (bookingRes.status !== 201 || !bookingRes.data.booking) throw new Error('Booking creation failed!');

  const booking = bookingRes.data.booking;

  // 3. Verify Persisted Location Fields
  console.log('\n3. Verifying persisted location fields in created booking:');
  console.log('   Latitude:', booking.latitude, '(Expected: 19.0596)');
  console.log('   Longitude:', booking.longitude, '(Expected: 72.8295)');
  console.log('   Formatted Address:', booking.formattedAddress);
  console.log('   City:', booking.city);
  console.log('   State:', booking.state);
  console.log('   Pincode:', booking.pincode);
  console.log('   Country:', booking.country);

  if (booking.latitude !== 19.0596 || booking.longitude !== 72.8295) {
    throw new Error('Latitude/Longitude failed to persist correctly!');
  }
  if (!booking.formattedAddress || !booking.city) {
    throw new Error('Formatted address / city failed to persist!');
  }

  // 4. Retrieve Bookings via GET /api/bookings
  console.log('\n4. Fetching user bookings via GET /api/bookings...');
  const listRes = await get('/bookings', token);
  console.log('   Status:', listRes.status, 'Total Bookings:', listRes.data.bookings?.length);
  if (listRes.status !== 200 || !listRes.data.bookings || listRes.data.bookings.length === 0) {
    throw new Error('Fetching bookings list failed!');
  }

  const fetchedBk = listRes.data.bookings.find(b => b.id === booking.id);
  if (!fetchedBk || fetchedBk.latitude !== 19.0596 || fetchedBk.longitude !== 72.8295) {
    throw new Error('Retrieved booking does not match saved coordinates!');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL GPS LOCATION & BOOKING INTEGRATION TESTS PASSED!');
  console.log('======================================================\n');
}

runTest().catch(err => {
  console.error('\n❌ GPS Location Integration Test Failed:', err);
  process.exit(1);
});
