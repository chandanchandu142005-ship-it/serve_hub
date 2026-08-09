/* ============ SERVEHUB CUSTOMER DASHBOARD ============ */
window.Customer = (() => {
  const { icon, money, esc, stars, avatar, toast, openModal, closeModal, modalShell, fmtDate, fmtTime, timeAgo, statusPill } = U;
  const u = () => Store.currentUser() || {};

  /* ---- live API sync (reviews, addresses, tickets, notifications) ---- */
  const API_BASE = window.SH_API || window.SERVEHUB_API || 'http://localhost:4000/api';
  const api = (method, path, body, timeout = 6000) => {
    const token = localStorage.getItem('sh:token') || '';
    return fetch(API_BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(timeout) : undefined,
    }).then(r => r.json()).catch(() => null);
  };
  const live = { addr: false, notifs: false, tickets: false, uid: null };
  // reset sync flags whenever the signed-in user changes (prevents cross-user data leaks)
  const liveUser = () => {
    const uid = (Store.currentUser() || {}).id ?? null;
    if (uid !== live.uid) { live.addr = live.notifs = live.tickets = false; live.uid = uid; }
  };

  const normAddr = a => ({ id: a.id, label: a.label || 'Address', line: a.line || '', area: a.area || '', city: a.city || '', pin: a.pincode || '', primary: !!a.isDefault, _live: true });
  const notifIcon = t => ({ booking: 'calendar', payment: 'card', offer: 'gift', system: 'bell', support: 'headset' }[t] || 'bell');
  const normNotif = n => ({ id: n.id, icon: notifIcon(n.type), title: n.title || 'Notification', msg: n.body || '', type: n.type || 'system', time: Date.parse(n.createdAt) || Date.now(), read: !!n.read, link: n.link || '', _live: true });
  const normTicket = t => ({ id: t.id, cat: t.category || 'Other', subject: t.subject || 'Ticket', msg: (t.messages && t.messages[0] && t.messages[0].text) || '', status: t.status || 'open', createdAt: Date.parse(t.createdAt) || Date.now(), messages: t.messages || [], _live: true });

  // Pull the current user's live data into local state (falls back to demo data offline).
  const syncLive = async tab => {
    liveUser();
    if (!localStorage.getItem('sh:token')) return false; // demo mode — keep local data
    try {
      if (tab === 'addresses' && !live.addr) {
        const r = await api('GET', '/addresses');
        if (r && r.addresses) { Store.state.addr = r.addresses.map(normAddr); Store.persist(); live.addr = true; return true; }
      }
      if (tab === 'notifications' && !live.notifs) {
        const r = await api('GET', '/notifications');
        if (r && r.notifications) { Store.state.notifs = r.notifications.map(normNotif); Store.persist(); live.notifs = true; return true; }
      }
      if (tab === 'support' && !live.tickets) {
        const r = await api('GET', '/tickets');
        if (r && r.tickets) { Store.state.tickets = r.tickets.map(normTicket); Store.persist(); live.tickets = true; return true; }
      }
    } catch (e) { /* keep demo data */ }
    return false;
  };

  // Add / edit address modal — persists to the API when logged in, demo otherwise.
  const addrModal = (a = null) => {
    openModal(modalShell(a ? 'Edit address' : 'Add new address', `
      <div class="field"><label class="label">Label</label><div class="radio-pill" id="al-labels">${['Home', 'Office', 'Other'].map(l => `<label><input type="radio" name="al-label" value="${l}" ${(a ? a.label : 'Home') === l ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
      <div class="field"><label class="label" for="al-line">Address line</label><input class="input" id="al-line" value="${esc(a ? a.line : '')}" placeholder="House no, street, building"></div>
      <div class="grid g2" style="grid-template-columns:1fr 1fr;gap:12px">
        <div class="field"><label class="label" for="al-area">Area / locality</label><input class="input" id="al-area" value="${esc(a ? a.area : '')}" placeholder="e.g. Indiranagar"></div>
        <div class="field"><label class="label" for="al-city">City</label><input class="input" id="al-city" value="${esc(a ? a.city : '')}" placeholder="e.g. Bengaluru"></div>
      </div>
      <div class="field"><label class="label" for="al-pin">PIN code</label><input class="input" id="al-pin" value="${esc(a ? a.pin : '')}" placeholder="6-digit" inputmode="numeric" maxlength="6"></div>
      <label class="pack-row" style="cursor:pointer;margin-top:8px"><input type="checkbox" id="al-default" ${!a || a.primary ? 'checked' : ''} style="display:none"><span style="display:flex;gap:10px;align-items:center">${icon('check', 15)} <span><b>Set as default address</b><br><span class="pk-desc">New bookings will use this by default</span></span></span></label>`,
      `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" id="al-save">${icon('check', 15)} Save address</button>`));
    let saving = false;
    U.$('#al-save').addEventListener('click', async () => {
      if (saving) return; saving = true;
      const line = (U.$('#al-line').value || '').trim();
      if (!line) { saving = false; toast('Address line is required', 'warn'); return; }
      const payload = {
        label: (U.$('input[name="al-label"]:checked') || { value: 'Home' }).value,
        line, area: U.$('#al-area').value.trim(), city: U.$('#al-city').value.trim(),
        pincode: U.$('#al-pin').value.trim(), isDefault: !!U.$('#al-default')?.checked,
      };
      if (a && a._live) {
        const r = await api('PATCH', '/addresses/' + a.id, payload);
        if (!r || r.error) { toast((r && r.error) || 'Could not save address', 'warn'); return; }
        Store.state.addr = Store.state.addr.map(x => x.id === a.id ? normAddr(r.address) : x);
        if (payload.isDefault) Store.state.addr.forEach(x => { if (x.id !== a.id) x.primary = false; });
      } else if (!a && localStorage.getItem('sh:token')) {
        const r = await api('POST', '/addresses', payload);
        if (!r || !r.address) { toast((r && r.error) || 'Could not save address', 'warn'); return; }
        Store.state.addr.unshift(normAddr(r.address));
        if (payload.isDefault) Store.state.addr.forEach(x => { if (x.id !== r.address.id) x.primary = false; });
      } else if (a) {
        // editing demo/local address (API unreachable) — mutate in place, don't duplicate
        a.label = payload.label; a.line = line; a.area = payload.area; a.city = payload.city; a.pin = payload.pincode; a.primary = !!payload.isDefault;
        if (payload.isDefault) Store.state.addr.forEach(x => x.primary = x === a);
      } else {
        const demo = { id: 'a' + Date.now(), label: payload.label, line, area: payload.area, city: payload.city, pin: payload.pincode, primary: payload.isDefault };
        Store.state.addr.push(demo);
        if (payload.isDefault) Store.state.addr.forEach(x => x.primary = x === demo);
      }
      Store.persist(); closeModal(); toast('Address saved ✅'); window.App && App.refresh();
    });
  };

  // Support ticket thread modal — replies persist to the API when logged in.
  const ticketThread = t => {
    const msgs = t.messages || [];
    openModal(modalShell('Ticket ' + t.id, `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px;flex-wrap:wrap"><b style="font-size:15px">${esc(t.subject)}</b><span class="badge ${t.status === 'open' ? 'badge-warn' : ['resolved', 'closed'].includes(t.status) ? 'badge-success' : 'badge-primary'}">${t.status === 'open' ? 'Open' : t.status === 'resolved' ? 'Resolved' : t.status === 'closed' ? 'Closed' : 'In progress'}</span></div>
      <div class="chat-box" style="height:300px;margin-bottom:12px"><div class="chat-body" id="th-body" style="display:flex;flex-direction:column;gap:8px">
        ${msgs.map(m => `<div class="msg ${m.from === 'customer' ? 'me' : 'them'}">${esc(m.text)}<span class="m-time">${fmtTime(Date.parse(m.createdAt) || Date.now())}</span></div>`).join('') || `<div class="small muted center" style="margin:auto">No messages yet — our team will reply soon 👋</div>`}
      </div></div>
      <div class="chat-input-row"><input class="input" id="th-input" placeholder="Write a reply…" aria-label="Reply"><button class="btn btn-primary" id="th-send">${icon('send', 0)}</button></div>`,
      `<button class="btn btn-ghost" data-act="close-modal">Close</button>`));
    let sending = false;
    const send = async () => {
      if (sending) return; sending = true;
      const inp = U.$('#th-input'); const text = (inp.value || '').trim();
      if (!text) { sending = false; return; } inp.value = '';
      if (t._live && localStorage.getItem('sh:token')) {
        const r = await api('POST', '/tickets/' + t.id + '/reply', { text });
        if (!r || !r.ticket) { sending = false; toast((r && r.error) || 'Reply failed — try again', 'warn'); inp.value = text; return; }
        t.messages = r.ticket.messages || t.messages; t.status = r.ticket.status || t.status;
      } else {
        t.messages = t.messages || []; t.messages.push({ from: 'customer', text, createdAt: new Date().toISOString() });
      }
      U.$('#th-body').insertAdjacentHTML('beforeend', `<div class="msg me">${esc(text)}<span class="m-time">${fmtTime(Date.now())}</span></div>`);
      U.$('#th-body').scrollTop = U.$('#th-body').scrollHeight;
      sending = false;
      toast('Reply sent 💬');
    };
    U.$('#th-send').addEventListener('click', send);
    U.$('#th-input').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'bookings', label: 'My Bookings', icon: 'calendar' },
    { id: 'live', label: 'Live Booking', icon: 'navigation' },
    { id: 'invoices', label: 'Invoices', icon: 'file' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet' },
    { id: 'coupons', label: 'Coupons', icon: 'percent' },
    { id: 'addresses', label: 'Addresses', icon: 'pin' },
    { id: 'saved', label: 'Saved', icon: 'heart' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'support', label: 'Support', icon: 'headset' },
    { id: 'membership', label: 'Membership', icon: 'crown' },
    { id: 'rewards', label: 'Rewards', icon: 'award' },
    { id: 'referrals', label: 'Referrals', icon: 'share' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const sideNav = (active) => `
    <div class="side-user">${avatar(u().name || 'Customer', 44)}<div style="min-width:0"><b style="font-size:14px">${esc(u().name || 'Customer')}</b><div class="xsmall muted">${u().role === 'pro' ? 'Professional' : 'Customer'}</div></div></div>
    <nav class="side-nav" aria-label="Dashboard">
      <div class="side-group">Customer</div>
      ${TABS.map(t => `<a class="side-link ${active === t.id ? 'active' : ''}" href="#/dashboard/${t.id}">${icon(t.icon, 18)}<span>${t.label}</span>${t.id === 'notifications' ? `<span class="cnt green">${Store.unreadCount()}</span>` : ''}</a>`).join('')}
      <div class="side-group">More</div>
      <a class="side-link" href="#/categories">${icon('grid', 18)}<span>Book a service</span></a>
      <a class="side-link" href="#/become-pro">${icon('briefcase', 18)}<span>Become a pro</span></a>
      <a class="side-link" href="#/help">${icon('help', 18)}<span>Help center</span></a>
    </nav>
    <button class="btn btn-outline btn-sm btn-block" data-act="logout">${icon('logout', 15)} Log out</button>`;

  const mobileNav = (active) => `<nav class="mobile-dash-nav" aria-label="Dashboard sections">${TABS.map(t => `<a class="m-dash-link ${active === t.id ? 'active' : ''}" href="#/dashboard/${t.id}">${icon(t.icon, 15)} ${t.label}</a>`).join('')}</nav>`;

  const layout = (active, inner) => `
    <div class="layout"><aside class="sidebar">${sideNav(active)}</aside>
    <main class="main">${mobileNav(active)}<div class="main-head"><div><h2>${(TABS.find(t => t.id === active) || {}).label || 'Dashboard'}</h2><div class="greet">${greeting()}, ${esc(u().name?.split(' ')[0] || 'there')} 👋</div></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <a class="btn btn-primary btn-sm" href="#/categories">${icon('plus', 14)} New booking</a>
        <a class="btn btn-outline btn-sm" href="#/referrals" style="display:none">Refer &amp; earn</a>
      </div></div>
    <div id="tab-body">${inner}</div>
    <div style="margin-top:32px"><div class="side-nav" style="display:flex;gap:8px;flex-wrap:wrap;padding:14px;border:1px dashed var(--line);border-radius:14px">
      ${[['dashboard', 'Dashboard'], ['categories', 'Services'], ['become-pro', 'For professionals'], ['about', 'About'], ['contact', 'Contact'], ['help', 'Help'], ['blog', 'Blog'], ['privacy', 'Privacy']].map(l => `<a href="#/${l[0]}" class="btn btn-ghost btn-sm">${l[1]}</a>`).join('')}
    </div></div>
    </main></div>`;

  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

  const bookingRow = (b, opts = {}) => {
    const s = DATA.serviceById(b.serviceId);
    const cat = s && DATA.catBySlug(s.cat);
    const active = !['cancelled', 'rejected', 'completed', 'paid', 'rated'].includes(b.status);
    return `<div class="list-row" style="flex-wrap:wrap">
      ${cat ? `<span class="w-ic" style="width:46px;height:46px;border-radius:13px;background:${cat.g};display:grid;place-items:center;color:#fff;flex:none">${icon(cat.icon, 20)}</span>` : avatar('S', 46)}
      <div style="flex:1;min-width:180px"><b style="font-size:14px">${esc(b.serviceName)}</b>
        <div class="small muted">${b.id} • ${fmtDate(b.date)} at ${b.time} • ${esc(b.proName)}</div>
        <div style="margin-top:6px">${statusPill(b.status)}</div></div>
      <div style="text-align:right"><b style="font-size:15px">${money(b.total)}</b><div class="xsmall muted">${b.payMethod.toUpperCase()}</div></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${active ? `<a class="btn btn-soft btn-sm" href="#/track/${b.id}">${icon('navigation', 13)} Track</a>` : `<a class="btn btn-outline btn-sm" href="#/invoice/${b.id}">${icon('file', 13)} Invoice</a>`}
        ${b.status === 'paid' && !b.rating ? `<button class="btn btn-cta btn-sm" data-act="rate" data-id="${b.id}">${icon('star', 13)} Rate</button>` : ''}
        ${b.status === 'rated' || b.status === 'paid' ? `<a class="btn btn-ghost btn-sm" href="#/book/${b.serviceId}">${icon('refreshCw', 13)} Rebook</a>` : ''}
        ${['cancelled', 'rejected'].includes(b.status) ? `<a class="btn btn-ghost btn-sm" href="#/book/${b.serviceId}">${icon('refreshCw', 13)} Rebook</a>` : ''}
      </div>
    </div>`;
  };

  const walletLedger = () => {
    const rows = [];
    rows.push({ t: 'Signup bonus', d: 'Welcome to Servehub', amt: 150, ts: Date.now() - 86400000 * 90 });
    Store.state.bookings.forEach(b => {
      rows.push({ t: b.serviceName, d: 'Booking ' + b.id, amt: -b.total, ts: b.createdAt });
      if (b.cashback) rows.push({ t: 'Cashback', d: b.id + ' • ' + b.serviceName, amt: b.cashback, ts: b.createdAt + 3600000 });
    });
    Store.state.withdrawals.forEach(w => rows.push({ t: 'Withdrawal', d: w.bank, amt: -w.amount, ts: w.ts }));
    rows.push({ t: 'Referral reward', d: 'Friend joined via your link', amt: 100, ts: Date.now() - 86400000 * 5 });
    rows.push({ t: 'Gift card redeemed', d: 'SERVE-GIFT-2026', amt: 500, ts: Date.now() - 86400000 * 12 });
    return rows.sort((a, b) => b.ts - a.ts);
  };

  /* ================= TAB RENDERERS ================= */
  const tabs = {
    overview() {
      const active = Store.state.bookings.filter(b => !['cancelled', 'paid', 'rated'].includes(b.status));
      const latest = Store.state.bookings[0];
      const plan = DATA.plans.find(p => p.id === Store.state.plan);
      return `
      <div class="stat-grid">
        ${[['calendar', 'Total bookings', Store.state.bookings.length, 'linear-gradient(135deg,#2563EB,#0EA5E9)', false], ['wallet', 'Wallet balance', Store.state.wallet, 'linear-gradient(135deg,#10B981,#14B8A6)', true], ['award', 'Reward points', Store.state.points, 'linear-gradient(135deg,#F59E0B,#F97316)', false], ['heart', 'Saved items', Store.state.favs.length + Store.state.wish.length, 'linear-gradient(135deg,#8B5CF6,#EC4899)', false]].map(s => `
        <div class="card stat-card"><div class="st-top"><span class="st-ic" style="background:${s[3]}">${icon(s[0], 19)}</span><span class="badge badge-success">+${12 + s[2] % 9}%</span></div><div class="st-val" data-count="${s[2]}">0</div><div class="st-lbl">${s[1]}${s[4] ? ' • ' + money(s[2]) : ''}</div></div>`).join('')}
      </div>
      ${latest && !['cancelled', 'paid', 'rated'].includes(latest.status) ? `
      <div class="card" style="padding:22px;margin-bottom:24px;background:var(--grad-soft);border-color:var(--primary-100)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
          <div style="display:flex;gap:14px;align-items:center"><span class="w-ic" style="width:52px;height:52px;border-radius:15px;background:var(--grad);display:grid;place-items:center;color:#fff">${icon('navigation', 24)}</span>
            <div><b>${esc(latest.serviceName)} is ${statusPill(latest.status)}</b><div class="small muted">${esc(latest.proName)} • ${fmtDate(latest.date)} at ${latest.time}</div></div></div>
          <div style="display:flex;gap:10px"><a class="btn btn-cta" href="#/track/${latest.id}">${icon('navigation', 16)} Track live</a><button class="btn btn-outline" data-act="chat-popup">${icon('chat', 15)} Help</button></div>
        </div>
      </div>` : ''}
      <div class="grid" style="grid-template-columns:1.5fr 1fr;gap:24px;align-items:start">
        <div>
          <div class="sec-head" style="margin-bottom:16px"><div><h3 style="font-size:16px">Recent bookings</h3></div><a class="btn btn-ghost btn-sm" href="#/dashboard/bookings">View all</a></div>
          <div class="tbl-wrap"><div style="max-height:420px;overflow-y:auto">${Store.state.bookings.slice(0, 5).map(bookingRow).join('') || `<div class="tbl-empty"><div class="e-ic" style="width:60px;height:60px;border-radius:18px;background:var(--surface-2);display:grid;place-items:center;margin:0 auto 12px;color:var(--ink-4)">${icon('calendar', 26)}</div><b>No bookings yet</b><p class="small muted" style="margin-top:4px">Book your first service — it takes under a minute.</p><a class="btn btn-primary btn-sm" style="margin-top:14px" href="#/categories">Explore services</a></div>`}</div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:24px">
          <div class="card" style="padding:22px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><h3 style="font-size:15px">Your plan</h3><span class="badge ${Store.state.plan === 'free' ? 'badge-neutral' : 'badge-primary'}">${plan.name}</span></div>
            ${Store.state.plan === 'free' ? `<p class="small muted" style="margin-bottom:14px">Upgrade to Plus and save 5% on every service, plus priority dispatch.</p><a class="btn btn-cta btn-sm" href="#/dashboard/membership">${icon('crown', 14)} Upgrade now</a>` : `<p class="small muted">${plan.perks[0]}. ${plan.perks[1]}.</p><a class="btn btn-outline btn-sm" href="#/dashboard/membership">Manage plan</a>`}
          </div>
          <div class="card" style="padding:22px">
            <h3 style="font-size:15px;margin-bottom:12px">Quick actions</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              ${[['book', 'Book service', 'calendar', '#/categories'], ['wallet', 'Wallet', 'wallet', '#/dashboard/wallet'], ['referrals', 'Refer & earn', 'share', '#/dashboard/referrals'], ['support', 'Get support', 'headset', '#/dashboard/support']].map(q => `<a class="btn btn-soft btn-sm" href="${q[3]}">${icon(q[2], 14)} ${q[1]}</a>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
    },
    bookings() {
      const all = Store.state.bookings;
      return `
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap" id="bk-filter">
        ${[['all', 'All', all.length], ['active', 'Active', all.filter(b => !['cancelled', 'paid', 'rated'].includes(b.status)).length], ['done', 'Completed', all.filter(b => ['paid', 'rated'].includes(b.status)).length], ['cancelled', 'Cancelled', all.filter(b => b.status === 'cancelled').length]].map(f => `<button class="f-chip on" data-f="${f[0]}" data-count="${f[3]}">${f[1]} <b>${f[3]}</b></button>`).join('')}
      </div>
      <div class="tbl-wrap"><div id="bk-list">${all.map(bookingRow).join('') || empty('calendar', 'No bookings yet', 'Book a service to see it here.')}</div></div>`;
    },
    live() {
      const active = Store.state.bookings.filter(b => !['cancelled', 'paid', 'rated'].includes(b.status));
      if (!active.length) return `<div class="tbl-wrap"><div class="tbl-empty"><div class="e-ic" style="width:70px;height:70px;border-radius:20px;background:var(--surface-2);display:grid;place-items:center;margin:0 auto 14px;color:var(--ink-4)">${icon('navigation', 30)}</div><b>No live bookings right now</b><p class="small muted" style="margin:6px 0 16px">Your active bookings will appear here with live tracking.</p><a class="btn btn-primary" href="#/categories">Book a service</a></div></div>`;
      return `<div class="grid g2" style="grid-template-columns:1fr 1fr">${active.map(b => `
        <div class="card" style="padding:22px" data-live-bk="${b.id}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><b>${esc(b.serviceName)}</b><span data-live-pill>${statusPill(b.status)}</span></div>
          <div class="small muted" style="margin-bottom:14px">${b.id} • ${fmtDate(b.date)} at ${b.time}</div>
          ${U.genMap()}
          <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
            <a class="btn btn-cta btn-sm" style="flex:1" href="#/track/${b.id}">${icon('navigation', 14)} Track</a>
            <button class="btn btn-outline btn-sm" data-act="call" data-id="${b.id}">${icon('phone', 14)}</button>
            <button class="btn btn-outline btn-sm" data-act="video" data-id="${b.id}">${icon('video', 14)}</button>
          </div>
        </div>`).join('')}</div>`;
    },
    invoices() {
      const paid = Store.state.bookings.filter(b => ['paid', 'rated'].includes(b.status));
      return `<div class="tbl-wrap"><div class="tbl-scroll"><table><thead><tr><th>Invoice</th><th>Service</th><th>Date</th><th>Amount</th><th>GST</th><th></th></tr></thead><tbody>
      ${paid.map(b => `<tr><td><b>${b.invoiceNo}</b><div class="xsmall muted">${b.id}</div></td><td>${esc(b.serviceName)}<div class="xsmall muted">${esc(b.proName)}</div></td><td>${fmtDate(b.date)}</td><td><b>${money(b.total)}</b></td><td>${money(b.gst)}</td><td><div class="row-actions"><a class="mini-btn blue" href="#/invoice/${b.id}" title="View">${icon('eye', 15)}</a><button class="mini-btn" onclick="window.print()" title="Download">${icon('download', 15)}</button></div></td></tr>`).join('') || `<tr><td colspan="6"><div class="tbl-empty">${icon('file', 28)} No invoices yet — completed bookings generate GST invoices instantly.</div></td></tr>`}
      </tbody></table></div></div>`;
    },
    wallet() {
      const ledger = walletLedger();
      const bal = Store.state.wallet;
      return `
      <div class="card" style="padding:28px;margin-bottom:24px;background:linear-gradient(135deg,#0F172A,#1E3A8A);color:#fff;border:none;position:relative;overflow:hidden">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.4),transparent 70%)"></div>
        <div class="small" style="opacity:.8;display:flex;gap:8px;align-items:center">${icon('wallet', 15)} Servehub Wallet</div>
        <div style="font-size:44px;font-weight:900;margin:10px 0 4px">${money(bal)}</div>
        <div class="small" style="opacity:.8">Available balance • ${money(bal * 0.6)} used this month</div>
        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
          <button class="btn btn-white btn-sm" style="background:#fff;color:#1E3A8A" data-act="add-money">${icon('plus', 14)} Add money</button>
          <button class="btn btn-sm" style="background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.3)" data-act="gift-card">${icon('gift', 14)} Redeem gift card</button>
          <button class="btn btn-sm" style="background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.3)" data-act="withdraw-wallet">${icon('download', 14)} Withdraw</button>
        </div>
      </div>
      <div class="grid" style="grid-template-columns:1.5fr 1fr;gap:24px;align-items:start">
        <div class="tbl-wrap"><div style="max-height:440px;overflow-y:auto"><div class="tbl-tools" style="border-bottom:none;padding-bottom:0"><b style="font-size:14px">Transaction history</b></div>
        ${ledger.map(r => `<div class="list-row"><span class="w-ic" style="width:40px;height:40px;border-radius:12px;background:${r.amt >= 0 ? 'var(--success-50)' : 'var(--surface-2)'};color:${r.amt >= 0 ? 'var(--success-600)' : 'var(--ink-3)'};display:grid;place-items:center">${icon(r.amt >= 0 ? 'plus' : 'minus', 16)}</span><div style="flex:1;min-width:0"><b style="font-size:13.5px">${esc(r.t)}</b><div class="xsmall muted">${esc(r.d)} • ${timeAgo(r.ts)}</div></div><b style="color:${r.amt >= 0 ? 'var(--success-600)' : 'var(--ink)'}">${r.amt >= 0 ? '+' : '−'}${money(Math.abs(r.amt))}</b></div>`).join('')}
        </div></div>
        <div style="display:flex;flex-direction:column;gap:18px">
          <div class="card" style="padding:22px"><h3 style="font-size:15px;margin-bottom:12px">Your coupons</h3>${DATA.coupons.slice(0, 3).map(c => `<div class="list-row" style="padding:10px 0"><span class="pm-ic" style="width:38px;height:38px;border-radius:11px;background:var(--primary-50);color:var(--primary-600);display:grid;place-items:center">${icon('percent', 16)}</span><div style="flex:1;min-width:0"><b style="font-size:13px">${c.code}</b><div class="xsmall muted">${c.desc}</div></div><a class="btn btn-soft btn-sm" href="#/categories">Use</a></div>`).join('')}<a class="small" href="#/dashboard/coupons" style="color:var(--primary-600);font-weight:700">View all coupons →</a></div>
          <div class="card" style="padding:22px"><h3 style="font-size:15px;margin-bottom:10px">Gift cards</h3><p class="small muted" style="margin-bottom:12px">Send a Servehub gift card to friends & family.</p><button class="btn btn-outline btn-sm" data-act="gift-card">${icon('gift', 14)} Buy a gift card</button></div>
        </div>
      </div>`;
    },
    coupons() {
      return `
      <div class="grid g2" style="grid-template-columns:1fr 1fr">
        <div class="card" style="padding:26px;background:var(--grad-soft);border-color:var(--primary-100)">
          <h3 style="font-size:16px;margin-bottom:8px">Redeem a coupon</h3>
          <p class="small muted" style="margin-bottom:16px">Enter a promo code to unlock the discount — it applies automatically at checkout.</p>
          <div style="display:flex;gap:8px"><input class="input" id="cp-input" placeholder="Enter code e.g. SERVE10"><button class="btn btn-primary" id="cp-apply">Apply</button></div>
          <div id="cp-msg" class="small" style="margin-top:10px"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">${DATA.coupons.map(c => `
          <div class="card card-hover" style="padding:18px;display:flex;align-items:center;gap:14px">
            <span class="pm-ic" style="width:48px;height:48px;border-radius:13px;background:${Store.state.coupons.includes(c.code) ? 'var(--success-50)' : 'var(--primary-50)'};color:${Store.state.coupons.includes(c.code) ? 'var(--success-600)' : 'var(--primary-600)'};display:grid;place-items:center">${icon('percent', 20)}</span>
            <div style="flex:1;min-width:0"><b style="letter-spacing:.04em">${c.code}</b><div class="small muted">${c.desc}</div><div class="xsmall muted">Min. order ${money(c.min)} • Valid till ${c.valid}</div></div>
            <button class="btn ${Store.state.coupons.includes(c.code) ? 'btn-success' : 'btn-soft'} btn-sm" data-act="unlock-coupon" data-code="${c.code}">${Store.state.coupons.includes(c.code) ? icon('check', 13) + ' Unlocked' : 'Unlock'}</button>
          </div>`).join('')}</div>
      </div>`;
    },
    addresses() {
      return `<div class="grid g2" style="grid-template-columns:1fr 1fr">
        ${Store.state.addr.map(a => `<div class="card" style="padding:22px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><b>${icon('pin', 15)} ${esc(a.label)}</b>${a.primary ? ' <span class="badge badge-primary">Default</span>' : ''}</div><div class="row-actions"><button class="mini-btn blue" data-act="edit-addr" data-id="${a.id}" title="Edit">${icon('edit', 14)}</button><button class="mini-btn no" data-act="del-addr" data-id="${a.id}" title="Delete">${icon('trash', 14)}</button></div></div>
          <p class="small muted" style="margin:10px 0 16px">${esc(a.line)}<br>${esc(a.area)}, ${esc(a.city)} — ${a.pin}</p>
          ${!a.primary ? `<button class="btn btn-soft btn-sm" data-act="set-primary" data-id="${a.id}">${icon('check', 13)} Set as default</button>` : '<span class="badge badge-success">Default address</span>'}</div>`).join('')}
        <div class="card" style="padding:22px;border-style:dashed;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer" data-act="add-addr"><div class="e-ic" style="width:56px;height:56px;border-radius:16px;background:var(--primary-50);color:var(--primary-600);display:grid;place-items:center">${icon('plus', 24)}</div><b style="margin-top:10px">Add new address</b><p class="xsmall muted">Home, office, or a friend's place</p></div>
      </div>`;
    },
    saved() {
      const favs = Store.state.favs.map(DATA.proById).filter(Boolean);
      const wish = Store.state.wish.map(DATA.serviceById).filter(Boolean);
      return `
      <div class="tabs" data-tabs>
        ${[['favs', 'Favorite professionals', favs.length], ['wish', 'Wishlist', wish.length]].map((t, i) => `<button class="tab-btn ${i === 0 ? 'active' : ''}" data-tab="${t[0]}">${t[1]} (${t[2]})</button>`).join('')}
      </div>
      <div data-panel="favs">${favs.length ? `<div class="grid g3" style="grid-template-columns:repeat(3,1fr)">${favs.map(Public.proCard || '').join('')}</div>` : `<div class="tbl-wrap"><div class="tbl-empty"><div class="e-ic" style="width:64px;height:64px;border-radius:18px;background:var(--surface-2);display:grid;place-items:center;margin:0 auto 12px;color:var(--ink-4)">${icon('heart', 28)}</div><b>No favorite professionals yet</b><p class="small muted">Tap the heart on any professional to save them here.</p></div></div>`}</div>
      <div data-panel="wish" hidden>${wish.length ? `<div class="grid g3" style="grid-template-columns:repeat(3,1fr)">${wish.map(s => svcCardSmall(s)).join('')}</div>` : `<div class="tbl-wrap"><div class="tbl-empty"><div class="e-ic" style="width:64px;height:64px;border-radius:18px;background:var(--surface-2);display:grid;place-items:center;margin:0 auto 12px;color:var(--ink-4)">${icon('heart', 28)}</div><b>Your wishlist is empty</b><p class="small muted">Save services you love and book them anytime.</p><a class="btn btn-primary btn-sm" style="margin-top:12px" href="#/categories">Browse services</a></div></div>`}</div>`;
    },
    notifications() {
      return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><span class="small muted">${Store.state.notifs.length} notifications • ${Store.unreadCount()} unread</span><button class="btn btn-ghost btn-sm" data-act="read-all">${icon('check', 14)} Mark all as read</button></div>
      <div class="tbl-wrap">${Store.state.notifs.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" data-act="notif-open" data-id="${n.id}" style="cursor:pointer" role="button" tabindex="0"><span class="n-ic" style="background:${iconBg(n.icon)};color:#fff">${icon(n.icon, 18)}</span>
        <div style="flex:1;min-width:0"><b style="font-size:13.5px">${esc(n.title)}</b><p class="small muted">${esc(n.msg)}</p><div class="n-time">${timeAgo(n.time)}</div></div>
        ${!n.read ? '<span class="status-dot dot-blue" style="margin-top:8px"></span>' : ''}</div>`).join('') || `<div class="tbl-empty"><div class="e-ic" style="width:64px;height:64px;border-radius:18px;background:var(--surface-2);display:grid;place-items:center;margin:0 auto 12px;color:var(--ink-4)">${icon('bell', 28)}</div><b>All caught up!</b><p class="small muted">Notifications about your bookings & offers appear here.</p></div>`}</div>`;
    },
    support() {
      return `
      <div class="grid" style="grid-template-columns:1.2fr .8fr;gap:24px;align-items:start">
        <div class="tbl-wrap"><div class="tbl-tools" style="justify-content:space-between"><b style="font-size:14px">My tickets</b><span class="badge badge-success">Avg. response 2 hrs</span></div>
        ${Store.state.tickets.map(t => `<div class="list-row" data-act="ticket-thread" data-id="${t.id}" style="cursor:pointer" title="Open thread"><span class="n-ic" style="width:40px;height:40px;border-radius:12px;background:var(--primary-50);color:var(--primary-600);display:grid;place-items:center">${icon(t.cat === 'refund' || (t.cat || '').toLowerCase().includes('payment') ? 'wallet' : 'headset', 17)}</span><div style="flex:1;min-width:0"><b style="font-size:13.5px">${esc(t.subject)}</b><div class="xsmall muted">${t.id} • ${timeAgo(t.createdAt)} • ${esc(t.cat)}${(t.messages || []).length ? ' • ' + t.messages.length + ' msg' : ''}</div></div><span class="badge ${t.status === 'open' ? 'badge-warn' : ['resolved', 'closed'].includes(t.status) ? 'badge-success' : 'badge-primary'}">${t.status === 'open' ? 'Open' : t.status === 'resolved' ? 'Resolved' : t.status === 'closed' ? 'Closed' : 'In progress'}</span>${icon('chevronRight', 15)}</div>`).join('') || `<div class="tbl-empty"><div class="e-ic" style="width:60px;height:60px;border-radius:18px;background:var(--surface-2);display:grid;place-items:center;margin:0 auto 12px;color:var(--ink-4)">${icon('headset', 26)}</div><b>No tickets yet</b><p class="small muted">Raise a ticket and our team will jump in.</p></div>`}</div>
        <div class="card" style="padding:24px">
          <h3 style="font-size:16px;margin-bottom:14px">Raise a ticket</h3>
          <div class="field"><label class="label">Category</label><select class="select" id="tk-cat"><option>Booking issue</option><option>Payment / refund</option><option>Professional feedback</option><option>App & account</option><option>Other</option></select></div>
          <div class="field"><label class="label" for="tk-sub">Subject</label><input class="input" id="tk-sub" placeholder="Briefly describe the issue"></div>
          <div class="field"><label class="label" for="tk-msg">Details</label><textarea class="textarea" id="tk-msg" placeholder="Tell us what happened…"></textarea></div>
          <button class="btn btn-primary btn-block" data-act="new-ticket">${icon('plus', 15)} Create ticket</button>
          <button class="btn btn-outline btn-block" style="margin-top:8px" data-act="chat-popup">${icon('chat', 15)} Chat with support</button>
        </div>
      </div>`;
    },
    membership() {
      return `
      <div class="grid g3" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">${DATA.plans.map(p => `
        <div class="card plan-card ${p.featured ? 'featured' : ''}">
          ${p.featured ? '<span class="pl-ribbon">Most popular</span>' : ''}
          <b style="font-size:15px">${p.name}</b>
          <div class="plan-price">${p.price === 0 ? 'Free' : money(p.price)}<small>/${p.per}</small></div>
          <div style="display:flex;flex-direction:column;gap:10px;flex:1">${p.perks.map(k => `<div class="plan-perk">${icon('checkCircle', 16)}<span>${k}</span></div>`).join('')}</div>
          <button class="btn ${p.id === Store.state.plan ? 'btn-success' : p.featured ? 'btn-cta' : 'btn-outline'} btn-block" data-act="subscribe" data-plan="${p.id}">${p.id === Store.state.plan ? icon('check', 14) + ' Current plan' : 'Choose ' + p.name}</button>
        </div>`).join('')}</div>
      <div class="card glass" style="padding:22px;display:flex;gap:14px;align-items:center"><span class="n-ic" style="width:44px;height:44px;border-radius:13px;background:var(--success-50);color:var(--success-600);display:grid;place-items:center">${icon('info', 20)}</span><p class="small muted">Memberships auto-renew monthly. Cancel anytime from Settings — unused benefits are pro-rated and refunded. Pro members also unlock ${money(500)} monthly service credit.</p></div>`;
    },
    rewards() {
      const ledger = [
        { t: 'Booking cashback (SH202401)', pts: 10, ts: Date.now() - 86400000 * 3 },
        { t: '5★ rating bonus', pts: 15, ts: Date.now() - 86400000 * 3 },
        { t: 'Referral — friend joined', pts: 50, ts: Date.now() - 86400000 * 9 },
        { t: 'Welcome bonus', pts: 100, ts: Date.now() - 86400000 * 90 },
        { t: 'Redeemed ₹100 voucher', pts: -200, ts: Date.now() - 86400000 * 20 },
      ];
      return `
      <div class="card" style="padding:28px;margin-bottom:24px;background:linear-gradient(135deg,#7C3AED,#EC4899);color:#fff;border:none;position:relative;overflow:hidden">
        <div style="position:absolute;top:-50px;right:-30px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.25),transparent 70%)"></div>
        <div class="small" style="opacity:.85;display:flex;gap:8px;align-items:center">${icon('award', 15)} Servehub Rewards</div>
        <div style="font-size:44px;font-weight:900;margin:10px 0 4px">${Store.state.points.toLocaleString('en-IN')} <span style="font-size:18px">points</span></div>
        <div class="small" style="opacity:.85">≈ ${money(Math.floor(Store.state.points / 2))} in booking credit</div>
        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap"><button class="btn btn-sm" style="background:#fff;color:#7C3AED" data-act="redeem-pts">${icon('gift', 14)} Redeem points</button></div>
      </div>
      <div class="grid" style="grid-template-columns:1.4fr .6fr;gap:24px;align-items:start">
        <div class="tbl-wrap"><div class="tbl-tools"><b style="font-size:14px">Points ledger</b></div>${ledger.map(r => `<div class="list-row"><span class="n-ic" style="width:38px;height:38px;border-radius:11px;background:${r.pts >= 0 ? 'var(--success-50)' : 'var(--surface-2)'};color:${r.pts >= 0 ? 'var(--success-600)' : 'var(--ink-3)'};display:grid;place-items:center">${icon(r.pts >= 0 ? 'plus' : 'minus', 15)}</span><div style="flex:1"><b style="font-size:13.5px">${r.t}</b><div class="xsmall muted">${timeAgo(r.ts)}</div></div><b style="color:${r.pts >= 0 ? 'var(--success-600)' : 'var(--ink)'}">${r.pts >= 0 ? '+' : ''}${r.pts}</b></div>`).join('')}</div>
        <div class="card" style="padding:22px"><h3 style="font-size:15px;margin-bottom:12px">How to earn</h3>${[['Book services', '+10 pts per booking'], ['Rate 4★ or more', '+15 pts'], ['Refer a friend', '+50 pts'], ['Complete profile', '+25 pts']].map(e => `<div class="sum-row"><span class="muted">${e[0]}</span><b style="color:var(--success-600)">${e[1]}</b></div>`).join('')}</div>
      </div>`;
    },
    referrals() {
      const code = 'SERVE-' + (u().name ? u().name.split(' ')[0].toUpperCase() : 'FRIEND');
      return `
      <div class="card" style="padding:30px;margin-bottom:24px;background:var(--grad-soft);border-color:var(--primary-100)">
        <div style="display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;align-items:center">
          <div><span class="kicker" style="margin-bottom:10px">${icon('share', 13)}Refer & earn</span><h3 style="font-size:22px">Give ₹100, get ₹100.</h3><p class="small muted" style="margin-top:6px">When a friend books their first service with your code, you both get ₹100 wallet credit. Unlimited referrals.</p>
          <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
            <div style="display:flex;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden"><input class="input" style="border:none;box-shadow:none;min-width:200px" value="${code}" readonly id="ref-code"><button class="btn btn-cta" data-act="copy-ref" data-code="${code}">${icon('copy', 14)} Copy</button></div>
            <button class="btn btn-outline" data-act="share-ref" data-code="${code}">${icon('share', 15)} Share on WhatsApp</button>
          </div></div>
          <div style="text-align:center"><div style="font-size:40px;font-weight:900;color:var(--success-600)">${money(1400)}</div><div class="small muted">earned till now</div><div class="badge badge-success" style="margin-top:8px">14 friends referred</div></div>
        </div>
      </div>
      <div class="grid g3" style="grid-template-columns:repeat(3,1fr)">
        ${[['₹100', 'Your credit', 'when your friend books'], ['₹100', 'Their credit', 'as a welcome bonus'], ['₹50', 'Bonus points', 'for every 5th referral']].map(c => `<div class="card" style="padding:22px;text-align:center"><div style="font-size:26px;font-weight:900;color:var(--primary-600)">${c[0]}</div><b style="display:block;margin-top:6px;font-size:14px">${c[1]}</b><div class="xsmall muted">${c[2]}</div></div>`).join('')}
      </div>`;
    },
    settings() {
      const st = Store.state.settings;
      return `
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:24px;align-items:start">
        <div class="card" style="padding:24px">
          <h3 style="font-size:15px;margin-bottom:16px">Profile</h3>
          <div style="display:flex;gap:16px;align-items:center;margin-bottom:18px">${avatar(u().name || 'Customer', 56)}<div><b>${esc(u().name || 'Customer')}</b><div class="small muted">${esc(u().email || 'you@example.com')}</div><div class="small muted">${esc(u().phone || '+91 98765 43210')}</div></div></div>
          <div class="grid g2" style="grid-template-columns:1fr 1fr;gap:12px">
            <div class="field"><label class="label" for="st-name">Full name</label><input class="input" id="st-name" value="${esc(u().name || '')}"></div>
            <div class="field"><label class="label" for="st-phone">Mobile</label><input class="input" id="st-phone" value="${esc(u().phone || '')}"></div>
          </div>
          <div class="field"><label class="label" for="st-email">Email</label><input class="input" id="st-email" value="${esc(u().email || '')}"></div>
          <button class="btn btn-primary" data-act="save-profile">${icon('save', 14)} Save changes</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:24px">
          <div class="card" style="padding:24px">
            <h3 style="font-size:15px;margin-bottom:8px">Notifications</h3><p class="small muted" style="margin-bottom:14px">Choose how we reach you about bookings & offers.</p>
            ${[['push', 'Push notifications', 'Booking updates & live tracking alerts'], ['email', 'Email', 'Invoices, receipts & summaries'], ['sms', 'SMS', 'Critical booking alerts only'], ['whatsapp', 'WhatsApp', 'Chats, offers & reminders']].map(n => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--line-2)"><div><b style="font-size:13.5px">${n[1]}</b><div class="xsmall muted">${n[2]}</div></div><label class="switch"><input type="checkbox" data-notif="${n[0]}" ${st[n[0]] ? 'checked' : ''}><span class="trk"></span></label></div>`).join('')}
          </div>
          <div class="card" style="padding:24px">
            <h3 style="font-size:15px;margin-bottom:14px">Appearance & language</h3>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0"><div><b style="font-size:13.5px">Dark mode</b><div class="xsmall muted">Easier on the eyes at night</div></div><label class="switch"><input type="checkbox" data-act="theme-check"><span class="trk"></span></label></div>
            <div class="field" style="margin-top:8px"><label class="label">Language</label><select class="select" data-act="lang-select"><option value="en" ${Store.state.lang === 'en' ? 'selected' : ''}>English</option><option value="hi" ${Store.state.lang === 'hi' ? 'selected' : ''}>हिन्दी</option></select></div>
          </div>
          <div class="card" style="padding:24px;border-color:var(--danger-100)">
            <h3 style="font-size:15px;margin-bottom:8px;color:var(--danger-600)">Danger zone</h3>
            <p class="small muted" style="margin-bottom:14px">Log out of your account on this device, or delete your data permanently.</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-outline btn-sm" data-act="logout">${icon('logout', 14)} Log out</button><button class="btn btn-danger btn-sm" data-act="delete-account">${icon('trash', 14)} Delete account</button></div>
          </div>
        </div>
      </div>`;
    },
  };

  const iconBg = n => ({ wallet: 'linear-gradient(135deg,#10B981,#14B8A6)', calendar: 'linear-gradient(135deg,#2563EB,#0EA5E9)', user: 'linear-gradient(135deg,#6366F1,#8B5CF6)', navigation: 'linear-gradient(135deg,#F59E0B,#F97316)', card: 'linear-gradient(135deg,#8B5CF6,#EC4899)', star: 'linear-gradient(135deg,#F59E0B,#FBBF24)', gift: 'linear-gradient(135deg,#EC4899,#F43F5E)', headset: 'linear-gradient(135deg,#0EA5E9,#06B6D4)', briefcase: 'linear-gradient(135deg,#64748B,#0EA5E9)', bell: 'linear-gradient(135deg,#F43F5E,#EC4899)' }[n] || 'linear-gradient(135deg,#2563EB,#0EA5E9)');

  const empty = (ic, title, sub) => `<div class="tbl-empty"><div class="e-ic" style="width:64px;height:64px;border-radius:18px;background:var(--surface-2);display:grid;place-items:center;margin:0 auto 12px;color:var(--ink-4)">${icon(ic, 26)}</div><b>${title}</b><p class="small muted" style="margin-top:4px">${sub}</p></div>`;

  const svcCardSmall = s => `
    <div class="card card-hover svc-card"><div class="svc-art"><div class="art-bg" style="background:${s.g}">${icon(s.icon, 40)}</div><button class="art-heart on" data-act="wish" data-id="${s.id}" style="color:var(--danger)">${icon('heart', 15)}</button></div>
    <div class="svc-body"><h3 style="font-size:14.5px">${esc(s.name)}</h3><div class="svc-foot" style="border:none;padding-top:0"><span class="svc-price" style="font-size:14px">${money(s.price)}</span><a class="btn btn-soft btn-sm" href="#/service/${s.id}">View</a></div></div></div>`;

  const render = (params) => {
    const tab = params.tab || 'overview';
    if (!Store.isLoggedIn()) { location.hash = '#/login'; return { html: '', wire: null }; }
    if (u().role === 'pro') { location.hash = '#/pro/overview'; return { html: '', wire: null }; }
    if (!tabs[tab]) return { html: layout('overview', tabs.overview()), wire: () => wireCommon('overview') };
    const html = layout(tab, tabs[tab]());
    const wire = () => wireCommon(tab);
    return { html, wire };
  };

  const wireCommon = tab => {
    // counters on overview
    U.$$('[data-count]').forEach(el => U.countUp(el, Number(el.dataset.count)));
    U.observeReveals();
    // live-sync addresses / notifications / support from the API (demo fallback)
    if (['addresses', 'notifications', 'support'].includes(tab)) {
      syncLive(tab).then(ok => { if (ok) { window.App && App.refresh(); toast({ addresses: 'Saved addresses synced 📍', notifications: 'Notifications synced 🔔', support: 'Tickets synced 🎧' }[tab], 'success'); } });
    }
    // bookings filter
    const fwrap = U.$('#bk-filter');
    if (fwrap) U.$$('[data-f]', fwrap).forEach(btn => btn.addEventListener('click', () => {
      U.$$('[data-f]', fwrap).forEach(b => b.classList.toggle('on', b === btn));
      const f = btn.dataset.f;
      const list = Store.state.bookings.filter(b => f === 'all' || (f === 'active' ? !['cancelled', 'paid', 'rated'].includes(b.status) : f === 'done' ? ['paid', 'rated'].includes(b.status) : b.status === 'cancelled'));
      U.$('#bk-list').innerHTML = list.map(bookingRow).join('') || empty('calendar', 'Nothing here', 'No bookings match this filter.');
    }));
    // live tab auto refresh
    if (tab === 'live' && U.$('[data-live-bk]')) {
      const iv = setInterval(() => {
        U.$$('[data-live-bk]').forEach(card => {
          const b = Store.bookingById(card.dataset.liveBk);
          if (!b) return;
          U.$('[data-live-pill]', card).innerHTML = statusPill(b.status);
          if (['cancelled', 'paid', 'rated'].includes(b.status)) { card.style.opacity = .5; }
        });
      }, 4000);
      window.__custLive = iv;
    }
  };

  return { render, bookingRow, walletLedger, api, syncLive, addrModal, ticketThread, normTicket, normAddr, normNotif };
})();
