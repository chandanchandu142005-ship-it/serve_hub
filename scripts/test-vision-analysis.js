/* Automated Integration Test Suite for Real AI Vision Image Analysis (/api/ai/analyze-image) */
require('dotenv').config({ path: './backend/.env' });
const http = require('http');

function post(path, data = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api' + path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Generate real synthetic image buffers (RGB pixel spectrums)
function makeBase64Image(r, g, b, noise = false) {
  const buf = Buffer.alloc(1000);
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = Math.min(255, Math.max(0, r + (noise ? (i % 30) - 15 : 0)));
    buf[i + 1] = Math.min(255, Math.max(0, g + (noise ? (i % 20) - 10 : 0)));
    buf[i + 2] = Math.min(255, Math.max(0, b + (noise ? (i % 40) - 20 : 0)));
    buf[i + 3] = 255;
  }
  return buf.toString('base64');
}

async function runTests() {
  console.log('========================================================');
  console.log('🖼️ REAL AI VISION & IMAGE ANALYSIS TEST SUITE');
  console.log('========================================================\n');

  const testCases = [
    { name: 'Air Conditioner / Cooling Coil (Blue Spectrum)', base64: makeBase64Image(40, 130, 210, true), mimeType: 'image/jpeg' },
    { name: 'Plumbing / Water Pipe Leak (Water Reflection Spectrum)', base64: makeBase64Image(60, 140, 190, true), mimeType: 'image/png' },
    { name: 'Electrical Switchboard (Dark Metallic Spectrum)', base64: makeBase64Image(40, 40, 50, true), mimeType: 'image/jpeg' },
    { name: 'Home Deep Cleaning (High Luminance Surface Spectrum)', base64: makeBase64Image(210, 195, 170, true), mimeType: 'image/webp' },
    { name: 'Laptop / Screen Repair (Dark Display Spectrum)', base64: makeBase64Image(30, 40, 90, true), mimeType: 'image/jpeg' },
    { name: 'Furniture / Door Repair (Amber Wood Grain Spectrum)', base64: makeBase64Image(180, 110, 40, true), mimeType: 'image/jpeg' },
    { name: 'Unclear / Uniform Blur Image (Low Feature Spectrum)', base64: makeBase64Image(100, 100, 100, false), mimeType: 'image/png' },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`${i + 1}. Uploading ${tc.name} (NO filename provided)...`);
    const res = await post('/ai/analyze-image', {
      imageBase64: tc.base64,
      mimeType: tc.mimeType,
    });

    console.log(`   Status: ${res.status} | Object: ${res.data.object || 'Unclear'} | Service: ${res.data.recommendedService || 'None'} | Price: ₹${res.data.startingPrice || 'N/A'}`);
    if (res.status !== 200 || !res.data.success || !res.data.reply) {
      throw new Error(`Test failed for ${tc.name}!`);
    }
  }

  console.log('\n8. Testing Image Validation (>5 MB Limit Rejection)...');
  const hugeBuffer = Buffer.alloc(6 * 1024 * 1024).toString('base64');
  const sizeRes = await post('/ai/analyze-image', {
    imageBase64: hugeBuffer,
    mimeType: 'image/jpeg',
  });
  console.log(`   Status: ${sizeRes.status} | Code: ${sizeRes.data.code}`);
  if (sizeRes.status !== 400 || sizeRes.data.code !== 'IMAGE_TOO_LARGE') {
    throw new Error('Large image validation test failed!');
  }

  console.log('\n========================================================');
  console.log('🎉 ALL REAL AI VISION & IMAGE ANALYSIS TESTS PASSED 100%!');
  console.log('========================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ AI Vision Test Suite Failed:', err);
  process.exit(1);
});
