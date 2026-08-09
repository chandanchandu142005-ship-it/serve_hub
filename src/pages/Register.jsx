import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import authService from '../services/authService';

export const Register = () => {
  const [role, setRole] = useState('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password requirements state
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&_\-#^()]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const strengthLabel = score <= 2 ? 'Weak' : score <= 4 ? 'Medium' : 'Strong';
  const strengthColor = score <= 2 ? '#ef4444' : score <= 4 ? '#f59e0b' : '#10b981';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) return setError('Full name is required.');
    if (!email.trim()) return setError('Email address is required.');
    if (!phone.trim()) return setError('Phone number is required.');
    if (score < 5) return setError('Password does not meet all security requirements.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const data = await authService.register({
        fullName,
        email,
        phone,
        password,
        confirmPassword,
        role,
        profileImage,
      });

      if (data.success) {
        setSuccess('Registration successful! You can now login.');
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your ServeHub account" subtitle="Join 2.4M+ families who book home services the easy way.">
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field" style={{ marginBottom: '16px' }}>
          <label className="label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>I want to</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setRole('customer')}
              style={{ padding: '8px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: role === 'customer' ? '#ffffff' : 'transparent', color: role === 'customer' ? '#2563eb' : '#64748b', boxShadow: role === 'customer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              Book Services (Customer)
            </button>
            <button
              type="button"
              onClick={() => setRole('professional')}
              style={{ padding: '8px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: role === 'professional' ? '#ffffff' : 'transparent', color: role === 'professional' ? '#2563eb' : '#64748b', boxShadow: role === 'professional' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              Offer Services (Provider)
            </button>
          </div>
        </div>

        <div className="field" style={{ marginBottom: '14px' }}>
          <label className="label" htmlFor="fullName" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Full Name</label>
          <input
            id="fullName"
            type="text"
            placeholder="Priya Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label className="label" htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <div>
            <label className="label" htmlFor="phone" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Phone Number</label>
            <input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Password Strength Meter */}
        {password && (
          <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              <span>Password Strength:</span>
              <span style={{ color: strengthColor }}>{strengthLabel} ({score}/5)</span>
            </div>
            <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${(score / 5) * 100}%`, height: '100%', background: strengthColor, transition: 'all 0.3s ease' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px', color: '#64748b' }}>
              <span style={{ color: checks.length ? '#10b981' : '#64748b' }}>{checks.length ? '✓' : '○'} 8+ characters</span>
              <span style={{ color: checks.upper ? '#10b981' : '#64748b' }}>{checks.upper ? '✓' : '○'} 1 Uppercase (A-Z)</span>
              <span style={{ color: checks.lower ? '#10b981' : '#64748b' }}>{checks.lower ? '✓' : '○'} 1 Lowercase (a-z)</span>
              <span style={{ color: checks.number ? '#10b981' : '#64748b' }}>{checks.number ? '✓' : '○'} 1 Number (0-9)</span>
              <span style={{ color: checks.special ? '#10b981' : '#64748b' }}>{checks.special ? '✓' : '○'} 1 Special character</span>
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
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: loading ? '#93c5fd' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' }}
        >
          {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
        Already have an account? <a href="#/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Log in</a>
      </p>
    </AuthLayout>
  );
};

export default Register;
