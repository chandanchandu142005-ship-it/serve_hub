import React, { useRef } from 'react';

export const OTPInput = ({ value = ['', '', '', '', '', ''], onChange, disabled = false }) => {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '');
    const newOtp = [...value];
    newOtp[index] = val.slice(-1);
    onChange(newOtp);

    if (val && index < 5 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !value[index] && index > 0 && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...value];
      pastedData.split('').forEach((char, i) => {
        newOtp[i] = char;
      });
      onChange(newOtp);
      const targetIndex = Math.min(pastedData.length, 5);
      if (inputsRef.current[targetIndex]) inputsRef.current[targetIndex].focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '20px 0' }}>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          style={{
            width: '46px',
            height: '56px',
            textAlign: 'center',
            fontSize: '22px',
            fontWeight: '700',
            borderRadius: '12px',
            border: value[index] ? '2px solid #2563eb' : '1px solid #cbd5e1',
            background: value[index] ? '#eff6ff' : '#ffffff',
            outline: 'none',
            transition: 'all 0.15s ease',
          }}
        />
      ))}
    </div>
  );
};

export default OTPInput;
