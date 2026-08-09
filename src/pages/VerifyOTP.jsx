import React, { useState, useEffect } from 'react';
import AuthLayout from '../components/AuthLayout';
import OTPInput from '../components/OTPInput';
import authService from '../services/authService';

export const VerifyOTP = () => {
  const [email] = useState(() => sessionStorage.getItem('sh_reset_email') || 'your email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Timers: 5-minute expiry countdown timer (300s) & 60s resend cooldown timer
  const [expiryTimer, setExpiryTimer] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const fullOtp = otp.join('');

    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (expiryTimer <= 0) {
      setError('This verification code has expired. Please request a new code.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.verifyOTP(email, fullOtp);
      if (data.success && data.resetToken) {
        sessionStorage.setItem('sh_reset_token', data.resetToken);
        setSuccessMsg('OTP verified successfully!');
        setTimeout(() => {
          window.location.hash = '#/reset-password';
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'The verification code is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      const data = await authService.resendOTP(email);
      if (data.success) {
        setSuccessMsg('A new verification code has been sent to your email.');
        setExpiryTimer(300);
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err) {
      setError(err.message || 'Unable to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const isExpired = expiryTimer <= 0;

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`We've sent a 6-digit verification code to: ${email}`}
    >
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
          ✅ {successMsg}
        </div>
      )}

      <form onSubmit={handleVerify}>
        <OTPInput value={otp} onChange={setOtp} disabled={loading || isExpired} />

        <div style={{ textAlign: 'center', margin: '14px 0', fontSize: '14px', color: isExpired ? '#ef4444' : '#64748b' }}>
          {isExpired ? (
            <span style={{ fontWeight: 600 }}>⚠️ OTP has expired. Please request a new code.</span>
          ) : (
            <span>Code expires in: <strong style={{ color: '#2563eb' }}>{formatTime(expiryTimer)}</strong></span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join('').length < 6 || isExpired}
          style={{
            width: '100%',
            padding: '14px',
            background: loading || otp.join('').length < 6 || isExpired ? '#93c5fd' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: loading || otp.join('').length < 6 || isExpired ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Verifying OTP...' : 'VERIFY OTP'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
        Didn't receive the code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || resending}
          style={{
            background: 'none',
            border: 'none',
            color: resendCooldown > 0 ? '#94a3b8' : '#2563eb',
            fontWeight: 700,
            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
            padding: 0,
          }}
        >
          {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'RESEND OTP'}
        </button>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;
