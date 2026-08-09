import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import authService from '../services/authService';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.forgotPassword(email);
      if (data.success) {
        sessionStorage.setItem('sh_reset_email', email);
        window.location.hash = '#/verify-otp';
      }
    } catch (err) {
      setError(err.message || 'Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your registered email address and we'll send you a verification code."
    >
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field" style={{ marginBottom: '24px' }}>
          <label className="label" htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Registered Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: loading ? '#93c5fd' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Sending Verification Code...' : 'SEND OTP'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
        <a href="#/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>← Back to Login</a>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
