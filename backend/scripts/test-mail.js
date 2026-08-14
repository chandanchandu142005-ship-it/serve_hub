/* ------------------------------------------------------------------
   Email delivery test for Servehub.
   Usage:  node scripts/test-mail.js [recipient@example.com]

   - If SMTP_* is configured in backend/.env → sends a REAL email through
     that provider to the recipient.
   - Otherwise → creates a free Ethereal test account, sends through
     Ethereal's real SMTP server, and prints the URL where you can open
     the received email (https://ethereal.email inbox).

   Run it once after filling SMTP_* to confirm real delivery works.
   ------------------------------------------------------------------ */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');
const { isDemo } = require('../src/services/mailer');

const recipient = process.argv[2] || 'test@servehub.in';
const otp = String(Math.floor(100000 + Math.random() * 900000));

async function sendViaConfiguredSmtp() {
  const SMTP_HOST = process.env.SMTP_HOST || '';
  const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
  const SMTP_USER = process.env.SMTP_USER || '';
  const SMTP_PASS = process.env.SMTP_PASS || '';
  const MAIL_FROM = process.env.MAIL_FROM || 'Servehub <no-reply@servehub.in>';

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: recipient,
    subject: `Your Servehub login code is ${otp}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto;padding:28px;border:1px solid #e5e7eb;border-radius:16px">
        <div style="font-size:18px;font-weight:900;color:#111827;margin-bottom:16px">Serve<b style="color:#2563EB">hub</b></div>
        <h2 style="color:#111827;font-size:20px;margin:0 0 8px">Your login code</h2>
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 18px">Use the 6-digit code below to log in. It expires in 10 minutes.</p>
        <div style="background:#f0f5ff;border:1px dashed #2563EB;border-radius:14px;padding:18px;text-align:center;margin-bottom:18px">
          <span style="font-size:34px;font-weight:900;letter-spacing:8px;color:#2563EB">${otp}</span>
        </div>
        <p style="color:#9ca3af;font-size:12.5px;line-height:1.6;margin:0">Sent by the Servehub email test. If you didn't request this, ignore it.</p>
      </div>`,
  });
  console.log('✓ REAL email sent through your configured SMTP →', recipient);
  console.log('  Provider :', SMTP_HOST + ':' + SMTP_PORT);
  console.log('  Message id:', info.messageId);
  console.log('  Check the recipient inbox (delivery may take a few seconds).');
}

async function sendViaEthereal() {
  console.log('No SMTP configured — proving real delivery with a free Ethereal test SMTP…\n');
  const acc = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: acc.user, pass: acc.pass },
  });
  const info = await transporter.sendMail({
    from: 'Servehub <no-reply@servehub.test>',
    to: recipient,
    subject: `Your Servehub login code is ${otp}`,
    html: `<h2>Servehub OTP</h2><p style="font-size:34px;letter-spacing:6px;color:#2563EB">${otp}</p><p>This is a <b>real email</b> sent through Ethereal's SMTP server to prove Servehub's mailer pipeline works.</p>`,
  });
  console.log('✓ REAL email SENT through Ethereal SMTP (this is not a simulation)');
  console.log('  Message id:', info.messageId);
  console.log('  Open it in the Ethereal inbox 👉', nodemailer.getTestMessageUrl(info));
  console.log('\nTo send to a real inbox, add your provider to backend/.env and re-run:');
  console.log('  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS  (see backend/.env.example)');
}

(async () => {
  try {
    if (!isDemo()) await sendViaConfiguredSmtp();
    else await sendViaEthereal();
  } catch (err) {
    console.error('✗ Email failed:', err.message);
    process.exit(1);
  }
})();
