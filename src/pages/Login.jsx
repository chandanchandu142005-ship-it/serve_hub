import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email, password, rememberMe);
      if (data.success && data.user && data.token) {
        login(data.user, data.token, rememberMe);
        const role = data.user.role;
        window.location.hash = role === 'admin' ? '#/admin/overview' : role === 'pro' || role === 'professional' ? '#/pro/overview' : '#/dashboard/overview';
      }
    } catch (err) {
      setError(err.message || 'Email or password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back 👋" subtitle="Log in to manage your bookings, wallet, and rewards.">
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field" style={{ marginBottom: '18px' }}>
          <label className="label" htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Email address</label>
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

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#475569', fontWeight: 500, cursor: 'pointer' }}>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            Remember me
          </label>
          <a href="#/forgot" style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>Forgot Password?</a>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: loading ? '#93c5fd' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease' }}
        >
          {loading ? 'Logging in...' : 'LOGIN'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
        Don't have an account? <a href="#/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Create Account</a>
      </p>
    </AuthLayout>
  );
};

export default Login;
