/* ------------------------------------------------------------------
   Mailer — transactional emails (OTP, verification) via SMTP.
   No SMTP configured → demo mode: the email is printed to the server
   console and the OTP is returned in the API response (OTP_BYPASS).
   ------------------------------------------------------------------ */
const nodemailer = require('nodemailer');

const SMTP_HOST = (process.env.SMTP_HOST || '').trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = (process.env.SMTP_USER || '').trim();
const SMTP_PASS = (process.env.SMTP_PASS || '').trim();
const MAIL_FROM = process.env.MAIL_FROM || 'Servehub <no-reply@servehub.in>';

const isDemo = () => !SMTP_HOST;

let transporter = null;
if (!isDemo()) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
}

function otpEmailHtml(otp, name) {
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:28px;border:1px solid #e5e7eb;border-radius:16px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
      <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#2563EB,#0EA5E9);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:18px">⚡</div>
      <b style="font-size:18px;color:#111827">Serve<b style="color:#2563EB">hub</b></b>
    </div>
    <h1 style="font-size:20px;color:#111827;margin:0 0 8px">Your login code</h1>
    <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 20px">${greeting}<br>Use the 6-digit code below to complete your login. It expires in 10 minutes.</p>
    <div style="background:#f0f5ff;border:1px dashed #2563EB;border-radius:14px;padding:18px;text-align:center;margin-bottom:20px">
      <span style="font-size:34px;font-weight:900;letter-spacing:8px;color:#2563EB">${otp}</span>
    </div>
    <p style="font-size:12.5px;color:#9ca3af;line-height:1.6;margin:0">If you didn't request this code, you can safely ignore this email.<br>© 2026 Servehub Services Pvt. Ltd.</p>
  </div>`;
}

async function sendOtpEmail({ to, otp, name }) {
  if (isDemo()) {
    console.log(`[mail:demo] TO=${to} · subject=Your Servehub login code is ${otp} · body=6-digit code: ${otp} (expires in 10 min)`);
    return { delivered: false, demo: true };
  }
  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: `Your Servehub login code is ${otp}`,
    html: otpEmailHtml(otp, name),
  });
  return { delivered: true, demo: false };
}

module.exports = { sendOtpEmail, isDemo };
