import React from 'react';

export const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="auth-wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Left side branding + illustration */}
      <div className="auth-visual" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#ffffff', padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="logo" style={{ fontSize: '28px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>⚡</span>
            Serve<b style={{ color: '#60a5fa' }}>hub</b>
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: '800', lineHeight: 1.25, maxWidth: '440px', margin: '0 0 20px' }}>
            The home services platform trusted by <span style={{ color: '#7dd3fc' }}>2.4 million</span> families.
          </h2>
          <p style={{ color: '#93c5fd', fontSize: '16px', lineHeight: 1.6 }}>
            Book trusted plumbers, electricians, house cleaners, and appliance technicians in under 60 seconds.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '28px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '900' }}>4.8★</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>Average rating</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '900' }}>12,000+</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>Verified pros</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '900' }}>60s</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>Avg. booking time</div>
          </div>
        </div>
      </div>

      {/* Right side authentication card */}
      <div className="auth-form" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="auth-card" style={{ width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
          {title && <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>{title}</h1>}
          {subtitle && <p className="sub" style={{ fontSize: '14px', color: '#64748b', margin: '0 0 28px' }}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
