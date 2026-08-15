/* ============ SERVEHUB BOOKING FLOW ============ */
window.Booking = (() => {
  const { icon, money, esc, stars, avatar, toast, openModal, closeModal, modalShell, fmtDate, fmtTime, timeAgo, fileToDataURL } = U;
  let timers = [];

  const clearTimers = () => { timers.forEach(clearInterval); timers = []; };

  const packsOf = s => [
    { name: 'Standard', price: s.price, dur: s.dur, desc: 'Everything included, great value' },
    { name: 'Premium', price: Math.round(s.price * 1.3 / 10) * 10, dur: s.dur + ' + 30 min', desc: 'Senior expert + premium products' },
    { name: 'Express', price: Math.round(s.price * 1.15 / 10) * 10, dur: 'Priority slot', desc: 'Booked for today, faster arrival' },
  ];

  /* ---------------- BOOKING FLOW ---------------- */
  const steps = ['Variant', 'Date & Time', 'Address', 'Professional', 'Payment', 'Confirm'];
  let bk = null;
  const initBk = serviceId => {
    bk = { serviceId, step: 0, pack: 0, date: null, time: null, instant: false, emergency: false, addr: null, pro: null, autoPro: true, coupon: null, disc: 0, payMethod: 'upi', notes: '' };
    sessionStorage.setItem('sh:bk', JSON.stringify(bk));
  };
  const saveBk = () => { try { sessionStorage.setItem('sh:bk', JSON.stringify(bk)); } catch (e) {} };

  const BookFlow = ({ id }) => {
    const s = DATA.serviceById(id);
    if (!s) return `<section class="section"><div class="container"><div class="empty-state"><div class="e-ic">${icon('alert', 30)}</div><h3>Service not found</h3><a class="btn btn-primary" href="#/categories">Browse services</a></div></div></section>`;
    try { bk = JSON.parse(sessionStorage.getItem('sh:bk') || 'null'); } catch (e) {}
    if (!bk || bk.serviceId !== id) initBk(id);
    const cat = DATA.catBySlug(s.cat);
    const packs = packsOf(s);
    const P = packs[bk.pack] || packs[0];
    const sub = P.price;
    const gst = Math.round(sub * 0.18);
    const disc = bk.disc || 0;
    const total = sub + gst - disc + (bk.emergency ? 99 : 0);
    const today = new Date();

    const dateOpts = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today.getTime() + i * 86400000);
      return { ts: d.getTime(), day: d.toLocaleDateString('en-IN', { day: '2-digit' }), mon: d.toLocaleDateString('en-IN', { month: 'short' }), wd: d.toLocaleDateString('en-IN', { weekday: 'short' }) };
    });
    const slots = ['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'];
    const pros = DATA.prosForService(s);
    const walletBal = Store.state.wallet;
    const stepBody = [
      /* 0 variant */
      `<div style="margin-bottom:20px"><h3 style="font-size:18px">Choose your package</h3><p class="small muted">Every package includes the full service + 100% warranty + GST invoice.</p></div>
       ${packs.map((p, i) => `<div class="pack-row ${bk.pack === i ? 'on' : ''}" data-pack="${i}" tabindex="0" role="radio" aria-checked="${bk.pack === i}"><div><div class="pk-name">${p.name} <span class="badge ${i === 1 ? 'badge-success' : i === 2 ? 'badge-warn' : 'badge-primary'}">${i === 1 ? 'Best value' : i === 2 ? 'Urgent' : 'Popular'}</span></div><div class="pk-desc">${p.desc} • ${p.dur}</div></div><div class="pk-price">${money(p.price)}</div></div>`).join('')}`,
      /* 1 date & time */
      `<div style="margin-bottom:20px"><h3 style="font-size:18px">Pick a date</h3><p class="small muted">Earliest available: today, 09:00 AM</p></div>
       <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:20px">
         ${dateOpts.map((d, i) => `<button class="f-chip ${bk.date === d.ts ? 'on' : ''}" data-date="${d.ts}" style="flex:none;flex-direction:column;gap:2px;padding:10px 14px;line-height:1.2"><b style="font-size:13px">${i === 0 ? 'Today' : d.wd}</b><span>${d.day} ${d.mon}</span></button>`).join('')}
       </div>
       <h3 style="font-size:16px;margin-bottom:12px">Available time slots</h3>
       <div class="radio-pill" style="margin-bottom:20px">${slots.map(t => `<label><input type="radio" name="slot" value="${t}" ${bk.time === t ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div>
       <div class="grid g2" style="grid-template-columns:1fr 1fr;gap:10px;margin-bottom:6px">
         <label class="pack-row" style="cursor:pointer"><input type="checkbox" id="bk-instant" ${bk.instant ? 'checked' : ''} style="display:none"><span>${icon('zap', 16)} <span><b>Instant booking</b><br><span class="pk-desc">Nearest expert, earliest slot</span></span></span></label>
         <label class="pack-row" style="cursor:pointer"><input type="checkbox" id="bk-emergency" ${bk.emergency ? 'checked' : ''} style="display:none"><span>${icon('rocket', 16)} <span><b>Emergency +₹99</b><br><span class="pk-desc">Priority dispatch, ~60 min</span></span></span></label>
       </div>`,
      /* 2 address */
      `<div style="margin-bottom:20px"><h3 style="font-size:18px">Where should we come?</h3><p class="small muted">We use your address for booking & live tracking.</p></div>
       <div style="margin-bottom:16px;background:var(--surface-2);padding:14px;border-radius:14px;border:1px dashed var(--line)">
         <button type="button" class="btn btn-soft btn-block" id="bk-detect-loc" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;font-weight:600">
           ${icon('navigation', 16)} Use current device location
         </button>
         <div id="bk-loc-status" class="small center" style="margin-top:6px"></div>
       </div>
       ${Store.state.addr.map(a => `<div class="pack-row ${bk.addr === a.id ? 'on' : ''}" data-addr="${a.id}" tabindex="0"><div><div class="pk-name">${icon('pin', 14)} ${esc(a.label)} ${a.primary ? '<span class="badge badge-primary">Default</span>' : ''}</div><div class="pk-desc">${esc(a.line)}, ${esc(a.area)}, ${esc(a.city)} — ${a.pin}</div></div><span class="verified">${icon('badgeCheck', 11)} Verified</span></div>`).join('')}
       <button class="btn btn-outline btn-block" data-act="add-addr">${icon('plus', 15)} Add new address</button>`,
      /* 3 professional */
      `<div style="margin-bottom:20px"><h3 style="font-size:18px">Choose your professional</h3><p class="small muted">All experts are verified, rated and background-checked.</p></div>
       <label class="pack-row ${bk.autoPro ? 'on' : ''}" data-pro="auto" tabindex="0" style="background:var(--grad-soft);border-color:var(--primary-100)"><div><div class="pk-name">${icon('sparkles', 15)} Auto-assign best professional</div><div class="pk-desc">We pick the highest-rated available expert near you</div></div><span class="verified">${icon('badgeCheck', 11)} Recommended</span></label>
       ${pros.map(p => `<div class="pack-row ${!bk.autoPro && bk.pro === p.id ? 'on' : ''}" data-pro="${p.id}" tabindex="0">
         <div style="display:flex;gap:12px;align-items:center">${avatar(p.name, 44)}<div><div class="pk-name">${esc(p.name)} ${p.verified ? icon('badgeCheck', 13) : ''}</div><div class="pk-desc">${ratingPillSmall(p.rating)} ${p.jobs.toLocaleString('en-IN')} jobs • ${p.exp} yrs • ${p.dist} km away</div></div></div>
         <div class="pk-price" style="font-size:14px">${money(p.rate)}<span class="xsmall muted" style="font-weight:500">/hr</span></div>
       </div>`).join('')}`,
      /* 4 payment */
      `<div style="margin-bottom:20px"><h3 style="font-size:18px">Secure payment</h3><p class="small muted">256-bit encrypted • PCI-DSS compliant • GST invoice on completion</p></div>
       <div class="field"><label class="label" for="bk-coupon">Promo code</label><div style="display:flex;gap:8px"><input class="input" id="bk-coupon" placeholder="e.g. SERVE10" value="${bk.coupon || ''}"><button class="btn btn-soft" id="bk-apply-coupon">Apply</button></div>
       <div id="coupon-msg" class="small"></div></div>
       <div style="margin:6px 0 14px">${[['upi', 'UPI', 'Google Pay, PhonePe, Paytm', 'smartphone'], ['card', 'Credit / Debit Card', 'Visa, Mastercard, RuPay, Amex', 'card'], ['net', 'Net Banking', 'All major banks', 'bank'], ['wallet', 'Servehub Wallet', `Balance: ${money(walletBal)}`, 'wallet'], ['cash', 'Cash', 'Pay the professional directly', 'cash'], ['emi', 'EMI', 'No-cost EMI on 3/6/9 months', 'percent']].map(m => `
         <div class="pay-method ${bk.payMethod === m[0] ? 'on' : ''}" data-pay="${m[0]}"><span class="pm-ic" style="background:var(--primary-50);color:var(--primary-600)">${icon(m[3], 19)}</span><div class="pm-info"><div class="pm-name">${m[1]}</div><div class="pm-sub">${m[2]}</div></div><span class="ic" style="color:var(--primary)">${bk.payMethod === m[0] ? icon('checkCircle', 18) : ''}</span></div>`).join('')}
       </div>
       <div id="pay-detail"></div>
       <div class="field"><label class="label" for="bk-notes">Notes for the professional (optional)</label><textarea class="textarea" id="bk-notes" style="min-height:70px" placeholder="e.g. please carry a ladder, parking is available">${bk.notes || ''}</textarea></div>`,
      /* 5 confirm */
      `<div style="text-align:center;padding:14px 0 6px"><div class="e-ic" style="width:88px;height:88px;border-radius:26px;background:var(--success-50);color:var(--success);display:grid;place-items:center;margin:0 auto 18px;box-shadow:0 0 0 10px var(--success-50)">${icon('checkCircle', 44)}</div>
       <h3 style="font-size:22px">Almost there!</h3><p class="small muted" style="margin:8px 0 22px">Review your booking details one last time — then confirm to lock in your slot.</p></div>
       <div class="card glass" style="padding:20px;margin-bottom:16px">
         <div class="sum-row"><span class="muted">Service</span><b>${esc(s.name)}</b></div>
         <div class="sum-row"><span class="muted">Package</span><b>${P.name} • ${P.dur}</b></div>
         <div class="sum-row"><span class="muted">Slot</span><b>${bk.date ? fmtDate(bk.date) : 'Today'} at ${bk.time || 'Earliest'}</b></div>
         <div class="sum-row"><span class="muted">Professional</span><b>${bk.autoPro ? 'Auto-assigned' : esc((pros.find(p => p.id === bk.pro) || {}).name || '')}</b></div>
         <div class="sum-row"><span class="muted">Address</span><b style="max-width:220px;text-align:right">${esc((Store.state.addr.find(a => a.id === bk.addr) || {}).label || 'Add at booking')}</b></div>
         ${bk.emergency ? '<div class="sum-row"><span class="muted">Emergency dispatch</span><b>+₹99</b></div>' : ''}
       </div>
       <p class="xsmall muted center">By confirming you agree to Servehub's Terms, Cancellation &amp; Refund Policy.</p>`,
    ][bk.step];

    return `
    <section class="section" style="padding-top:calc(var(--nav-h) + 28px)">
      <div class="container" style="max-width:960px">
        <div class="crumbs"><a href="">Home</a><span>/</span><a href="#/service/${s.id}">${esc(s.name)}</a><span>/</span><span>Book</span></div>
        ${U.stepper(steps, bk.step)}
        <div class="grid" style="grid-template-columns:1.5fr 1fr;gap:28px;align-items:start">
          <div class="card" style="padding:28px" id="bk-step">${stepBody}</div>
          <aside class="summary-card">
            <div class="card" style="padding:24px">
              <div class="svc-art" style="height:100px;border-radius:12px;margin-bottom:16px;overflow:hidden;position:relative;background:var(--surface-2)">
                ${s.img ? `<img src="${s.img}" alt="${esc(s.name)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
                <div class="art-bg" style="background:${s.g};${s.img ? 'display:none' : ''}">${icon(s.icon, 36)}</div>
              </div>
              <b style="font-size:15px">${esc(s.name)}</b>
              <div class="small muted" style="margin-bottom:12px">${esc(cat.name)} • ${esc(s.dur)}</div>
              <div class="sum-row"><span>Package</span><b>${P.name} ${money(P.price)}</b></div>
              <div class="sum-row"><span>GST (18%)</span><b>${money(gst)}</b></div>
              ${disc ? `<div class="sum-row" style="color:var(--success-600)"><span>Coupon ${esc(bk.coupon || '')}</span><b>−${money(disc)}</b></div>` : ''}
              ${bk.emergency ? '<div class="sum-row"><span>Emergency</span><b>+₹99</b></div>' : ''}
              <div class="sum-total"><span>Total</span><span class="grad-text">${money(total)}</span></div>
              <div style="display:flex;gap:10px;margin-top:20px">
                ${bk.step > 0 ? `<button class="btn btn-outline" id="bk-back" style="flex:1">${icon('arrowLeft', 15)} Back</button>` : `<a class="btn btn-outline" href="#/service/${s.id}" style="flex:1">${icon('arrowLeft', 15)} Cancel</a>`}
                <button class="btn btn-cta" id="bk-next" style="flex:1.6">${bk.step === 5 ? icon('check', 16) + ' Confirm & Pay' : 'Continue ' + icon('arrowRight', 15)}</button>
              </div>
              <div class="small muted center" style="margin-top:14px">${icon('lock', 12)} Free cancellation up to 24h before</div>
            </div>
          </aside>
        </div>
      </div>
    </section>`;
  };

  const ratingPillSmall = r => `<span class="rating">${icon('star')}${r}</span>`;

  const payDetailHtml = () => {
    if (bk.payMethod === 'upi') return `<div class="field"><label class="label" for="pd-upi">Enter your UPI ID</label><div class="input-group">${icon('smartphone', 17)}<input class="input input-icon-r" id="pd-upi" placeholder="yourname@upi"></div></div><div class="field"><label class="label">Choose UPI app</label><div class="radio-pill">${['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((a, i) => `<label><input type="radio" name="upiapp" ${i === 0 ? 'checked' : ''}><span>${a}</span></label>`).join('')}</div></div>`;
    if (bk.payMethod === 'card') return `
      <div class="field"><label class="label" for="pd-card">Card number</label><div class="input-group">${icon('card', 17)}<input class="input input-icon-r" id="pd-card" placeholder="1234 5678 9012 3456" maxlength="19" inputmode="numeric"></div></div>
      <div class="grid g2" style="grid-template-columns:1fr 1fr;gap:12px">
        <div class="field"><label class="label" for="pd-exp">Expiry</label><input class="input" id="pd-exp" placeholder="MM/YY" maxlength="5"></div>
        <div class="field"><label class="label" for="pd-cvv">CVV</label><div class="input-group">${icon('lock', 15)}<input class="input input-icon-r" id="pd-cvv" type="password" placeholder="•••" maxlength="4"></div></div>
      </div>`;
    if (bk.payMethod === 'net') return `<div class="field"><label class="label" for="pd-bank">Select your bank</label><select class="select" id="pd-bank"><option>HDFC Bank</option><option>ICICI Bank</option><option>SBI</option><option>Axis Bank</option><option>Kotak Mahindra</option></select></div>`;
    if (bk.payMethod === 'wallet') {
      const bal = Store.state.wallet;
      return `<div class="card glass" style="padding:16px;display:flex;justify-content:space-between;align-items:center"><div><b>Wallet balance</b><div style="font-size:20px;font-weight:900;color:var(--success-600)">${money(bal)}</div></div>${bal >= total() ? `<span class="badge badge-success">${icon('check', 12)} Sufficient</span>` : `<span class="badge badge-warn">Pay ₹${money(total() - bal)} via card</span>`}</div>`;
    }
    if (bk.payMethod === 'emi') return `<div class="field"><label class="label" for="pd-emi">Choose EMI plan</label><select class="select" id="pd-emi"><option>3 months — no-cost</option><option>6 months — 0% interest</option><option>9 months — ₹${Math.ceil(total() * 0.117)}/mo</option></select></div>`;
    return `<div class="card glass" style="padding:16px"><b>${icon('cash', 16)} Pay the professional directly</b><p class="small muted" style="margin-top:4px">Keep exact change ready. You will receive a GST invoice instantly after payment.</p></div>`;
  };
  const total = () => {
    const s = DATA.serviceById(bk.serviceId);
    const P = packsOf(s)[bk.pack];
    return P.price + Math.round(P.price * 0.18) - (bk.disc || 0) + (bk.emergency ? 99 : 0);
  };

  const BookWire = root => {
    const renderPay = () => { const el = U.$('#pay-detail', root); if (el) el.innerHTML = payDetailHtml(); };
    renderPay();
    U.$('#pd-card')?.addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '); });
    U.$('#pd-exp')?.addEventListener('input', e => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); e.target.value = v; });

    const setStep = n => { bk.step = n; saveBk(); window.App && App.refresh(); };

    U.$$('[data-pack]', root).forEach(el => el.addEventListener('click', () => { bk.pack = Number(el.dataset.pack); saveBk(); setStep(bk.step); }));
    U.$$('[data-date]', root).forEach(el => el.addEventListener('click', () => { bk.date = Number(el.dataset.date); saveBk(); U.$$('[data-date]', root).forEach(b => b.classList.toggle('on', b === el)); }));
    U.$$('input[name="slot"]', root).forEach(el => el.addEventListener('change', () => { bk.time = el.value; saveBk(); }));
    U.$('#bk-instant')?.addEventListener('change', e => { bk.instant = e.target.checked; saveBk(); });
    U.$('#bk-emergency')?.addEventListener('change', e => { bk.emergency = e.target.checked; saveBk(); });
    U.$$('[data-addr]', root).forEach(el => el.addEventListener('click', () => { bk.addr = el.dataset.addr; saveBk(); U.$$('[data-addr]', root).forEach(b => b.classList.toggle('on', b === el)); }));
    U.$$('[data-pro]', root).forEach(el => el.addEventListener('click', () => { if (el.dataset.pro === 'auto') { bk.autoPro = true; bk.pro = null; } else { bk.autoPro = false; bk.pro = el.dataset.pro; } saveBk(); U.$$('[data-pro]', root).forEach(b => b.classList.toggle('on', b === el)); }));
    U.$$('[data-pay]', root).forEach(el => el.addEventListener('click', () => { bk.payMethod = el.dataset.pay; saveBk(); U.$$('[data-pay]', root).forEach(b => { b.classList.toggle('on', b === el); b.querySelector('.ic').innerHTML = b === el ? icon('checkCircle', 18) : ''; }); renderPay(); }));

    const applyCoupon = () => {
      const code = (U.$('#bk-coupon')?.value || '').trim();
      const s = DATA.serviceById(bk.serviceId);
      const sub = packsOf(s)[bk.pack].price;
      const r = Store.applyCoupon(code, sub);
      const msg = U.$('#coupon-msg');
      if (r.ok) { bk.coupon = code; bk.disc = r.disc; saveBk(); msg.innerHTML = `<b style="color:var(--success-600)">${icon('checkCircle', 13)} ${esc(code.toUpperCase())} applied — you save ${money(r.disc)}!</b>`; toast('Coupon applied 🎉'); setStep(bk.step); }
      else { msg.innerHTML = `<b style="color:var(--danger-600)">${esc(r.msg)}</b>`; }
    };
    U.$('#bk-apply-coupon')?.addEventListener('click', applyCoupon);
    U.$('#bk-coupon')?.addEventListener('keydown', e => { if (e.key === 'Enter') applyCoupon(); });

    U.$('#bk-next').addEventListener('click', () => {
      const s = DATA.serviceById(bk.serviceId);
      if (bk.step === 1 && !bk.date) { toast('Please pick a date first', 'warn'); return; }
      if (bk.step === 1 && !bk.time) { toast('Please pick a time slot', 'warn'); return; }
      if (bk.step === 2 && !bk.addr) { toast('Please select or add an address', 'warn'); return; }
      if (bk.step === 4) {
        // pay
        const btn = U.$('#bk-next'); btn.disabled = true; btn.innerHTML = `${icon('timer', 16)} Processing payment…`;
        setTimeout(() => {
          const pro = bk.autoPro ? (DATA.prosForService(s)[0] || Store.demoPro()) : (DATA.proById(bk.pro) || DATA.prosForService(s)[0]);
          const P = packsOf(s)[bk.pack];
          const addr = Store.state.addr.find(a => a.id === bk.addr) || {};
          const locDet = bk.locationDetails || {};
          const photo = Store.getSelectedPhoto();
          const b = Store.addBooking({
            serviceId: s.id, serviceName: s.name, cat: s.cat, pack: P.name, packPrice: P.price, dur: P.dur,
            date: bk.date || Date.now(), time: bk.time, instant: bk.instant, emergency: bk.emergency,
            address: addr.line ? `${addr.line}, ${addr.area || ''}, ${addr.city || ''} — ${addr.pin || ''}` : (locDet.formattedAddress || 'Address on booking'),
            latitude: locDet.latitude || addr.latitude || null,
            longitude: locDet.longitude || addr.longitude || null,
            formattedAddress: locDet.formattedAddress || addr.line || '',
            city: locDet.city || addr.city || '',
            state: locDet.state || addr.state || '',
            pincode: locDet.pincode || addr.pin || '',
            country: locDet.country || addr.country || '',
            proId: pro.id, proName: pro.name, proRating: pro.rating,
            sub: P.price, disc: bk.disc, gst: Math.round(P.price * 0.18), total: total(), payMethod: bk.payMethod,
            coupon: bk.coupon, notes: bk.notes || '', problemPhoto: photo || null,
            walletUsed: bk.payMethod === 'wallet' ? Math.min(Store.state.wallet, total()) : 0,
          });
          Store.clearSelectedPhoto();
          if (bk.payMethod === 'wallet') { const used = Math.min(Store.state.wallet, total()); Store.walletTx(-used, 'booking ' + b.id); }
          Store.sendMsg(b.id, `Hi! This is ${pro.name} from Servehub. Your ${s.name} booking for ${fmtDate(b.date)} at ${b.time} is confirmed. See you soon! 👋`, 'them');
          Store.addNotif('calendar', 'Booking confirmed', `Booking ${b.id} for ${s.name} on ${fmtDate(b.date)} at ${b.time} is confirmed. Track it live!`);
          bk.step = 5; bk.confirmedId = b.id; saveBk();
          U.$('#bk-step', root).innerHTML = stepConfirm(b, s, pro);
          U.$('#bk-next', root).remove();
          const back = U.$('#bk-back', root); if (back) back.remove();
          U.$('.summary-card .btn-cta', root)?.parentElement?.remove();
        }, 1500);
        return;
      }
      if (bk.step === 5) { location.hash = '#/track/' + bk.confirmedId; return; }
      bk.step++;
      saveBk();
      U.$('#bk-step', root).innerHTML = stepBodyHtml(bk.step);
      wireStep(root);
    });
    U.$('#bk-back')?.addEventListener('click', () => { if (bk.step > 0) { bk.step--; saveBk(); U.$('#bk-step', root).innerHTML = stepBodyHtml(bk.step); wireStep(root); } });
    wireStep(root);
  };

  const stepBodyHtml = step => {
    const s = DATA.serviceById(bk.serviceId);
    const packs = packsOf(s);
    const today = new Date();
    const dateOpts = Array.from({ length: 14 }, (_, i) => { const d = new Date(today.getTime() + i * 86400000); return { ts: d.getTime(), day: d.toLocaleDateString('en-IN', { day: '2-digit' }), mon: d.toLocaleDateString('en-IN', { month: 'short' }), wd: d.toLocaleDateString('en-IN', { weekday: 'short' }) }; });
    const slots = ['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'];
    const pros = DATA.prosForService(s);
    if (step === 0) return `
      <div style="margin-bottom:20px"><h3 style="font-size:18px">Choose your package</h3><p class="small muted">Every package includes the full service + 100% warranty + GST invoice.</p></div>
      ${packs.map((p, i) => `<div class="pack-row ${bk.pack === i ? 'on' : ''}" data-pack="${i}" tabindex="0"><div><div class="pk-name">${p.name} <span class="badge ${i === 1 ? 'badge-success' : i === 2 ? 'badge-warn' : 'badge-primary'}">${i === 1 ? 'Best value' : i === 2 ? 'Urgent' : 'Popular'}</span></div><div class="pk-desc">${p.desc} • ${p.dur}</div></div><div class="pk-price">${money(p.price)}</div></div>`).join('')}`;
    if (step === 1) return `
      <div style="margin-bottom:20px"><h3 style="font-size:18px">Pick a date</h3><p class="small muted">Earliest available: today, 09:00 AM</p></div>
      <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:20px">${dateOpts.map((d, i) => `<button class="f-chip ${bk.date === d.ts ? 'on' : ''}" data-date="${d.ts}" style="flex:none;flex-direction:column;gap:2px;padding:10px 14px;line-height:1.2"><b style="font-size:13px">${i === 0 ? 'Today' : d.wd}</b><span>${d.day} ${d.mon}</span></button>`).join('')}</div>
      <h3 style="font-size:16px;margin-bottom:12px">Available time slots</h3>
      <div class="radio-pill" style="margin-bottom:20px">${slots.map(t => `<label><input type="radio" name="slot" value="${t}" ${bk.time === t ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div>
      <div class="grid g2" style="grid-template-columns:1fr 1fr;gap:10px;margin-bottom:6px">
        <label class="pack-row" style="cursor:pointer"><input type="checkbox" id="bk-instant" ${bk.instant ? 'checked' : ''} style="display:none"><span style="display:flex;gap:10px">${icon('zap', 16)} <span><b>Instant booking</b><br><span class="pk-desc">Nearest expert, earliest slot</span></span></span></label>
        <label class="pack-row" style="cursor:pointer"><input type="checkbox" id="bk-emergency" ${bk.emergency ? 'checked' : ''} style="display:none"><span style="display:flex;gap:10px">${icon('rocket', 16)} <span><b>Emergency +₹99</b><br><span class="pk-desc">Priority dispatch, ~60 min</span></span></span></label>
      </div>`;
    if (step === 2) return `
      <div style="margin-bottom:20px"><h3 style="font-size:18px">Where should we come?</h3><p class="small muted">Identify your exact service location using high-accuracy GPS, interactive map, satellite view, address search, or draggable pin.</p></div>
      
      <!-- Interactive GPS Location Picker Container -->
      <div id="bk-location-picker-mount"></div>

      <!-- Saved Addresses Options -->
      <div style="margin-top:20px;border-top:1px dashed var(--line);padding-top:16px">
        <h4 style="font-size:14.5px;font-weight:800;margin-bottom:10px;color:var(--ink)">Or pick from saved addresses:</h4>
        ${Store.state.addr.map(a => `<div class="pack-row ${bk.addr === a.id ? 'on' : ''}" data-addr="${a.id}" tabindex="0"><div><div class="pk-name">${icon('pin', 14)} ${esc(a.label)} ${a.primary ? '<span class="badge badge-primary">Default</span>' : ''}</div><div class="pk-desc">${esc(a.line)}, ${esc(a.area)}, ${esc(a.city)} — ${a.pin}</div></div><span class="verified">${icon('badgeCheck', 11)} Verified</span></div>`).join('')}
        <button class="btn btn-outline btn-block" data-act="add-addr" style="margin-top:10px">${icon('plus', 15)} Add new address</button>
      </div>`;
    if (step === 3) return `
      <div style="margin-bottom:20px"><h3 style="font-size:18px">Choose your professional</h3><p class="small muted">All experts are verified, rated and background-checked.</p></div>
      <label class="pack-row ${bk.autoPro ? 'on' : ''}" data-pro="auto" tabindex="0" style="background:var(--grad-soft);border-color:var(--primary-100)"><div><div class="pk-name">${icon('sparkles', 15)} Auto-assign best professional</div><div class="pk-desc">We pick the highest-rated available expert near you</div></div><span class="verified">${icon('badgeCheck', 11)} Recommended</span></label>
      ${pros.map(p => `<div class="pack-row ${!bk.autoPro && bk.pro === p.id ? 'on' : ''}" data-pro="${p.id}" tabindex="0"><div style="display:flex;gap:12px;align-items:center">${avatar(p.name, 44)}<div><div class="pk-name">${esc(p.name)} ${p.verified ? icon('badgeCheck', 13) : ''}</div><div class="pk-desc">${ratingPillSmall(p.rating)} ${p.jobs.toLocaleString('en-IN')} jobs • ${p.exp} yrs • ${p.dist} km away</div></div></div><div class="pk-price" style="font-size:14px">${money(p.rate)}<span class="xsmall muted" style="font-weight:500">/hr</span></div></div>`).join('')}`;
    if (step === 4) return `
      <div style="margin-bottom:20px"><h3 style="font-size:18px">Secure payment</h3><p class="small muted">256-bit encrypted • PCI-DSS compliant • GST invoice on completion</p></div>
      <div class="field"><label class="label" for="bk-coupon">Promo code</label><div style="display:flex;gap:8px"><input class="input" id="bk-coupon" placeholder="e.g. SERVE10" value="${bk.coupon || ''}"><button class="btn btn-soft" id="bk-apply-coupon">Apply</button></div><div id="coupon-msg" class="small"></div></div>
      <div style="margin:6px 0 14px">${[['upi', 'UPI', 'Google Pay, PhonePe, Paytm', 'smartphone'], ['card', 'Credit / Debit Card', 'Visa, Mastercard, RuPay, Amex', 'card'], ['net', 'Net Banking', 'All major banks', 'bank'], ['wallet', 'Servehub Wallet', `Balance: ${money(Store.state.wallet)}`, 'wallet'], ['cash', 'Cash', 'Pay the professional directly', 'cash'], ['emi', 'EMI', 'No-cost EMI on 3/6/9 months', 'percent']].map(m => `
        <div class="pay-method ${bk.payMethod === m[0] ? 'on' : ''}" data-pay="${m[0]}"><span class="pm-ic" style="background:var(--primary-50);color:var(--primary-600)">${icon(m[3], 19)}</span><div class="pm-info"><div class="pm-name">${m[1]}</div><div class="pm-sub">${m[2]}</div></div><span class="ic" style="color:var(--primary)">${bk.payMethod === m[0] ? icon('checkCircle', 18) : ''}</span></div>`).join('')}</div>
      <div id="pay-detail"></div>
      <div class="field"><label class="label" for="bk-notes">Notes for the professional (optional)</label><textarea class="textarea" id="bk-notes" style="min-height:70px" placeholder="e.g. please carry a ladder, parking is available">${bk.notes || ''}</textarea></div>`;
    if (step === 5) return stepConfirm(DATA.serviceById(bk.serviceId), null, null, true);
    return '';
  };

  const stepConfirm = (b, s, pro, mid) => {
    const svc = s || DATA.serviceById(bk.serviceId);
    // b may be a real booking (has serviceName) or a service object on the mid path
    const isBk = !!(b && b.serviceName);
    const id = isBk ? b.id : (bk.confirmedId || '');
    const serviceName = isBk ? b.serviceName : (svc ? svc.name : '');
    const proName = isBk ? b.proName : (bk.pro ? (DATA.proById(bk.pro) || {}).name : 'Auto-assigned');
    const date = isBk ? b.date : bk.date;
    const time = isBk ? b.time : bk.time;
    const address = isBk ? (b.address || '—') : ((Store.state.addr.find(a => a.id === bk.addr) || {}).label || 'Add at booking');
    const amount = isBk ? b.total : total();
    const pay = isBk ? (b.payMethod || 'upi') : (bk.payMethod || 'upi');
    return `<div style="text-align:center;padding:14px 0 6px"><div class="e-ic" style="width:88px;height:88px;border-radius:26px;background:var(--success-50);color:var(--success);display:grid;place-items:center;margin:0 auto 18px;box-shadow:0 0 0 10px var(--success-50)">${icon('checkCircle', 44)}</div>
    <h3 style="font-size:22px">Booking confirmed! 🎉</h3><p class="small muted" style="margin:8px 0 22px">Your booking <b>${id}</b> is locked in. Track your professional live.</p></div>
    <div class="card glass" style="padding:20px;margin-bottom:16px">
      <div class="sum-row"><span class="muted">Booking ID</span><b>${esc(id)}</b></div>
      <div class="sum-row"><span class="muted">Service</span><b>${esc(serviceName)}</b></div>
      <div class="sum-row"><span class="muted">Provider</span><b>${esc(proName)} ${icon('badgeCheck', 13)}</b></div>
      <div class="sum-row"><span class="muted">Date &amp; time</span><b>${date ? fmtDate(date) : 'Today'} at ${esc(time || 'Earliest')}</b></div>
      <div class="sum-row"><span class="muted">Address</span><b style="max-width:240px;text-align:right">${esc(address)}</b></div>
      <div class="sum-row"><span class="muted">Estimated price</span><b>${money(amount)}</b></div>
      <div class="sum-row"><span class="muted">Paid via</span><b>${esc(pay.toUpperCase())}</b></div>
    </div>
    <a class="btn btn-cta btn-lg btn-block" href="#/track/${id}">${icon('navigation', 17)} Track my professional</a>
    <a class="btn btn-outline btn-block" style="margin-top:10px" href="tel:+918045678900">${icon('phone', 15)} Need help? Call +91 80 4567 8900</a>`;
  };

  const wireStep = root => {
    U.$$('[data-pack]', root).forEach(el => el.addEventListener('click', () => { bk.pack = Number(el.dataset.pack); saveBk(); U.$$('[data-pack]', root).forEach(b => b.classList.toggle('on', b === el)); setStep(bk.step); }));
    U.$$('[data-date]', root).forEach(el => el.addEventListener('click', () => { bk.date = Number(el.dataset.date); saveBk(); U.$$('[data-date]', root).forEach(b => b.classList.toggle('on', b === el)); }));
    U.$$('input[name="slot"]', root).forEach(el => el.addEventListener('change', () => { bk.time = el.value; saveBk(); }));
    U.$('#bk-instant')?.addEventListener('change', e => { bk.instant = e.target.checked; saveBk(); });
    U.$('#bk-emergency')?.addEventListener('change', e => { bk.emergency = e.target.checked; saveBk(); });
    U.$$('[data-addr]', root).forEach(el => el.addEventListener('click', () => { bk.addr = el.dataset.addr; saveBk(); U.$$('[data-addr]', root).forEach(b => b.classList.toggle('on', b === el)); }));
    
    // Mount Interactive Location Picker Component for Step 2
    if (bk.step === 2) {
      const mountEl = U.$('#bk-location-picker-mount', root);
      if (mountEl && window.LocationPicker) {
        new window.LocationPicker(mountEl, {
          onLocationConfirmed: (locDetails) => {
            if (!locDetails) return;
            const newAddr = {
              id: 'a_gps_' + Date.now(),
              label: 'Exact GPS Location',
              line: locDetails.formattedAddress,
              area: locDetails.city || 'Locality',
              city: locDetails.city || 'City',
              pin: locDetails.pincode || '400001',
              latitude: locDetails.latitude,
              longitude: locDetails.longitude,
              state: locDetails.state,
              country: locDetails.country,
              primary: true,
            };
            Store.state.addr.forEach(x => x.primary = false);
            Store.state.addr.unshift(newAddr);
            Store.persist();
            bk.addr = newAddr.id;
            bk.locationDetails = locDetails;
            saveBk();
          },
          onLocationChanged: (locDetails) => {
            if (!locDetails) return;
            bk.locationDetails = locDetails;
            saveBk();
          }
        });
      }
    }

    U.$$('[data-pro]', root).forEach(el => el.addEventListener('click', () => { if (el.dataset.pro === 'auto') { bk.autoPro = true; bk.pro = null; } else { bk.autoPro = false; bk.pro = el.dataset.pro; } saveBk(); U.$$('[data-pro]', root).forEach(b => b.classList.toggle('on', b === el)); }));
    U.$$('[data-pay]', root).forEach(el => el.addEventListener('click', () => { bk.payMethod = el.dataset.pay; saveBk(); U.$$('[data-pay]', root).forEach(b => { b.classList.toggle('on', b === el); const ic = b.querySelector('.ic'); if (ic) ic.innerHTML = b === el ? icon('checkCircle', 18) : ''; }); U.$('#pay-detail', root).innerHTML = payDetailHtml(); wirePay(root); }));
    U.$('#bk-apply-coupon')?.addEventListener('click', applyCouponFn);
    U.$('#bk-coupon')?.addEventListener('keydown', e => { if (e.key === 'Enter') applyCouponFn(); });
    wirePay(root);
  };
  const applyCouponFn = () => {
    const code = (U.$('#bk-coupon')?.value || '').trim();
    const s = DATA.serviceById(bk.serviceId);
    const sub = packsOf(s)[bk.pack].price;
    const r = Store.applyCoupon(code, sub);
    const msg = U.$('#coupon-msg');
    if (r.ok) { bk.coupon = code; bk.disc = r.disc; saveBk(); msg.innerHTML = `<b style="color:var(--success-600)">${icon('checkCircle', 13)} ${esc(code.toUpperCase())} applied — you save ${money(r.disc)}!</b>`; toast('Coupon applied 🎉'); window.App && App.refresh(); }
    else msg.innerHTML = `<b style="color:var(--danger-600)">${esc(r.msg)}</b>`;
  };
  const wirePay = root => {
    const det = U.$('#pay-detail', root); if (!det) return;
    if (bk.payMethod === 'wallet') {
      const bal = Store.state.wallet;
      det.innerHTML = `<div class="card glass" style="padding:16px;display:flex;justify-content:space-between;align-items:center"><div><b>Wallet balance</b><div style="font-size:20px;font-weight:900;color:var(--success-600)">${money(bal)}</div></div>${bal >= total() ? `<span class="badge badge-success">${icon('check', 12)} Sufficient</span>` : `<span class="badge badge-warn">Need ₹${money(total() - bal)} more</span>`}</div>`;
    }
  };

  /* ---------------- TRACK ---------------- */
  const TrackPage = ({ id }) => {
    const b = Store.bookingById(id);
    if (!b) return `<section class="section"><div class="container"><div class="empty-state"><div class="e-ic">${icon('alert', 30)}</div><h3>Booking not found</h3><a class="btn btn-primary" href="#/dashboard">Go to dashboard</a></div></div></section>`;
    const idx = Store.statusIndex(b);
    const isCancelled = ['cancelled', 'rejected'].includes(b.status);
    const done = idx >= 5;
    const s = DATA.serviceById(b.serviceId);
    const pro = DATA.proById(b.proId) || { name: b.proName, rating: b.proRating, tags: [] };
    const chat = Store.getChat(b.id);
    return `
    <section class="section" style="padding-top:calc(var(--nav-h) + 28px)">
      <div class="container" style="max-width:1060px">
        <div class="crumbs"><a href="">Home</a><span>/</span><a href="#/dashboard/bookings">My bookings</a><span>/</span><span>${b.id}</span></div>
        <div class="main-head"><div><h2>${isCancelled ? 'Booking cancelled' : 'Live booking status'}</h2>
          <div class="greet">${b.serviceName} • ${fmtDate(b.date)} at ${b.time} • ${b.id}</div></div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">${!isCancelled && idx < 2 ? `<button class="btn btn-outline btn-sm" data-act="resched" data-id="${b.id}">${icon('refreshCw', 14)} Reschedule</button>` : ''}${!isCancelled && idx < 3 ? `<button class="btn btn-danger btn-sm" data-act="cancel-bk" data-id="${b.id}">${icon('calendarX', 14)} Cancel</button>` : ''}${idx >= 4 ? `<a class="btn btn-primary btn-sm" href="#/invoice/${b.id}">${icon('file', 14)} Invoice</a>` : ''}</div>
        </div>

        ${isCancelled ? `<div class="card" style="padding:32px;text-align:center"><div class="e-ic" style="width:72px;height:72px;border-radius:22px;background:${b.status === 'rejected' ? 'var(--warn-50)' : 'var(--danger-50)'};color:${b.status === 'rejected' ? 'var(--warn-600)' : 'var(--danger)'};display:grid;place-items:center;margin:0 auto 16px">${icon(b.status === 'rejected' ? 'alert' : 'calendarX', 30)}</div><h3>${b.status === 'rejected' ? 'This booking was rejected' : 'This booking was cancelled'}</h3><p class="small muted" style="margin:8px 0 18px">${b.status === 'rejected' ? 'The professional could not take this slot. We are finding you a replacement — or book a new time.' : money(b.total) + ' has been refunded ' + (b.walletUsed ? 'to your wallet' : 'to your original payment method') + '.'}</p><a class="btn btn-primary" href="#/categories">Book a new service</a></div></div>` : `
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:24px;align-items:start">
          <div class="card" style="padding:26px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px"><h3 style="font-size:16px">Booking timeline</h3>${U.statusPill(b.status)}</div>
            <div class="timeline">
              ${Store.STATUSES.map((st, i) => i === 6 ? '' : `
              <div class="tl-item ${i < idx ? 'done' : i === idx ? 'now' : ''}">
                <div class="tl-title">${st.label}</div>
                <div class="tl-sub">${i < idx ? 'Completed ' + fmtTime(Date.now() - (idx - i) * 900000) : i === idx ? (i === 0 ? 'Confirmed just now' : 'In progress…') : 'Upcoming'}</div>
              </div>`).join('')}
            </div>
            <div style="display:flex;gap:10px;margin-top:16px">
              <button class="btn btn-soft btn-sm" data-act="simulate" data-id="${b.id}" style="flex:1">${icon('refresh', 14)} Simulate next step</button>
            </div>
            <p class="xsmall muted" style="margin-top:10px">Demo: bookings advance automatically every ~12 seconds while this page is open.</p>
          </div>

          <div style="display:flex;flex-direction:column;gap:24px;min-width:0">
            <div class="card" style="padding:22px">
              <div style="display:flex;align-items:center;gap:14px">
                ${avatar(pro.name, 52, (b.proId || 'p').charCodeAt(1))}
                <div style="flex:1;min-width:0"><b>${esc(pro.name)}</b><div class="xsmall muted">${esc(pro.role || 'Professional')} • ★ ${pro.rating || b.proRating}</div><span class="verified">${icon('badgeCheck', 11)} Verified</span></div>
                <button class="icon-btn" data-act="call" data-id="${b.id}" aria-label="Call" title="Call">${icon('phone', 17)}</button>
                <button class="icon-btn" data-act="chat-focus" data-id="${b.id}" aria-label="Chat" title="Chat">${icon('chat', 17)}</button>
                <button class="icon-btn" data-act="video" data-id="${b.id}" aria-label="Video call" title="Video call">${icon('video', 17)}</button>
              </div>
              <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">${(pro.tags || []).slice(0, 3).map(t => `<span class="pro-tag">${esc(t)}</span>`).join('')}</div>
              <button class="btn btn-outline btn-sm btn-block" style="margin-top:14px" data-act="navigate" data-id="${b.id}">${icon('navigation', 14)} Start GPS navigation</button>
            </div>
            ${U.genMap()}
            <div class="card" style="padding:22px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="font-size:15px">Chat with ${esc(pro.name.split(' ')[0])}</h3><span class="badge badge-success"><span class="status-dot dot-green"></span>Online</span></div>
              <div class="chat-box" style="height:320px">
                <div class="chat-body" id="chat-body">${chat.map(m => msgHtml(m)).join('') || `<div class="small muted center" style="margin:auto">Say hello to your professional 👋</div>`}</div>
                <div class="chat-input-row"><input class="input" id="chat-input" placeholder="Type a message…" aria-label="Message"><button class="btn btn-primary" id="chat-send">${icon('send', 0)}</button></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="padding:26px;margin-top:24px">
          <h3 style="font-size:16px;margin-bottom:14px">Booking summary</h3>
          <div class="grid g2" style="grid-template-columns:1fr 1fr;gap:8px 40px">
            <div class="sum-row"><span class="muted">Booking ID</span><b>${b.id}</b></div>
            <div class="sum-row"><span class="muted">Invoice</span><b>${b.invoiceNo}</b></div>
            <div class="sum-row"><span class="muted">Package</span><b>${b.pack} • ${b.dur}</b></div>
            <div class="sum-row"><span class="muted">Payment</span><b>${b.payMethod.toUpperCase()}</b></div>
            <div class="sum-row"><span class="muted">Address</span><b style="max-width:280px;text-align:right">${esc(b.address)}</b></div>
            <div class="sum-row"><span class="muted">Notes</span><b>${esc(b.notes) || '—'}</b></div>
            <div class="sum-row"><span class="muted">Subtotal</span><b>${money(b.sub)}</b></div>
            ${b.disc ? `<div class="sum-row" style="color:var(--success-600)"><span>Coupon ${esc(b.coupon || '')}</span><b>−${money(b.disc)}</b></div>` : ''}
            <div class="sum-row"><span class="muted">GST 18%</span><b>${money(b.gst)}</b></div>
            <div class="sum-row"><span class="muted">Total</span><b style="font-size:16px">${money(b.total)}</b></div>
          </div>
          ${done && !b.rating ? `<div class="card glass" style="margin-top:18px;padding:18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap"><div style="flex:1;min-width:200px"><b>How was your service?</b><div class="small muted">Rate your experience and earn bonus points.</div></div><button class="btn btn-cta" data-act="rate" data-id="${b.id}">${icon('star', 15)} Rate experience</button></div>` : ''}
          ${done && b.rating ? `<div class="card glass" style="margin-top:18px;padding:18px;display:flex;align-items:center;gap:12px">${icon('starF', 22)}<div><b>You rated this booking ${b.rating}★</b><div class="small muted">${esc(b.rateText || 'Thanks for your feedback!')}</div></div></div>` : ''}
        </div>`}
      </div>
    </section>`;
  };

  const msgHtml = m => `<div class="msg ${m.from === 'me' ? 'me' : 'them'}">${esc(m.text)}<span class="m-time">${fmtTime(m.time)}</span></div>`;

  const TrackWire = root => {
    const b = Store.bookingById(location.hash.split('/')[2]);
    if (!b || ['cancelled', 'rejected', 'rated'].includes(b.status)) return;
    const iv = setInterval(() => {
      const bb = Store.bookingById(b.id);
      if (!bb) { clearInterval(iv); return; }
      if (['cancelled', 'paid', 'rated'].includes(bb.status)) { clearInterval(iv); U.toast('Payment complete — ₹' + (bb.cashback ? bb.cashback : 0) + ' cashback added', 'success'); return; }
      const nb = Store.advanceBooking(b.id);
      if (nb) reRender();
    }, 12000);
    timers.push(iv);
    // chat
    const send = () => {
      const inp = U.$('#chat-input', root); const text = (inp.value || '').trim();
      if (!text) return; inp.value = '';
      Store.sendMsg(b.id, text, 'me');
      const body = U.$('#chat-body', root);
      body.insertAdjacentHTML('beforeend', msgHtml({ text, from: 'me', time: Date.now() }));
      body.scrollTop = body.scrollHeight;
      setTimeout(() => {
        body.insertAdjacentHTML('beforeend', `<div class="msg them typing"><i></i><i></i><i></i></div>`);
        body.scrollTop = body.scrollHeight;
        setTimeout(() => {
          const typing = U.$('.msg.typing', root); if (typing) typing.remove();
          const replies = ['Got it! I will be there on time 👍', 'Sure, no problem at all.', 'Thanks for letting me know! See you soon. 😊', 'Yes, that works perfectly for me.'];
          const text = replies[Math.floor(Math.random() * replies.length)];
          Store.sendMsg(b.id, text, 'them');
          body.insertAdjacentHTML('beforeend', msgHtml({ text, from: 'them', time: Date.now() }));
          body.scrollTop = body.scrollHeight;
        }, 1400);
      }, 600);
    };
    U.$('#chat-send', root)?.addEventListener('click', send);
    U.$('#chat-input', root)?.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  };
  const reRender = () => { window.App && App.refresh(); };

  /* ---------------- INVOICE ---------------- */
  const Invoice = ({ id }) => {
    const b = Store.bookingById(id);
    if (!b) return `<section class="section"><div class="container"><div class="empty-state"><div class="e-ic">${icon('alert', 30)}</div><h3>Invoice not found</h3></div></div></section>`;
    const cgst = Math.round(b.gst / 2), sgst = b.gst - cgst;
    const pro = DATA.proById(b.proId);
    return `
    <section class="section" style="padding-top:calc(var(--nav-h) + 28px)">
      <div class="container" style="max-width:820px">
        <div class="no-print" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
          <a class="btn btn-outline btn-sm" href="#/track/${b.id}">${icon('arrowLeft', 14)} Back to booking</a>
          <button class="btn btn-primary btn-sm" onclick="window.print()">${icon('printer', 14)} Print / Save PDF</button>
        </div>
        <div class="card" style="padding:44px;border-top:4px solid var(--primary)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:32px">
            <div><div style="display:flex;align-items:center;gap:10px"><span class="logo-mark">${icon('zap', 20)}</span><b style="font-size:22px">Serve<b style="color:var(--primary-600)">hub</b></b></div>
              <p class="small muted" style="margin-top:8px">One Hub Tower, BKC, Mumbai 400051<br>GSTIN: 27ABCDE1234F1Z5 • CIN: U74999MH2021PTC000000</p></div>
            <div style="text-align:right"><b style="font-size:15px">TAX INVOICE</b><div class="small muted">${b.invoiceNo}</div><div class="small muted">${fmtDate(Date.now())}</div></div>
          </div>
          <div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:30px">
            <div><b class="small" style="text-transform:uppercase;letter-spacing:.06em">Billed to</b><div class="small" style="margin-top:6px">${esc(Store.currentUser()?.name || 'Customer')}<br>${esc(b.address)}<br>${esc(Store.currentUser()?.email || '')}</div></div>
            <div><b class="small" style="text-transform:uppercase;letter-spacing:.06em">Booking</b><div class="small" style="margin-top:6px">${b.id} • ${fmtDate(b.date)}<br>${esc(b.serviceName)}<br>Expert: ${esc(b.proName)}</div></div>
          </div>
          <div class="tbl-wrap"><div class="tbl-scroll"><table>
            <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody><tr><td><b>${esc(b.serviceName)}</b><div class="xsmall muted">${b.pack} • ${b.dur}</div></td><td>1</td><td>${money(b.sub)}</td><td><b>${money(b.sub)}</b></td></tr>
            ${b.disc ? `<tr><td>Coupon (${esc(b.coupon)})</td><td>−</td><td></td><td><b style="color:var(--success-600)">−${money(b.disc)}</b></td></tr>` : ''}
            <tr><td>GST — CGST (9%)</td><td></td><td></td><td>${money(cgst)}</td></tr>
            <tr><td>GST — SGST (9%)</td><td></td><td></td><td>${money(sgst)}</td></tr></tbody>
          </table></div></div>
          <div style="display:flex;justify-content:flex-end;margin-top:20px">
            <div style="min-width:240px"><div class="sum-row"><span class="muted">Subtotal</span><b>${money(b.sub)}</b></div><div class="sum-row"><span class="muted">Discount</span><b>−${money(b.disc || 0)}</b></div><div class="sum-row"><span class="muted">GST (18%)</span><b>${money(b.gst)}</b></div><div class="sum-total"><span>Total</span><span class="grad-text">${money(b.total)}</span></div></div>
          </div>
          <div class="small muted" style="margin-top:30px;padding-top:20px;border-top:1px dashed var(--line);display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px">
            <span>${b.payMethod.toUpperCase()} • ${b.walletUsed ? 'Wallet ₹' + b.walletUsed + ' used' : 'Paid online'} • Payment status: <b style="color:var(--success-600)">PAID</b></span>
            <span>Thank you for choosing Servehub! ❤️</span>
          </div>
        </div>
      </div>
    </section>`;
  };

  /* ---------------- MODALS: rate / call / video / chat / reschedule ---------------- */
  const rateModal = b => {
    openModal(modalShell(`Rate your experience`, `
      <div style="text-align:center;margin-bottom:18px">${avatar(b.proName, 60)}<b style="display:block;margin-top:10px">${esc(b.proName)}</b><div class="xsmall muted">${b.serviceName}</div></div>
      <div class="stars-input" id="rate-stars" style="margin-bottom:16px">${[1, 2, 3, 4, 5].map(i => `<button data-r="${i}" aria-label="${i} stars">${icon('starF', 30)}</button>`).join('')}</div>
      <div class="field"><label class="label">What went well?</label><div class="radio-pill">${['On time', 'Professional', 'Clean & tidy', 'Good value', 'Skilled'].map(t => `<label><input type="checkbox" class="rate-tag" value="${t}"><span>${t}</span></label>`).join('')}</div></div>
      <div class="field"><label class="label" for="rate-text">Share more (optional)</label><textarea class="textarea" id="rate-text" placeholder="How was your experience?"></textarea></div>
      <div class="field"><label class="label">Add photos</label><label class="upload-zone" for="rate-file" style="padding:16px"><div class="u-ic" style="width:40px;height:40px">${icon('camera', 18)}</div><b style="font-size:13px">Upload up to 3 photos</b><input type="file" id="rate-file" accept="image/*" multiple style="display:none"></label><div id="rate-imgs" style="display:flex;gap:8px;margin-top:10px"></div></div>`,
      `<button class="btn btn-primary" id="rate-submit">${icon('check', 15)} Submit review</button>`));
    let r = 0; const imgs = [];
    U.$$('#rate-stars button').forEach(btn => btn.addEventListener('click', () => { r = Number(btn.dataset.r); U.$$('#rate-stars button').forEach((b, i) => b.classList.toggle('on', i < r)); }));
    U.$('#rate-file').addEventListener('change', async e => {
      for (const f of Array.from(e.target.files).slice(0, 3)) {
        if (f.size > 1.5 * 1024 * 1024) { toast(f.name + ' is over 1.5 MB — skipped', 'warn'); continue; }
        imgs.push(await fileToDataURL(f));
      }
      U.$('#rate-imgs').innerHTML = imgs.map(src => `<img src="${src}" style="width:64px;height:64px;border-radius:12px;object-fit:cover;border:1px solid var(--line)">`).join('');
    });
    U.$('#rate-submit').addEventListener('click', async () => {
      if (!r) { toast('Please select a star rating', 'warn'); return; }
      const tags = U.$$('.rate-tag:checked').map(i => i.value);
      const text = U.$('#rate-text').value.trim();
      Store.rateBooking(b.id, r, text, tags, imgs);
      closeModal(); toast('Thanks for rating! ⭐ Bonus points added');
      // persist the review to the API when logged in (demo fallback: local only)
      if (localStorage.getItem('sh:token') && window.Customer && Customer.api) {
        const res = await Customer.api('POST', '/reviews', {
          bookingId: b.id, serviceId: b.serviceId || '', serviceName: b.serviceName || '',
          rating: r, text: text || tags.join(', '), images: imgs.slice(0, 3),
        });
        if (res && res.error) toast('Review saved locally — ' + res.error, 'warn');
        else if (res && res.review) toast('Review submitted for moderation ✅', 'success');
      }
      window.App && App.refresh();
    });
  };

  const callModal = (b, video = false) => {
    const pro = DATA.proById(b.proId) || { name: b.proName };
    openModal(modalShell(video ? 'Video call' : 'Calling…', `
      <div class="call-ui">
        ${video ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px"><div style="background:var(--surface-2);border-radius:16px;height:130px;display:grid;place-items:center;color:var(--ink-3)">${icon('video', 26)} You</div><div style="background:linear-gradient(135deg,#1E293B,#334155);border-radius:16px;height:130px;display:grid;place-items:center;color:#fff">${avatar(pro.name, 46)}</div></div>` : `<div class="call-ava">${avatar(pro.name, 0)}</div>`}
        <b style="font-size:18px">${esc(pro.name)}</b>
        <div class="call-timer">00:00</div>
        <div class="call-actions">
          <button class="call-btn call-mute" id="call-mute" aria-label="Mute">${icon('mic', 22)}</button>
          <button class="call-btn call-end" id="call-end" aria-label="End call">${icon('phone', 22)}</button>
        </div>
        <p class="xsmall muted" style="margin-top:16px">${video ? 'Secured with end-to-end encryption' : 'Voice call • encrypted'}</p>
      </div>`));
    let s = 0; const iv = setInterval(() => {
      if (!document.querySelector('#call-end')) { clearInterval(iv); return; }
      s++; const el = U.$('.call-timer'); if (el) el.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }, 1000);
    U.$('#call-end').addEventListener('click', () => { clearInterval(iv); closeModal(); toast('Call ended', 'info'); });
    U.$('#call-mute').addEventListener('click', e => { e.currentTarget.classList.toggle('on'); e.currentTarget.style.background = e.currentTarget.classList.contains('on') ? 'var(--danger)' : ''; toast(e.currentTarget.classList.contains('on') ? 'Microphone muted' : 'Microphone unmuted', 'info'); });
  };

  const chatModal = (title = 'Servehub Support') => {
    openModal(modalShell(title, `
      <div class="chat-box" style="height:380px"><div class="chat-body" id="modal-chat-body">
        <div class="msg them">Hi there! 👋 I am the Servehub assistant. How can I help you today?</div>
      </div><div class="quick-chips"><button class="quick-chip" data-q="I need to reschedule my booking">Reschedule booking</button><button class="quick-chip" data-q="Where is my refund?">Refund status</button><button class="quick-chip" data-q="Talk to a human">Talk to human</button></div>
      <div class="chat-input-row"><input class="input" id="modal-chat-input" placeholder="Type a message…"><button class="btn btn-primary" id="modal-chat-send">${icon('send', 0)}</button></div></div>`));
    const body = U.$('#modal-chat-body');
    const send = text => {
      body.insertAdjacentHTML('beforeend', `<div class="msg me">${esc(text)}<span class="m-time">now</span></div>`); body.scrollTop = body.scrollHeight;
      setTimeout(() => { body.insertAdjacentHTML('beforeend', `<div class="msg them typing"><i></i><i></i><i></i></div>`); body.scrollTop = body.scrollHeight; setTimeout(() => { U.$('.msg.typing')?.remove(); const replies = ['Sure! You can reschedule for free up to 6 hours before the slot. Which booking is this about?', 'Refunds to wallets are instant. Card refunds take 3–7 business days. Your reference is SH-pending.', 'Connecting you to a human agent… expected wait time: 1 minute 🙌']; body.insertAdjacentHTML('beforeend', `<div class="msg them">${replies[Math.floor(Math.random() * replies.length)]}<span class="m-time">now</span></div>`); body.scrollTop = body.scrollHeight; }, 1300); }, 500);
    };
    U.$$('.quick-chip').forEach(c => c.addEventListener('click', () => send(c.dataset.q)));
    U.$('#modal-chat-send').addEventListener('click', () => { const i = U.$('#modal-chat-input'); send(i.value.trim()); i.value = ''; });
    U.$('#modal-chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') { const i = U.$('#modal-chat-input'); send(i.value.trim()); i.value = ''; } });
  };

  const reschedModal = b => {
    const slots = ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];
    openModal(modalShell('Reschedule booking ' + b.id, `
      <div class="field"><label class="label">New date</label><input class="input" type="date" id="rs-date" min="${new Date().toISOString().slice(0, 10)}"></div>
      <div class="field"><label class="label">New time</label><div class="radio-pill">${slots.map(s => `<label><input type="radio" name="rs-slot" value="${s}"><span>${s}</span></label>`).join('')}</div></div>
      <p class="xsmall muted">Free rescheduling — your slot is held instantly.</p>`, `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" id="rs-save">${icon('refreshCw', 14)} Reschedule</button>`));
    U.$('#rs-save').addEventListener('click', () => {
      const d = U.$('#rs-date').value, t = U.$('input[name="rs-slot"]:checked');
      if (!d || !t) { toast('Pick a date and time', 'warn'); return; }
      b.date = new Date(d + 'T00:00:00').getTime(); b.time = t.value; Store.persist();
      Store.addNotif('calendar', 'Booking rescheduled', `Booking ${b.id} is now scheduled for ${fmtDate(b.date)} at ${b.time}.`);
      closeModal(); toast('Rescheduled successfully ✅'); window.App && App.refresh();
    });
  };

  const cancelModal = b => {
    openModal(modalShell('Cancel booking ' + b.id, `
      <div style="display:flex;gap:14px;margin-bottom:14px"><span class="e-ic" style="width:48px;height:48px;border-radius:14px;background:var(--danger-50);color:var(--danger);display:grid;place-items:center;flex:none">${icon('calendarX', 22)}</span><p class="small muted" style="padding-top:4px">You will receive a <b style="color:var(--ink)">full refund of ${money(b.total)}</b> ${b.walletUsed ? 'to your wallet' : 'to your payment method'}. This cannot be undone.</p></div>`,
      `<button class="btn btn-ghost" data-act="close-modal">Keep booking</button><button class="btn btn-danger" id="cnf-cancel">${icon('trash', 14)} Yes, cancel booking</button>`));
    U.$('#cnf-cancel').addEventListener('click', () => {
      b.status = 'cancelled'; Store.persist();
      Store.walletTx(b.walletUsed || 0, 'refund for ' + b.id);
      if (!b.walletUsed) Store.addNotif('wallet', 'Refund initiated', `₹${b.total} refund for ${b.id} will reflect in 3–7 business days.`);
      closeModal(); toast('Booking cancelled — refund processed 💸'); window.App && App.refresh();
    });
  };

  const render = (name, params) => {
    const map = {
      'book': { html: () => BookFlow(params), wire: BookWire },
      'track': { html: () => TrackPage(params), wire: TrackWire },
      'invoice': { html: () => Invoice(params), wire: null },
    };
    const r = map[name];
    return r ? { html: r.html(), wire: r.wire } : null;
  };

  return { render, clearTimers, chatModal, callModal, rateModal, reschedModal, cancelModal };
})();
