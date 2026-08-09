/* ------------------------------------------------------------------
   SMS + WhatsApp delivery test for Servehub.
   Usage:  node scripts/test-notify.js [channel] [phone]
           channel: sms (default) | whatsapp | all
   - With TWILIO_* / WHATSAPP_* configured in backend/.env → sends a REAL
     message through the provider.
   - Otherwise → logs the demo message (the OTP is returned by the API in
     demo mode).
   ------------------------------------------------------------------ */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sendSms, sendWhatsApp } = require('../src/services/notifier');

const channel = (process.argv[2] || 'sms').toLowerCase();
const phone = (process.argv[3] || '+919876543210').replace(/[^\d+]/g, '');
const otp = String(Math.floor(100000 + Math.random() * 900000));
const text = `Servehub: your verification code is ${otp}. It expires in 10 minutes. Do not share this code.`;

const run = async (ch, sendFn) => {
  console.log(`\n— ${ch.toUpperCase()} → ${phone}`);
  try {
    const r = await sendFn(phone, text);
    if (r.demo) {
      console.log('  [demo] No provider configured — message logged to server console.');
      console.log('  Configure TWILIO_* / WHATSAPP_* in backend/.env to deliver for real.');
    } else {
      console.log(`  ✓ REAL ${ch.toUpperCase()} sent via ${r.provider}${r.sid ? ' (sid ' + r.sid + ')' : ''}${r.id ? ' (id ' + r.id + ')' : ''}`);
    }
  } catch (err) {
    console.error(`  ✗ ${ch.toUpperCase()} failed:`, err.message);
    process.exitCode = 1;
  }
};

(async () => {
  if (channel === 'all') { await run('sms', sendSms); await run('whatsapp', sendWhatsApp); }
  else if (channel === 'whatsapp') await run('whatsapp', sendWhatsApp);
  else await run('sms', sendSms);
})();
