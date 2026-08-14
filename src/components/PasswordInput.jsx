import React, { useState } from 'react';

export const PasswordInput = ({ id, name, value, onChange, placeholder = '••••••••', required = false, label, error }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="field" style={{ marginBottom: '18px' }}>
      {label && <label className="label" htmlFor={id} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>{label}</label>}
      <div className="input-group" style={{ position: 'relative' }}>
        <input
          id={id}
          name={name || id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="input"
          style={{ width: '100%', padding: '12px 42px 12px 14px', borderRadius: '10px', border: error ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
      {error && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};

export default PasswordInput;
