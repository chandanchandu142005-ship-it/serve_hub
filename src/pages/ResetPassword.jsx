import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import authService from '../services/authService';

export const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const checks = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[@$!%*?&_\-#^()]/.test(newPassword),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const strengthColor = score <= 2 ? '#ef4444' : score <= 4 ? '#f59e0b' : '#10b981';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const resetToken = sessionStorage.getItem('sh_reset_token');
    if (!resetToken) {
      setError('Password reset session has expired or is invalid. Please request a new verification code.');
      return;
    }

    if (score < 5) {
      setError('New password must meet all security requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.resetPassword(resetToken, newPassword, confirmPassword);
      if (data.success) {
        setSuccess(true);
        sessionStorage.removeItem('sh_reset_token');
        sessionStorage.removeItem('sh_reset_email');
      }
    } catch (err) {
      setError(err.message || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Password Reset Successful 🎉" subtitle="Your ServeHub account password has been updated safely.">
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px', color: '#14532d' }}>Your password has been reset successfully.</h3>
          <p style={{ fontSize: '14px', margin: 0, color: '#166534' }}>You can now log in to ServeHub using your new password.</p>
        </div>

        <a
          href="#/login"
          style={{
            display: 'block',
            width: '100%',
            padding: '14px',
            background: '#2563eb',
            color: '#ffffff',
            textAlign: 'center',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700,
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          LOGIN NOW
        </a>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Your Password" subtitle="Create a new secure password for your ServeHub account.">
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <PasswordInput
          id="newPassword"
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        {newPassword && (
          <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${(score / 5) * 100}%`, height: '100%', background: strengthColor, transition: 'all 0.3s ease' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px', color: '#64748b' }}>
              <span style={{ color: checks.length ? '#10b981' : '#64748b' }}>{checks.length ? '✓' : '○'} 8+ characters</span>
              <span style={{ color: checks.upper ? '#10b981' : '#64748b' }}>{checks.upper ? '✓' : '○'} 1 Uppercase</span>
              <span style={{ color: checks.lower ? '#10b981' : '#64748b' }}>{checks.lower ? '✓' : '○'} 1 Lowercase</span>
              <span style={{ color: checks.number ? '#10b981' : '#64748b' }}>{checks.number ? '✓' : '○'} 1 Number</span>
            </div>
          </div>
        )}

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading || score < 5 || newPassword !== confirmPassword}
          style={{
            width: '100%',
            padding: '14px',
            background: loading || score < 5 || newPassword !== confirmPassword ? '#93c5fd' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: loading || score < 5 || newPassword !== confirmPassword ? 'not-allowed' : 'pointer',
            marginTop: '10px',
          }}
        >
          {loading ? 'Resetting Password...' : 'RESET PASSWORD'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
        <a href="#/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Back to Login</a>
      </p>
    </AuthLayout>
  );
};

export default ResetPassword;
