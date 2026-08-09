const nodemailer = require('nodemailer');

const EMAIL_HOST = (process.env.EMAIL_HOST || process.env.SMTP_HOST || '').trim();
const EMAIL_PORT = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
const EMAIL_USER = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
const EMAIL_PASSWORD = (process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '').trim();
const EMAIL_FROM = process.env.EMAIL_FROM || process.env.MAIL_FROM || 'ServeHub <no-reply@servehub.in>';

const isPlaceholder = (val) => {
  if (!val) return true;
  const lower = String(val).toLowerCase();
  return lower.includes('your_email') || lower.includes('your_app_password') || lower.includes('example.com') || lower.includes('yourgmail');
};

const isRealSmtpConfigured = () => {
  return EMAIL_HOST && !isPlaceholder(EMAIL_USER) && !isPlaceholder(EMAIL_PASSWORD);
};

let transporter = null;

function getTransporter() {
  if (!transporter && isRealSmtpConfigured()) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return transporter;
}

/**
 * Generate HTML body for Password Reset OTP email.
 */
function buildResetEmailHtml(otp, userName = 'User') {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>ServeHub Password Reset OTP</title>
  </head>
  <body style="font-family: 'Inter', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px;">
    <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px 32px; text-align: left;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Serve<span style="color: #60a5fa;">Hub</span></span>
        </div>
        <p style="color: #dbeafe; font-size: 14px; margin: 6px 0 0 0;">Home Service Booking Platform</p>
      </div>

      <!-- Content -->
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #1f2937; margin-top: 0;">Hello ${userName},</p>
        
        <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
          We received a request to reset your ServeHub password.
        </p>

        <p style="font-size: 15px; color: #4b5563; margin-bottom: 12px;">
          Your verification code is:
        </p>

        <!-- OTP Card -->
        <div style="background-color: #eff6ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 800; color: #1e40af; letter-spacing: 10px; font-family: monospace;">${otp}</span>
        </div>

        <p style="font-size: 14px; color: #dc2626; font-weight: 600; margin-bottom: 20px;">
          ⏱️ This OTP is valid for 5 minutes.
        </p>

        <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
          If you did not request a password reset, please ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />

        <p style="font-size: 14px; color: #374151; margin: 0;">
          Regards,<br>
          <strong>ServeHub Team</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          © ${new Date().getFullYear()} ServeHub Technologies. All rights reserved.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Send Password Reset OTP email to user.
 */
async function sendPasswordResetOTP({ to, otp, userName }) {
  const subject = 'ServeHub Password Reset OTP';
  const html = buildResetEmailHtml(otp, userName);

  if (!isRealSmtpConfigured()) {
    console.log(`\n======================================================`);
    console.log(`⚡ SERVEHUB OTP VERIFICATION CODE`);
    console.log(`To Email:   ${to}`);
    console.log(`OTP Code:   ${otp}`);
    console.log(`Valid For:  5 minutes`);
    console.log(`Note:       To receive real emails in your inbox, set your EMAIL_USER and EMAIL_PASSWORD (Gmail App Password) in backend/.env`);
    console.log(`======================================================\n`);
    return { delivered: false, demo: true, otp, note: 'SMTP credentials not configured in backend/.env' };
  }

  try {
    const activeTransporter = getTransporter();
    const info = await activeTransporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL SERVICE] Email successfully delivered to ${to} (MessageId: ${info.messageId})`);
    return { delivered: true, demo: false, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL SERVICE WARNING] SMTP Delivery failed to ${to}:`, error.message);
    console.log(`\n======================================================`);
    console.log(`⚡ SERVEHUB OTP VERIFICATION CODE (SMTP FALLBACK)`);
    console.log(`To Email:   ${to}`);
    console.log(`OTP Code:   ${otp}`);
    console.log(`======================================================\n`);
    return { delivered: false, demo: true, otp, error: error.message };
  }
}

module.exports = {
  sendPasswordResetOTP,
  sendOtpEmail: sendPasswordResetOTP,
  isRealSmtpConfigured,
};
