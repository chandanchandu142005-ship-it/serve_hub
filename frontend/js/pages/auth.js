/* ============ SERVEHUB AUTH ============ */
window.Auth = (() => {
  const { icon, money, esc, avatar, toast, openModal, closeModal, modalShell, fileToDataURL } = U;

  /* ---------------- API helper ----------------
     Talks to the Express backend (backend/). If the API is unreachable the
     flows fall back to local demo mode so the SPA still works offline. */
  const API_BASE = window.SH_API || window.SERVEHUB_API || 'http://localhost:4000/api';

  const apiPost = (path, body, timeout = 6000) =>
    fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
      signal: (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(timeout) : undefined,
    }).then(async r => {
      const data = await r.json().catch(() => ({}));
      return { ok: r.ok, status: r.status, ...data };
    }).catch(() => null);

  const authShell = (title, sub, body) => `
    <div class="auth-wrap">
      <div class="auth-visual">
        <a class="logo" href="#/" style="color:#fff;position:relative;z-index:1;margin-bottom:56px"><span class="logo-mark">${icon('zap', 20)}</span>Serve<b style="background:none;-webkit-text-fill-color:#fff">hub</b></a>
        <h2 style="font-size:clamp(26px,3vw,36px);line-height:1.25;position:relative;z-index:1;max-width:420px">The home services platform trusted by <span style="color:#7DD3FC">2.4 million</span> families.</h2>
        <div style="display:flex;gap:28px;margin-top:36px;position:relative;z-index:1">
          ${[['4.8★', 'Average rating'], ['12k+', 'Verified pros'], ['60s', 'Avg. booking time']].map(s => `<div><div style="font-size:24px;font-weight:900">${s[0]}</div><div style="font-size:12.5px;opacity:.75">${s[1]}</div></div>`).join('')}
        </div>
      </div>
      <div class="auth-form">
        <div class="auth-card">
          <h1>${title}</h1>
          <p class="sub">${sub}</p>
          ${body}
        </div>
      </div>
    </div>`;

  const pwToggle = id => `<button type="button" class="icon-btn" data-act="pw-toggle" data-id="${id}" aria-label="Toggle password" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);width:34px;height:34px">${icon('eye', 16)}</button>`;

  /* ---------------- LOGIN ---------------- */
  const Login = () => authShell('Welcome back 👋', 'Log in to manage your bookings, wallet and rewards.',
    `
    <form id="login-form" novalidate>
      <div class="field"><label class="label" for="l-role">I am a</label>
        <div class="radio-pill" role="radiogroup">
          <label><input type="radio" name="role" value="customer" checked><span>Customer</span></label>
          <label><input type="radio" name="role" value="professional"><span>Professional</span></label>
        </div>
      </div>

      <div class="field"><label class="label" for="l-email">Email Address</label>
        <div class="input-group">${icon('mail', 17)}<input class="input input-icon-r" id="l-email" type="email" placeholder="you@example.com" required></div>
      </div>

      <div class="field"><label class="label" for="l-pass">Password</label>
        <div class="input-group">${icon('lock', 17)}<input class="input input-icon-r" id="l-pass" type="password" placeholder="••••••••" required>${pwToggle('l-pass')}</div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0 18px">
        <label style="display:flex;gap:8px;align-items:center;font-size:13px;color:var(--ink-3);font-weight:600"><input type="checkbox" id="l-remember" checked> Remember me</label>
        <a href="#/forgot" style="font-size:13px;font-weight:700;color:var(--primary-600)">Forgot Password?</a>
      </div>

      <button class="btn btn-primary btn-lg btn-block" id="l-submit" type="submit">${icon('logout', 0)} LOGIN</button>
    </form>

    <div class="auth-divider">or continue with</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <button class="btn btn-outline" data-act="oauth" data-provider="Google">${icon('globe', 16)} Google</button>
      <button class="btn btn-outline" data-act="oauth" data-provider="Apple">${icon('lock', 16)} Apple</button>
    </div>
    <p class="auth-alt">Don't have an account? <a href="#/register">Create Account</a></p>
    <div class="center"><button class="btn btn-ghost btn-sm" data-act="demo-login">${icon('zap', 13)} Try a 1-click demo login</button></div>
  `);

  const loginWire = root => {
    // Password toggle
    U.$$('[data-act="pw-toggle"]', root).forEach(btn => btn.addEventListener('click', () => {
      const inp = U.$('#' + btn.dataset.id, root);
      if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
    }));

    const form = U.$('#login-form', root);
    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const email = (U.$('#l-email', root)?.value || '').trim();
      const password = U.$('#l-pass', root)?.value || '';
      const submitBtn = U.$('#l-submit', root);

      if (!email || !password) {
        toast('Please enter both email and password', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px"></span> Logging in…`;
      }

      const res = await apiPost('/auth/login', { email, password });
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('logout', 0)} LOGIN`;
      }

      if (res && res.token && res.user) {
        const u = res.user;
        Store.login({ name: u.name || u.fullName, email: u.email, phone: u.phone || '', role: u.role, token: res.token });
        toast('Welcome back, ' + (u.name || 'friend') + '! 🎉', 'success');
        location.hash = u.role === 'admin' ? '#/admin/overview' : u.role === 'pro' || u.role === 'professional' ? '#/pro/overview' : '#/dashboard/overview';
      } else if (res && (res.error || res.message)) {
        toast(res.error || res.message || 'Email or password is incorrect.', 'error');
      } else {
        // Fallback demo mode if offline
        const role = U.$('input[name="role"]:checked', root)?.value || 'customer';
        Store.login({ name: email.split('@')[0].replace(/[._-]/g, ' ') || 'Customer', role: role === 'professional' ? 'pro' : 'customer', email });
        toast('Welcome back! 🎉', 'success');
        location.hash = role === 'professional' ? '#/pro/overview' : '#/dashboard/overview';
      }
    });

    U.$('[data-act="demo-login"]', root)?.addEventListener('click', () => {
      const role = U.$('input[name="role"]:checked', root)?.value || 'customer';
      if (role === 'admin') {
        Store.login({ name: 'Servehub Admin', role: 'admin', email: 'admin@servehub.com' });
        toast('Welcome back, Admin!', 'success');
        location.hash = '#/admin/overview';
      } else {
        Store.login({ name: 'Priya Sharma', role: 'customer', email: 'customer@servehub.com' });
        toast('Welcome back, Priya! 🎉', 'success');
        location.hash = '#/dashboard/overview';
      }
    });
  };

  /* ---------------- REGISTER ---------------- */
  const Register = () => authShell('Create your account', 'Join 2.4M+ families who book home services the easy way.',
    `
    <form id="reg-form" novalidate>
      <div class="field"><label class="label">I want to</label>
        <div class="radio-pill">
          <label><input type="radio" name="role" value="customer" checked><span>Customer</span></label>
          <label><input type="radio" name="role" value="professional"><span>Service Provider</span></label>
        </div>
      </div>
      <div class="field"><label class="label" for="r-name">Full Name</label><input class="input" id="r-name" placeholder="Priya Sharma" required></div>
      <div class="grid g2" style="grid-template-columns:1fr 1fr;gap:12px">
        <div class="field"><label class="label" for="r-email">Email Address</label><div class="input-group">${icon('mail', 17)}<input class="input input-icon-r" id="r-email" type="email" placeholder="you@example.com" required></div></div>
        <div class="field"><label class="label" for="r-phone">Phone Number</label><input class="input" id="r-phone" type="tel" placeholder="+91 98765 43210" required></div>
      </div>
      <div class="field"><label class="label" for="r-pass">Password</label><div class="input-group">${icon('lock', 17)}<input class="input input-icon-r" id="r-pass" type="password" placeholder="8+ characters" required>${pwToggle('r-pass')}</div></div>
      
      <!-- Password Strength Meter -->
      <div id="pw-meter-wrap" style="display:none;margin-bottom:14px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:6px">
          <span>Password Strength:</span>
          <span id="pw-strength-label" style="color:var(--error-600)">Weak</span>
        </div>
        <div style="height:5px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:8px">
          <div id="pw-strength-bar" style="width:20%;height:100%;background:var(--error-600);transition:all 0.3s"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;color:var(--ink-3)">
          <span id="chk-len">○ 8+ characters</span>
          <span id="chk-upper">○ 1 Uppercase (A-Z)</span>
          <span id="chk-lower">○ 1 Lowercase (a-z)</span>
          <span id="chk-num">○ 1 Number (0-9)</span>
          <span id="chk-spec" style="grid-column:1/-1">○ 1 Special character (@$!%*?&_)</span>
        </div>
      </div>

      <div class="field"><label class="label" for="r-confirm-pass">Confirm Password</label><div class="input-group">${icon('lock', 17)}<input class="input input-icon-r" id="r-confirm-pass" type="password" placeholder="••••••••" required>${pwToggle('r-confirm-pass')}</div></div>

      <button class="btn btn-cta btn-lg btn-block" id="r-submit" type="submit">${icon('arrowRight', 16)} REGISTER</button>
    </form>
    <p class="auth-alt" style="margin-top:16px">Already have an account? <a href="#/login">Log in</a></p>
    <p class="xsmall muted center" style="margin-top:14px">By continuing you agree to our <a href="#/terms" style="color:var(--primary-600)">Terms</a> &amp; <a href="#/privacy" style="color:var(--primary-600)">Privacy Policy</a>.</p>
  `);

  const registerWire = root => {
    U.$$('[data-act="pw-toggle"]', root).forEach(btn => btn.addEventListener('click', () => {
      const inp = U.$('#' + btn.dataset.id, root);
      if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
    }));

    const passInput = U.$('#r-pass', root);
    const meterWrap = U.$('#pw-meter-wrap', root);
    const bar = U.$('#pw-strength-bar', root);
    const label = U.$('#pw-strength-label', root);

    const updateMeter = () => {
      const val = passInput?.value || '';
      if (!val) { if (meterWrap) meterWrap.style.display = 'none'; return; }
      if (meterWrap) meterWrap.style.display = 'block';

      const checks = {
        len: val.length >= 8,
        upper: /[A-Z]/.test(val),
        lower: /[a-z]/.test(val),
        num: /[0-9]/.test(val),
        spec: /[@$!%*?&_\-#^()]/.test(val),
      };

      const setChk = (id, ok) => {
        const el = U.$('#' + id, root);
        if (!el) return;
        el.style.color = ok ? '#10B981' : 'var(--ink-3)';
        el.textContent = (ok ? '✓ ' : '○ ') + el.textContent.substring(2);
      };

      setChk('chk-len', checks.len);
      setChk('chk-upper', checks.upper);
      setChk('chk-lower', checks.lower);
      setChk('chk-num', checks.num);
      setChk('chk-spec', checks.spec);

      const score = Object.values(checks).filter(Boolean).length;
      const pct = (score / 5) * 100;
      const color = score <= 2 ? '#EF4444' : score <= 4 ? '#F59E0B' : '#10B981';
      const text = score <= 2 ? 'Weak' : score <= 4 ? 'Medium' : 'Strong';

      if (bar) { bar.style.width = pct + '%'; bar.style.background = color; }
      if (label) { label.textContent = `${text} (${score}/5)`; label.style.color = color; }
    };

    passInput?.addEventListener('input', updateMeter);

    const form = U.$('#reg-form', root);
    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const role = U.$('input[name="role"]:checked', root)?.value || 'customer';
      const fullName = (U.$('#r-name', root)?.value || '').trim();
      const email = (U.$('#r-email', root)?.value || '').trim();
      const phone = (U.$('#r-phone', root)?.value || '').trim();
      const password = U.$('#r-pass', root)?.value || '';
      const confirmPassword = U.$('#r-confirm-pass', root)?.value || '';
      const btn = U.$('#r-submit', root);

      if (!fullName) return toast('Full name is required', 'error');
      if (!/^\S+@\S+\.\S+$/.test(email)) return toast('Valid email address is required', 'error');
      if (!phone) return toast('Phone number is required', 'error');
      if (password.length < 8) return toast('Password must be at least 8 characters long', 'error');
      if (password !== confirmPassword) return toast('Passwords do not match', 'error');

      if (btn) { btn.disabled = true; btn.textContent = 'Registering…'; }

      const res = await apiPost('/auth/register', {
        fullName, email, phone, password, confirmPassword, role
      });

      if (btn) { btn.disabled = false; btn.textContent = 'REGISTER'; }

      if (res && res.success) {
        toast('Registration successful! You can now login.', 'success');
        setTimeout(() => { location.hash = '#/login'; }, 1200);
      } else if (res && (res.error || res.message)) {
        toast(res.error || res.message, 'error');
      } else {
        // Fallback demo mode
        toast('Registration successful! You can now login.', 'success');
        setTimeout(() => { location.hash = '#/login'; }, 1200);
      }
    });
  };

  /* ---------------- FORGOT PASSWORD ---------------- */
  const Forgot = () => authShell('Forgot Password?', 'Enter your registered email address and we\'ll send you a verification code.',
    `
    <form id="forgot-form" novalidate>
      <div class="field"><label class="label" for="f-email">Email Address</label>
        <div class="input-group">${icon('mail', 17)}<input class="input input-icon-r" id="f-email" type="email" placeholder="you@example.com" required></div>
      </div>
      <button class="btn btn-primary btn-lg btn-block" id="f-submit" type="submit">${icon('send', 16)} SEND OTP</button>
    </form>
    <p class="auth-alt"><a href="#/login">← Back to Login</a></p>
  `);

  const forgotWire = root => {
    const form = U.$('#forgot-form', root);
    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const email = (U.$('#f-email', root)?.value || '').trim();
      const btn = U.$('#f-submit', root);

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        toast('Please enter a valid registered email address', 'error');
        return;
      }

      if (btn) { btn.disabled = true; btn.textContent = 'Sending OTP…'; }

      const res = await apiPost('/auth/forgot-password', { email });

      if (btn) { btn.disabled = false; btn.textContent = 'SEND OTP'; }

      sessionStorage.setItem('sh_reset_email', email);

      if (res && res.demoOtp) {
        // SMTP not configured — store OTP to display on next page
        sessionStorage.setItem('sh_demo_otp', res.demoOtp);
        toast(`📧 No SMTP set up — Use OTP shown on the next page to continue`, 'warn');
      } else {
        sessionStorage.removeItem('sh_demo_otp');
        toast('Verification code sent! Check your inbox.', 'success');
      }

      setTimeout(() => { location.hash = '#/verify-otp'; }, 1200);
    });
  };

  /* ---------------- VERIFY OTP ---------------- */
  const VerifyOTP = () => {
    const email = sessionStorage.getItem('sh_reset_email') || 'your email';
    return authShell('Verify Your Email', `We've sent a 6-digit verification code to: <br><b style="color:var(--primary-600)">${esc(email)}</b>`,
      `
      <!-- Demo OTP banner: shown when SMTP email is not configured -->
      <div id="demo-otp-banner" style="display:none;background:#fef9c3;border:1.5px solid #fde047;border-radius:12px;padding:14px 16px;margin-bottom:16px;text-align:center">
        <div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">📧 Email not sent — No SMTP configured</div>
        <div style="font-size:13px;color:#78350f;margin-bottom:8px">Use this verification code to continue:</div>
        <div id="demo-otp-code" style="font-size:32px;font-weight:900;letter-spacing:10px;color:#1e40af;font-family:monospace">------</div>
        <div style="font-size:11px;color:#92400e;margin-top:6px">To receive real emails, add your Gmail App Password to <b>backend/.env</b></div>
      </div>

      <div class="otp-row" style="margin-bottom:16px;display:flex;gap:8px;justify-content:center">
        ${[0, 1, 2, 3, 4, 5].map(i => `<input class="otp" style="width:44px;height:54px;text-align:center;font-size:22px;font-weight:800;border-radius:12px;border:1px solid var(--line)" inputmode="numeric" maxlength="1" data-vo="${i}" aria-label="Digit ${i + 1}">`).join('')}
      </div>

      <div class="center" style="margin-bottom:20px;font-size:13.5px;color:var(--ink-3)">
        Code expires in: <b id="vo-expiry" style="color:var(--primary-600)">5:00</b>
      </div>

      <button class="btn btn-primary btn-lg btn-block" id="vo-submit" disabled>${icon('checkCircle', 16)} VERIFY OTP</button>
      
      <p class="small muted center" style="margin-top:16px">
        Didn't receive the code? <a href="#" id="vo-resend" style="color:var(--primary-600);font-weight:700">Resend OTP (<span id="vo-cooldown">60</span>s)</a>
      </p>
      <p class="auth-alt"><a href="#/login">← Back to Login</a></p>
    `);
  };

  const verifyOTPWire = root => {
    const email = sessionStorage.getItem('sh_reset_email') || '';
    const inputs = U.$$('[data-vo]', root);
    const submitBtn = U.$('#vo-submit', root);
    const expiryEl = U.$('#vo-expiry', root);
    const cooldownEl = U.$('#vo-cooldown', root);
    const resendBtn = U.$('#vo-resend', root);
    const demoBanner = U.$('#demo-otp-banner', root);
    const demoCodeEl = U.$('#demo-otp-code', root);

    // Show demo OTP banner if no SMTP configured
    const showDemoOtp = (otp) => {
      if (!otp || !demoBanner) return;
      if (demoCodeEl) demoCodeEl.textContent = otp;
      demoBanner.style.display = 'block';
      sessionStorage.setItem('sh_demo_otp', otp);
    };

    const storedDemoOtp = sessionStorage.getItem('sh_demo_otp');
    if (storedDemoOtp) showDemoOtp(storedDemoOtp);

    const update = () => {
      const full = inputs.map(i => i.value).join('');
      if (submitBtn) submitBtn.disabled = full.length < 6;
    };

    inputs.forEach((inp, i) => {
      inp.addEventListener('input', e => {
        inp.value = inp.value.replace(/\D/g, '');
        if (inp.value && i < 5) inputs[i + 1].focus();
        update();
      });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
      });
      inp.addEventListener('paste', e => {
        const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        digits.split('').forEach((d, j) => { if (inputs[j]) inputs[j].value = d; });
        if (digits.length === 6 && inputs[5]) inputs[5].focus();
        update();
      });
    });

    // 5-minute countdown timer (300s)
    let expSecs = 300;
    const expIv = setInterval(() => {
      expSecs--;
      const m = Math.floor(expSecs / 60);
      const s = expSecs % 60;
      if (expiryEl) expiryEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
      if (expSecs <= 0) {
        clearInterval(expIv);
        if (expiryEl) expiryEl.innerHTML = `<span style="color:var(--error-600);font-weight:700">Expired</span>`;
        if (submitBtn) submitBtn.disabled = true;
      }
    }, 1000);

    // 60-second resend cooldown
    let coolSecs = 60;
    const coolIv = setInterval(() => {
      coolSecs--;
      if (cooldownEl) cooldownEl.textContent = Math.max(coolSecs, 0);
      if (coolSecs <= 0) {
        clearInterval(coolIv);
        if (resendBtn) resendBtn.textContent = 'RESEND OTP NOW';
      }
    }, 1000);

    resendBtn?.addEventListener('click', async e => {
      e.preventDefault();
      if (coolSecs > 0) return;
      toast('Sending new verification code…', 'info');
      const res = await apiPost('/auth/resend-otp', { email });
      if (res && res.success) {
        if (res.demoOtp) {
          showDemoOtp(res.demoOtp);
          toast('New OTP generated — see the yellow box above', 'warn');
        } else {
          toast('New OTP sent to your inbox 📩', 'success');
          if (demoBanner) demoBanner.style.display = 'none';
        }
        expSecs = 300; coolSecs = 60;
        if (resendBtn) resendBtn.innerHTML = `Resend OTP (<span id="vo-cooldown">60</span>s)`;
        inputs.forEach(i => i.value = '');
      } else {
        toast(res?.error || 'Unable to resend OTP', 'error');
      }
    });

    submitBtn?.addEventListener('click', async () => {
      const otp = inputs.map(i => i.value).join('');
      if (otp.length < 6) return toast('Please enter all 6 digits', 'warn');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Verifying…'; }

      const res = await apiPost('/auth/verify-otp', { email, otp });

      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'VERIFY OTP'; }

      if (res && res.success && res.resetToken) {
        sessionStorage.setItem('sh_reset_token', res.resetToken);
        toast('OTP verified successfully! Redirecting…', 'success');
        setTimeout(() => { location.hash = '#/reset-password'; }, 800);
      } else if (res && (res.error || res.message)) {
        toast(res.error || res.message || 'The verification code is incorrect.', 'error');
      } else {
        // Fallback demo mode
        sessionStorage.setItem('sh_reset_token', 'demo_reset_token');
        toast('OTP verified! 🎉', 'success');
        setTimeout(() => { location.hash = '#/reset-password'; }, 800);
      }
    });
  };

  /* ---------------- RESET PASSWORD ---------------- */
  const ResetPassword = () => authShell('Reset Your Password', 'Create a new password for your ServeHub account.',
    `
    <form id="reset-form" novalidate>
      <div class="field"><label class="label" for="rp-pass">New Password</label>
        <div class="input-group">${icon('lock', 17)}<input class="input input-icon-r" id="rp-pass" type="password" placeholder="••••••••" required>${pwToggle('rp-pass')}</div>
      </div>

      <div id="rp-meter-wrap" style="display:none;margin-bottom:14px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px">
        <div style="height:5px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:8px">
          <div id="rp-strength-bar" style="width:20%;height:100%;background:var(--error-600);transition:all 0.3s"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;color:var(--ink-3)">
          <span id="rp-chk-len">○ 8+ characters</span>
          <span id="rp-chk-upper">○ 1 Uppercase</span>
          <span id="rp-chk-lower">○ 1 Lowercase</span>
          <span id="rp-chk-num">○ 1 Number</span>
          <span id="rp-chk-spec" style="grid-column:1/-1">○ 1 Special character</span>
        </div>
      </div>

      <div class="field"><label class="label" for="rp-confirm-pass">Confirm Password</label>
        <div class="input-group">${icon('lock', 17)}<input class="input input-icon-r" id="rp-confirm-pass" type="password" placeholder="••••••••" required>${pwToggle('rp-confirm-pass')}</div>
      </div>

      <button class="btn btn-primary btn-lg btn-block" id="rp-submit" type="submit">${icon('checkCircle', 16)} RESET PASSWORD</button>
    </form>
    <p class="auth-alt"><a href="#/login">← Back to Login</a></p>
  `);

  const resetPasswordWire = root => {
    U.$$('[data-act="pw-toggle"]', root).forEach(btn => btn.addEventListener('click', () => {
      const inp = U.$('#' + btn.dataset.id, root);
      if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
    }));

    const passInput = U.$('#rp-pass', root);
    const meterWrap = U.$('#rp-meter-wrap', root);
    const bar = U.$('#rp-strength-bar', root);

    passInput?.addEventListener('input', () => {
      const val = passInput?.value || '';
      if (!val) { if (meterWrap) meterWrap.style.display = 'none'; return; }
      if (meterWrap) meterWrap.style.display = 'block';

      const checks = {
        len: val.length >= 8,
        upper: /[A-Z]/.test(val),
        lower: /[a-z]/.test(val),
        num: /[0-9]/.test(val),
        spec: /[@$!%*?&_\-#^()]/.test(val),
      };

      const setChk = (id, ok) => {
        const el = U.$('#' + id, root);
        if (!el) return;
        el.style.color = ok ? '#10B981' : 'var(--ink-3)';
        el.textContent = (ok ? '✓ ' : '○ ') + el.textContent.substring(2);
      };

      setChk('rp-chk-len', checks.len);
      setChk('rp-chk-upper', checks.upper);
      setChk('rp-chk-lower', checks.lower);
      setChk('rp-chk-num', checks.num);
      setChk('rp-chk-spec', checks.spec);

      const score = Object.values(checks).filter(Boolean).length;
      if (bar) {
        bar.style.width = (score / 5 * 100) + '%';
        bar.style.background = score <= 2 ? '#EF4444' : score <= 4 ? '#F59E0B' : '#10B981';
      }
    });

    const form = U.$('#reset-form', root);
    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const resetToken = sessionStorage.getItem('sh_reset_token');
      const newPassword = U.$('#rp-pass', root)?.value || '';
      const confirmPassword = U.$('#rp-confirm-pass', root)?.value || '';
      const btn = U.$('#rp-submit', root);

      if (!newPassword || newPassword.length < 8) return toast('Password must be at least 8 characters long', 'error');
      if (newPassword !== confirmPassword) return toast('Passwords do not match', 'error');

      if (btn) { btn.disabled = true; btn.textContent = 'Resetting Password…'; }

      const res = await apiPost('/auth/reset-password', {
        resetToken, newPassword, confirmPassword
      });

      if (btn) { btn.disabled = false; btn.textContent = 'RESET PASSWORD'; }

      if (res && res.success) {
        toast('Your password has been reset successfully. You can now log in.', 'success');
        sessionStorage.removeItem('sh_reset_token');
        sessionStorage.removeItem('sh_reset_email');
        setTimeout(() => { location.hash = '#/login'; }, 1500);
      } else if (res && (res.error || res.message)) {
        toast(res.error || res.message, 'error');
      } else {
        toast('Your password has been reset successfully.', 'success');
        setTimeout(() => { location.hash = '#/login'; }, 1500);
      }
    });
  };

  /* ---------------- PRO ONBOARDING & MARKETING ---------------- */
  const ProOnboarding = () => {
    const p = JSON.parse(sessionStorage.getItem('sh:pending') || '{}');
    const steps = ['Profile', 'Documents', 'Certificates', 'Bank & KYC', 'Review'];
    const upload = (id, label, hint) => `
      <div class="field"><label class="label">${label}</label>
        <label class="upload-zone" for="${id}"><div class="u-ic">${icon('upload', 22)}</div><b style="font-size:14px">Tap to upload ${hint}</b><div class="xsmall muted" style="margin-top:4px">PNG / JPG / PDF, max 5MB</div><input type="file" id="${id}" accept="image/*,.pdf" style="display:none"></label>
        <div id="${id}-prev" style="display:none;margin-top:8px;gap:8px;flex-wrap:wrap;align-items:center" class="small"></div>
      </div>`;
    return authShell('Become a Servehub professional', 'Complete these 5 steps to start earning. Most applications are approved within 48 hours.',
      `
      ${U.stepper(steps, 0)}
      <div style="background:var(--primary-50);border:1px solid var(--primary-100);border-radius:14px;padding:14px 16px;margin-bottom:20px;display:flex;gap:10px;font-size:13px">
        ${icon('info', 17)} We verify every document for your safety and for the safety of our customers.
      </div>
      <form id="pro-form" novalidate>
        <div class="field"><label class="label" for="po-name">Full name</label><input class="input" id="po-name" value="${esc(p.name || '')}" required></div>
        <div class="grid g2" style="grid-template-columns:1fr 1fr;gap:12px">
          <div class="field"><label class="label" for="po-phone">Mobile</label><input class="input" id="po-phone" value="${esc(p.phone || '')}"></div>
          <div class="field"><label class="label" for="po-city">Service city</label><select class="select" id="po-city">${DATA.cities.map(c => `<option>${c.name}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label class="label" for="po-cat">Service category</label><select class="select" id="po-cat">${DATA.categories.map(c => `<option>${c.name}</option>`).join('')}</select></div>
        <div class="field"><label class="label" for="po-exp">Years of experience</label><input class="input" id="po-exp" type="number" min="0" placeholder="e.g. 5"></div>
        ${upload('po-aadhaar', 'Government ID (Aadhaar / Passport / Driving License)', 'your ID')}
        ${upload('po-selfie', 'Selfie with your ID', 'a selfie')}
        ${upload('po-cert', 'Skill certificates (ITI / diploma / training)', 'certificates')}
        <div class="field"><label class="label" for="po-acc">Bank account number</label><input class="input" id="po-acc" placeholder="Enter account number"></div>
        <div class="field"><label class="label" for="po-ifsc">IFSC code</label><input class="input" id="po-ifsc" placeholder="e.g. HDFC0001234"></div>
        <div class="field"><label class="label" for="po-pan">PAN number</label><input class="input" id="po-pan" placeholder="ABCDE1234F"></div>
        <button class="btn btn-cta btn-lg btn-block" type="submit">${icon('rocket', 17)} Submit application</button>
        <p class="xsmall muted center" style="margin-top:12px">Documents are encrypted and only used for verification.</p>
      </form>
    `);
  };

  const proOnboardWire = root => {
    U.$$('.upload-zone input[type=file]', root).forEach(inp => inp.addEventListener('change', async () => {
      const f = inp.files[0]; if (!f) return;
      const prev = U.$('#' + inp.id + '-prev');
      prev.style.display = 'flex';
      const isImg = f.type.startsWith('image/');
      prev.innerHTML = isImg ? `<img src="${await fileToDataURL(f)}" style="width:56px;height:56px;border-radius:12px;object-fit:cover;border:1px solid var(--line)"><span>${esc(f.name)} <b style="color:var(--success-600)">✓ uploaded</b></span>` : `${icon('file', 16)} <span>${esc(f.name)} <b style="color:var(--success-600)">✓ uploaded</b></span>`;
      toast('File uploaded', 'success');
    }));
    U.$('#pro-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const p = JSON.parse(sessionStorage.getItem('sh:pending') || '{}');
      const app = {
        id: 'AP' + Math.floor(1000 + Math.random() * 9000), name: U.$('#po-name').value || p.name,
        phone: U.$('#po-phone').value || p.phone, email: p.email, city: U.$('#po-city').value,
        cat: U.$('#po-cat').value, exp: U.$('#po-exp').value || '3', status: 'pending', createdAt: Date.now(),
      };
      Store.state.proApps.unshift(app); Store.persist();
      Store.login({ name: app.name, role: 'pro', email: p.email, appId: app.id });
      Store.addNotif('briefcase', 'Application submitted 🎉', `Your Servehub professional application ${app.id} is under review. We will notify you within 48 hours.`);
      sessionStorage.removeItem('sh:pending');
      toast('Application submitted! We review it within 48 hours ⏳', 'success');
      location.hash = '#/pro/overview';
    });
  };

  const BecomePro = () => `
    <section class="page-hero"><div class="container">
      <div class="crumbs"><a href="">Home</a><span>/</span><span>For professionals</span></div>
      <span class="kicker">${icon('rocket', 13)}Servehub for Professionals</span>
      <h1 class="h2" style="font-size:clamp(28px,4.4vw,44px);max-width:700px">Turn your skills into a <span class="grad-text">steady income.</span></h1>
      <p class="lead" style="margin-top:12px">Join 12,000+ verified professionals. Set your own hours, earn up to ₹45,000 a month, and grow with free training.</p>
      <div style="display:flex;gap:12px;margin-top:26px;flex-wrap:wrap">
        <a class="btn btn-cta btn-lg" href="#/register">${icon('rocket', 18)} Apply now — it's free</a>
        <button class="btn btn-outline btn-lg" data-act="toast" data-msg="Earnings calculator opened 📊">${icon('barChart', 17)} Estimate your earnings</button>
      </div>
    </div></section>
    <section class="section"><div class="container">
      <div class="grid g4" style="margin-bottom:48px">
        ${[['wallet', '₹30–45k', 'Average monthly earnings'], ['calendar', 'Own schedule', 'Work hours that suit you'], ['graduation', 'Free training', 'Upgrade skills, earn more'], ['shield', 'Insurance', 'On-job coverage included']].map(s => `<div class="card why-card reveal" data-reveal><div class="w-ic" style="background:var(--grad)">${icon(s[0], 22)}</div><h3 style="font-size:19px">${s[1]}</h3><p class="small">${s[2]}</p></div>`).join('')}
      </div>
      <div class="grid g2" style="grid-template-columns:1fr 1fr;gap:40px;align-items:center">
        <div>
          <h2 class="h3" style="margin-bottom:16px">How onboarding works</h2>
          ${[['1', 'Apply & verify', 'Submit your ID, certificates and bank details — takes ~10 minutes.'], ['2', 'Quick skill check', 'A short practical or video assessment confirms your expertise.'], ['3', 'Get approved & earn', 'Approved within 48 hours. Start accepting bookings and earning instantly.']].map((s, i) => `
            <div style="display:flex;gap:16px;margin-bottom:20px"><span class="s-dot" style="width:38px;height:38px;border-radius:50%;background:var(--grad);color:#fff;display:grid;place-items:center;font-weight:800;flex:none">${s[0]}</span><div><b>${s[1]}</b><p class="small muted" style="margin-top:3px">${s[2]}</p></div></div>`).join('')}
          <a class="btn btn-cta btn-lg" href="#/register">Start my application</a>
        </div>
        <div class="card glass" style="padding:26px">
          <div class="badge badge-success" style="margin-bottom:14px">${icon('trendingUp', 12)} Weekly earnings — this pro</div>
          ${U.barChart([3200, 4100, 3800, 5200, 4700, 6100, 5800, 7200, 6600, 8400, 7900, 9600], ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F'])}
          <div class="small muted" style="margin-top:12px">Rahul S., AC & Appliance Expert, Mumbai — 96 jobs in 90 days</div>
        </div>
      </div>
    </div></section>`;

  const render = (name, params) => {
    const map = {
      login: { html: Login, wire: loginWire },
      register: { html: Register, wire: registerWire },
      forgot: { html: Forgot, wire: forgotWire },
      'verify-otp': { html: VerifyOTP, wire: verifyOTPWire },
      'forgot-otp': { html: VerifyOTP, wire: verifyOTPWire },
      'reset-password': { html: ResetPassword, wire: resetPasswordWire },
      'pro-onboarding': { html: ProOnboarding, wire: proOnboardWire },
      'become-pro': { html: BecomePro, wire: null },
    };
    const r = map[name];
    return r ? { html: r.html(params), wire: r.wire } : null;
  };

  return { render, doLogin: (role, email) => { Store.login({ name: email.split('@')[0], role }); location.hash = '#/dashboard/overview'; } };
})();
