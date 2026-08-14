/* ============ SERVEHUB ADMIN PANEL ============ */
window.Admin = (() => {
  const { icon, money, esc, stars, avatar, toast, openModal, closeModal, modalShell, fmtDate, timeAgo, statusPill, areaChart, barChart, donut, animateBars } = U;

  /* ---------------- live API helper (JWT) ----------------
     Talks to the Express backend using the token captured at login.
     Returns null when the API is unreachable (tabs fall back to demo). */
  const API_BASE = window.SH_API || window.SERVEHUB_API || 'http://localhost:4000/api';
  const api = (method, path, body, timeout = 5000) => {
    const token = localStorage.getItem('sh:token') || '';
    return fetch(API_BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(timeout) : undefined,
    }).then(r => r.json()).catch(() => null);
  };
  const apiGet = (p, t) => api('GET', p, null, t);
  const apiPost = (p, b) => api('POST', p, b);
  const apiPatch = (p, b) => api('PATCH', p, b);
  const apiDelete = p => api('DELETE', p);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: 'grid', grp: 'Main' },
    { id: 'monitor', label: 'Live Booking Monitor', icon: 'navigation', grp: 'Main' },
    { id: 'customers', label: 'Customers', icon: 'users', grp: 'Manage' },
    { id: 'professionals', label: 'Professionals', icon: 'briefcase', grp: 'Manage' },
    { id: 'services', label: 'Services', icon: 'wrench', grp: 'Manage' },
    { id: 'categories', label: 'Categories', icon: 'grid', grp: 'Manage' },
    { id: 'cities', label: 'Cities & Areas', icon: 'pin', grp: 'Manage' },
    { id: 'coupons', label: 'Coupons', icon: 'percent', grp: 'Manage' },
    { id: 'bookings', label: 'Bookings', icon: 'calendar', grp: 'Manage' },
    { id: 'payments', label: 'Payments', icon: 'card', grp: 'Finance' },
    { id: 'refunds', label: 'Refunds', icon: 'refreshCw', grp: 'Finance' },
    { id: 'commissions', label: 'Commissions', icon: 'percent', grp: 'Finance' },
    { id: 'plans', label: 'Membership Plans', icon: 'crown', grp: 'Finance' },
    { id: 'giftcards', label: 'Gift Cards', icon: 'gift', grp: 'Finance' },
    { id: 'analytics', label: 'Analytics', icon: 'barChart', grp: 'Insights' },
    { id: 'reports', label: 'Reports', icon: 'file', grp: 'Insights' },
    { id: 'cms', label: 'CMS', icon: 'edit', grp: 'Content' },
    { id: 'blog', label: 'Blog', icon: 'book', grp: 'Content' },
    { id: 'banners', label: 'Banners', icon: 'camera', grp: 'Content' },
    { id: 'tickets', label: 'Support Tickets', icon: 'headset', grp: 'Support' },
    { id: 'reviews', label: 'Reviews', icon: 'star', grp: 'Support' },
    { id: 'referrals', label: 'Referral System', icon: 'share', grp: 'Support' },
    { id: 'tax', label: 'Tax Settings', icon: 'coins', grp: 'Settings' },
    { id: 'roles', label: 'Roles & Permissions', icon: 'shield', grp: 'Settings' },
    { id: 'notifications', label: 'Broadcast', icon: 'bell', grp: 'Settings' },
  ];

  const sideNav = active => `
    <div class="side-user">${avatar('Servehub Admin', 44, 1)}<div><b style="font-size:14px">Admin</b><div class="xsmall muted">Super admin</div></div></div>
    <nav class="side-nav">${['Main', 'Manage', 'Finance', 'Insights', 'Content', 'Support', 'Settings'].map(g => `
      <div class="side-group">${g}</div>${TABS.filter(t => t.grp === g).map(t => `<a class="side-link ${active === t.id ? 'active' : ''}" href="#/admin/${t.id}">${icon(t.icon, 18)}<span>${t.label}</span>${t.id === 'monitor' ? `<span class="cnt green" id="live-count">${Store.state.bookings.filter(b => !['cancelled', 'paid', 'rated'].includes(b.status)).length}</span>` : ''}</a>`).join('')}`).join('')}
    </nav>
    <a class="btn btn-outline btn-sm btn-block" href="#/dashboard/overview">${icon('user', 15)} Customer view</a>
    <button class="btn btn-outline btn-sm btn-block" style="margin-top:8px" data-act="logout">${icon('logout', 15)} Log out</button>`;

  const mobileNav = (active) => `<nav class="mobile-dash-nav" aria-label="Admin sections">${TABS.map(t => `<a class="m-dash-link ${active === t.id ? 'active' : ''}" href="#/admin/${t.id}">${icon(t.icon, 15)} ${t.label}</a>`).join('')}</nav>`;

  const layout = (active, inner) => `
    <div class="layout"><aside class="sidebar">${sideNav(active)}</aside>
    <main class="main">${mobileNav(active)}<div class="main-head"><div><h2>${(TABS.find(t => t.id === active) || {}).label}</h2><div class="greet">Servehub Admin • ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
      <span class="badge badge-success"><span class="status-dot dot-green"></span>All systems operational</span></div>
    <div id="tab-body">${inner}</div></main></div>`;

  /* ---------- generic table ---------- */
  const table = (cols, rows, { search = true, empty = 'No data found', right = '' } = {}) => `
    <div class="tbl-wrap">
      <div class="tbl-tools">${search ? `<div class="input-group grow">${icon('search', 16)}<input class="input tbl-search" placeholder="Search ${(cols[0] || '').toLowerCase()}…" aria-label="Search table"></div>` : ''}${right}</div>
      <div class="tbl-scroll"><table><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}<th></th></tr></thead>
      <tbody>${rows.map(r => `<tr>${r.cells.map(c => `<td>${c}</td>`).join('')}<td><div class="row-actions">${(r.actions || []).join('')}</div></td></tr>`).join('') || `<tr><td colspan="${cols.length + 1}"><div class="tbl-empty">${empty}</div></td></tr>`}</tbody></table></div>
      <div class="tbl-tools" style="justify-content:space-between"><span class="small muted">Showing ${rows.length} of ${rows.length}</span><div style="display:flex;gap:6px"><button class="mini-btn" disabled>${icon('arrowLeft', 13)}</button><button class="mini-btn" disabled>${icon('arrowRight', 13)}</button></div></div>
    </div>`;

  const wireTableSearch = root => U.$$('.tbl-search', root).forEach(inp => inp.addEventListener('input', () => {
    const q = inp.value.toLowerCase();
    U.$$('tbody tr', inp.closest('.tbl-wrap')).forEach(tr => tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none');
  }));

  const kpi = (label, val, delta, ic, g, up = true) => `
    <div class="card stat-card"><div class="st-top"><span class="st-ic" style="background:${g}">${icon(ic, 19)}</span><span class="st-delta ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${delta}</span></div><div class="st-val">${val}</div><div class="st-lbl">${label}</div><div class="st-orb" style="background:${g}"></div></div>`;

  const fmtMoney = n => money(Math.round(n));

  /* ================= TABS ================= */
  const tabs = {
    overview() {
      const active = Store.state.bookings.filter(b => !['cancelled', 'paid', 'rated'].includes(b.status));
      const rev = Store.state.bookings.reduce((a, b) => a + (b.total || 0), 0) + 4823500;
      const pending = Store.state.proApps.filter(a => a.status === 'pending').length;
      return `
      <div class="stat-grid">
        ${kpi('Total revenue', fmtMoney(rev), '12.4%', 'wallet', 'linear-gradient(135deg,#2563EB,#0EA5E9)')}
        ${kpi('Total bookings', (239450).toLocaleString('en-IN'), '8.2%', 'calendar', 'linear-gradient(135deg,#10B981,#14B8A6)')}
        ${kpi('Active bookings', active.length, '3%', 'navigation', 'linear-gradient(135deg,#F59E0B,#F97316)')}
        ${kpi('Pending approvals', pending, pending + ' waiting', 'briefcase', 'linear-gradient(135deg,#8B5CF6,#EC4899)', false)}
      </div>
      <div class="grid" style="grid-template-columns:1.5fr 1fr;gap:24px;align-items:start">
        <div class="card chart-card">
          <div class="cc-head"><div><h3>Revenue — last 12 months</h3><div class="cc-sub">₹43.2L total • avg. ₹3.6L/mo</div></div><span class="badge badge-success">${icon('trendingUp', 12)} +12.4%</span></div>
          ${areaChart([22, 26, 24, 29, 31, 28, 34, 37, 35, 41, 39, 46], { color: '#2563EB', labels: ['S', 'O', 'N', 'D', 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A'] })}
        </div>
        <div class="card chart-card">
          <div class="cc-head"><div><h3>Bookings by category</h3><div class="cc-sub">This month</div></div></div>
          ${donut([{ label: 'Cleaning', value: 34, color: '#2563EB' }, { label: 'AC & Appliances', value: 22, color: '#0EA5E9' }, { label: 'Salon & Beauty', value: 18, color: '#EC4899' }, { label: 'Electric/Plumb', value: 16, color: '#F59E0B' }, { label: 'Others', value: 10, color: '#10B981' }], '23.4k', 'bookings')}
        </div>
      </div>
      <div class="grid g3" style="grid-template-columns:repeat(3,1fr);margin-top:24px;gap:24px">
        <div class="card" style="padding:20px"><h3 style="font-size:15px;margin-bottom:12px">Top services</h3>${[
          ['Deep Cleaning', 8120, 'linear-gradient(135deg,#2563EB,#0EA5E9)'], ['AC Service', 7460, 'linear-gradient(135deg,#0EA5E9,#6366F1)'], ['Salon at Home', 6910, 'linear-gradient(135deg,#F43F5E,#EC4899)'], ['Basic Home Cleaning', 6540, 'linear-gradient(135deg,#10B981,#14B8A6)']].map((s, i) => `
          <div class="sum-row"><span style="display:flex;gap:8px;align-items:center"><span class="w-ic" style="width:30px;height:30px;border-radius:9px;background:${s[2]};display:grid;place-items:center;color:#fff">${i + 1}</span><b style="font-size:13px">${s[0]}</b></span><b style="font-size:13px">${s[1].toLocaleString('en-IN')}</b></div>`).join('')}</div>
        <div class="card" style="padding:20px"><h3 style="font-size:15px;margin-bottom:12px">Top cities</h3>${[['Mumbai', 52.4, 'linear-gradient(135deg,#2563EB,#0EA5E9)'], ['Bengaluru', 44.1, 'linear-gradient(135deg,#10B981,#14B8A6)'], ['Delhi NCR', 38.7, 'linear-gradient(135deg,#8B5CF6,#EC4899)'], ['Hyderabad', 29.3, 'linear-gradient(135deg,#F59E0B,#F97316)']].map(s => `
          <div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:6px"><span>${s[0]}</span><b>${money(s[1] * 10000)}</b></div><div class="progress"><i style="width:${(s[1] / 55) * 100}%;background:${s[2]}"></i></div></div>`).join('')}</div>
        <div class="card" style="padding:20px"><h3 style="font-size:15px;margin-bottom:12px">Live activity</h3>
          <div style="max-height:220px;overflow-y:auto">${Store.state.bookings.slice(0, 6).map(b => `<div class="list-row" style="padding:9px 0"><span class="status-dot ${b.status === 'started' ? 'dot-amber' : b.status === 'arriving' ? 'dot-blue' : 'dot-green'}"></span><div style="flex:1;min-width:0"><b style="font-size:12.5px">${esc(b.serviceName)}</b><div class="xsmall muted">${b.id}</div></div>${statusPill(b.status)}</div>`).join('')}</div>
          <a class="btn btn-soft btn-sm btn-block" href="#/admin/monitor">Open live monitor →</a></div>
      </div>`;
    },
    monitor() {
      const active = Store.state.bookings.filter(b => !['cancelled', 'paid', 'rated'].includes(b.status));
      return `
      <div class="card" style="padding:16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <b>${icon('activity', 16)} Live bookings — ${active.length} in progress</b>
        <div style="display:flex;gap:8px"><span class="badge badge-warn">${icon('zap', 12)} ${active.filter(b => b.status === 'started').length} started</span><span class="badge badge-primary">${icon('navigation', 12)} ${active.filter(b => b.status === 'arriving').length} arriving</span></div>
      </div>
      <div class="grid g3" style="grid-template-columns:repeat(3,1fr)">${active.map(b => `
        <div class="card" style="padding:20px" data-live="${b.id}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="font-size:14px">${esc(b.serviceName)}</b><span data-live-pill>${statusPill(b.status)}</span></div>
          <div class="small muted">${b.id} • ${esc(b.customer || 'Customer')} • ${fmtDate(b.date)} ${b.time}</div>
          <div style="display:flex;gap:8px;margin-top:12px"><span class="badge badge-neutral">${icon('user', 12)} ${esc(b.proName)}</span><span class="badge badge-neutral">${money(b.total)}</span></div>
          <div style="display:flex;gap:8px;margin-top:14px"><a class="btn btn-soft btn-sm" style="flex:1" href="#/track/${b.id}">${icon('eye', 13)} View</a><button class="btn btn-outline btn-sm" data-act="admin-advance" data-id="${b.id}">${icon('refresh', 13)} Next</button></div>
        </div>`).join('') || `<div class="tbl-wrap"><div class="tbl-empty">${icon('activity', 28)} No live bookings right now.</div></div>`}</div>`;
    },
    customers() {
      const rows = [
        ['Ananya Rao', 'Mumbai', 18, fmtMoney(34200), '2 days ago'], ['Mohit Agarwal', 'Bengaluru', 12, fmtMoney(21800), '1 week ago'],
        ['Sara Fernandes', 'Pune', 9, fmtMoney(16400), '3 weeks ago'], ['Devang Joshi', 'Delhi NCR', 7, fmtMoney(12800), '1 month ago'],
        ['Kavya Menon', 'Hyderabad', 21, fmtMoney(42600), '2 months ago'], ['Rahul Nair', 'Chennai', 15, fmtMoney(28300), '3 months ago'],
      ];
      return table(['Customer', 'City', 'Bookings', 'Lifetime value', 'Last active'], rows.map(r => ({ cells: [`<div style="display:flex;gap:10px;align-items:center">${avatar(r[0], 34)}<b style="font-size:13.5px">${r[0]}</b></div>`, r[1], r[2], `<b>${r[3]}</b>`, `<span class="small muted">${r[4]}</span>`], actions: [mini('eye', 'View'), mini('mail', 'Email', 'blue')] })), { empty: '<div class="tbl-empty">No customers found</div>', right: `<button class="btn btn-outline btn-sm" data-act="toast" data-msg="Customer list exported to CSV 📄">${icon('download', 14)} Export</button>` });
    },
    professionals() {
      const pending = Store.state.proApps;
      const approved = [['Rahul Sharma', 'AC & Appliances', 'Mumbai', '4.9 ★', '1240'], ['Priya Menon', 'Deep Cleaning', 'Mumbai', '4.8 ★', '980'], ['Arjun Patel', 'Electrician', 'Bengaluru', '4.7 ★', '760']];
      return `
      ${pending.length ? `<div class="card" style="padding:20px;margin-bottom:24px;border-color:var(--warn-100);background:var(--warn-50)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><b>${icon('timer', 16)} Applications awaiting review (${pending.length})</b><span class="badge badge-warn">Avg. review 6 hrs</span></div>
        ${pending.map(a => `<div class="list-row" style="border-color:var(--warn-100)">
          ${avatar(a.name, 40)}<div style="flex:1;min-width:0"><b style="font-size:13.5px">${esc(a.name)}</b><div class="xsmall muted">${a.id} • ${esc(a.cat)} • ${esc(a.city)} • ${a.exp} yrs • applied ${timeAgo(a.createdAt)}</div></div>
          <div class="row-actions"><button class="btn btn-success btn-sm" data-act="approve-pro" data-id="${a.id}">${icon('check', 14)} Approve</button><button class="btn btn-danger btn-sm" data-act="reject-pro" data-id="${a.id}">${icon('x', 14)} Reject</button><button class="mini-btn blue" data-act="view-pro" data-id="${a.id}" title="Review documents">${icon('eye', 15)}</button></div></div>`).join('')}
      </div>` : ''}
      <h3 style="font-size:15px;margin-bottom:12px">Approved professionals</h3>
      ${table(['Professional', 'Category', 'City', 'Rating', 'Jobs done'], approved.map(p => ({ cells: [`<div style="display:flex;gap:10px;align-items:center">${avatar(p[0], 34)}<b style="font-size:13.5px">${p[0]}</b></div>`, p[1], p[2], p[3], p[4]], actions: [mini('eye', 'Profile', 'blue'), mini('settings', 'Manage'), mini('x', 'Suspend', 'no')] })), { search: false, right: `<button class="btn btn-primary btn-sm" data-act="toast" data-msg="New professional invite sent 📧">${icon('plus', 13)} Invite pro</button>` })}`;
    },
    services() {
      const rows = DATA.services.slice(0, 12);
      return table(['Service', 'Category', 'Price', 'Rating', 'Bookings', 'Status'], rows.map(s => ({ cells: [`<b style="font-size:13.5px">${esc(s.name)}</b>`, esc(DATA.catBySlug(s.cat)?.name || ''), `<b>${money(s.price)}</b>`, `${s.rating} ★`, s.bookings.toLocaleString('en-IN'), `<span class="badge badge-success">Active</span>`], actions: [mini('edit', 'Edit', 'blue'), mini('eye', 'View'), mini('trash', 'Delete', 'no')] })), { right: `<button class="btn btn-primary btn-sm" data-act="toast" data-msg="New service form opened 📝">${icon('plus', 13)} Add service</button>` });
    },
    categories() {
      const rows = DATA.categories;
      return table(['Category', 'Services', 'Price from', 'Rating', 'Bookings'], rows.map(c => ({ cells: [`<div style="display:flex;gap:10px;align-items:center"><span class="w-ic" style="width:34px;height:34px;border-radius:10px;background:${c.g};display:grid;place-items:center;color:#fff">${icon(c.icon, 16)}</span><b style="font-size:13.5px">${c.name}</b></div>`, DATA.servicesByCat(c.slug).length, money(c.price), `${c.rating} ★`, c.bookings.toLocaleString('en-IN')], actions: [mini('edit', 'Edit', 'blue'), mini('eye', 'View')] })));
    },
    cities() {
      const rows = DATA.cities;
      return table(['City', 'Areas', 'Bookings', 'Status'], rows.map(c => ({ cells: [`<b style="font-size:13.5px">${c.name}</b>`, c.areas.map(a => `<span class="pro-tag">${a}</span>`).join(' '), (Math.random() * 40000 + 8000).toFixed(0), `<span class="badge badge-success">Serviceable</span>`], actions: [mini('edit', 'Edit', 'blue'), mini('plus', 'Add area'), mini('eye', 'View')] })), { right: `<button class="btn btn-primary btn-sm" data-act="toast" data-msg="City onboarding flow opened 🏙️">${icon('plus', 13)} Onboard city</button>` });
    },
    coupons() { return mgrShell('coupons'); },
    giftcards() { return mgrShell('giftcards'); },
    bookings() {
      const rows = Store.state.bookings.slice(0, 20);
      return table(['Booking', 'Service', 'Customer', 'Date', 'Amount', 'Status'], rows.map(b => ({ cells: [`<b style="font-size:13px">${b.id}</b>`, `<b style="font-size:13px">${esc(b.serviceName)}</b>`, esc(b.customer || Store.currentUser()?.name || 'Customer'), `${fmtDate(b.date)} ${b.time}`, `<b>${money(b.total)}</b>`, statusPill(b.status)], actions: [mini('eye', 'View', 'blue'), mini('user', 'Assign pro'), mini('x', 'Cancel', 'no')] })), { right: `<span class="badge badge-neutral">${rows.length} recent</span>` });
    },
    payments() {
      const methods = [['UPI', 42], ['Card', 27], ['Wallet', 14], ['Net Banking', 9], ['Cash', 8]];
      const rows = Store.state.bookings.slice(0, 10).map((b, i) => ({ cells: [b.id, esc(b.serviceName), methods[i % 5][0], `<b>${money(b.total)}</b>`, `<span class="badge badge-success">${icon('check', 12)} Settled</span>`], actions: [mini('eye', 'View', 'blue'), mini('download', 'Receipt')] }));
      return `<div class="grid g3" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">${methods.map(m => `<div class="card stat-card"><div class="st-top"><span class="st-ic" style="background:linear-gradient(135deg,#2563EB,#0EA5E9)">${icon(m[0] === 'UPI' ? 'smartphone' : m[0] === 'Card' ? 'card' : m[0] === 'Wallet' ? 'wallet' : m[0] === 'Cash' ? 'cash' : 'bank', 18)}</span><span class="st-lbl">${m[0]}</span></div><div class="st-val">${m[1]}%</div><div class="st-delta up">${fmtMoney(428000 + i * 12000)} volume</div></div>`).join('')}</div>${table(['Transaction', 'Service', 'Method', 'Amount', 'Status'], rows, { search: false })}`;
    },
    refunds() {
      const cancellable = Store.state.bookings.filter(b => b.status === 'cancelled');
      const rows = cancellable.map(b => ({ cells: [b.id, esc(b.serviceName), fmtDate(b.date), `<b>${money(b.total)}</b>`, `<span class="badge badge-success">Refunded</span>`], actions: [mini('eye', 'View', 'blue'), mini('refreshCw', 'Reprocess', 'blue')] }));
      return `
      <div class="card" style="padding:18px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div><b style="font-size:14px">Refund policy</b><div class="small muted">Full refunds within 24h of slot • 10% fee between 6–24h • Instant wallet credits</div></div>
        <span class="badge badge-neutral">${money(68400)} refunded this month</span>
      </div>
      ${table(['Booking', 'Service', 'Date', 'Amount', 'Status'], rows, { search: false })}`;
    },
    commissions() {
      return `
      <div class="card" style="padding:24px;margin-bottom:20px">
        <h3 style="font-size:16px;margin-bottom:6px">Category commission rates</h3><p class="small muted" style="margin-bottom:16px">Servehub's commission on each category. Higher-demand categories have lower commission for pros.</p>
        ${DATA.categories.slice(0, 10).map((c, i) => { const rate = [15, 18, 20, 20, 18, 15, 15, 15, 18, 20, 15, 18, 15, 20, 15, 15, 18][i] || 18; return `
          <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--line-2)">
            <span class="w-ic" style="width:34px;height:34px;border-radius:10px;background:${c.g};display:grid;place-items:center;color:#fff">${icon(c.icon, 15)}</span>
            <b style="flex:1;font-size:13.5px">${c.name}</b>
            <div style="display:flex;align-items:center;gap:8px"><span class="badge badge-neutral">${rate}%</span><input type="range" min="5" max="30" value="${rate}" style="width:120px" aria-label="Commission rate"></div>
          </div>`; }).join('')}
        <button class="btn btn-primary" style="margin-top:16px" data-act="toast" data-msg="Commission settings saved ✅">${icon('save', 14)} Save rates</button>
      </div>`;
    },
    plans() { return mgrShell('plans'); },
    analytics() {
      return `
      <div class="stat-grid">
        ${kpi('Conversion rate', '3.9%', '0.4%', 'activity', 'linear-gradient(135deg,#2563EB,#0EA5E9)')}
        ${kpi('Customer growth', '+18,240', '9.1%', 'users', 'linear-gradient(135deg,#10B981,#14B8A6)')}
        ${kpi('Professional growth', '+1,120', '6.3%', 'briefcase', 'linear-gradient(135deg,#F59E0B,#F97316)')}
        ${kpi('Repeat rate', '68%', '2.2%', 'refreshCw', 'linear-gradient(135deg,#8B5CF6,#EC4899)')}
      </div>
      <div class="grid" style="grid-template-columns:1.5fr 1fr;gap:24px">
        <div class="card chart-card"><div class="cc-head"><div><h3>Daily bookings</h3><div class="cc-sub">Peak: Saturday • Avg. 840/day</div></div></div>${barChart([620, 700, 680, 760, 720, 980, 890, 640, 720, 690, 770, 940, 860, 990], ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'])}</div>
        <div class="card chart-card"><div class="cc-head"><div><h3>Monthly revenue</h3><div class="cc-sub">FY 2026–27</div></div></div>${barChart([28, 33, 31, 38, 42, 40, 47], ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'])}</div>
      </div>
      <div class="grid g3" style="grid-template-columns:repeat(3,1fr);margin-top:24px">
        <div class="card" style="padding:20px"><h3 style="font-size:15px;margin-bottom:10px">Acquisition channels</h3>${[['Organic search', 38], ['Referrals', 24], ['App store', 19], ['Social', 12], ['Paid ads', 7]].map(c => `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600;margin-bottom:4px"><span>${c[0]}</span><b>${c[1]}%</b></div><div class="progress"><i style="width:${c[1] * 2.2}%"></i></div></div>`).join('')}</div>
        <div class="card" style="padding:20px"><h3 style="font-size:15px;margin-bottom:10px">Hourly demand</h3>${[['09–12', 18], ['12–15', 26], ['15–18', 32], ['18–21', 24]].map(c => `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600;margin-bottom:4px"><span>${c[0]}</span><b>${c[1]}%</b></div><div class="progress"><i style="width:${c[1] * 3}%;background:var(--grad)"></i></div></div>`).join('')}</div>
        <div class="card" style="padding:20px"><h3 style="font-size:15px;margin-bottom:10px">Net promoter score</h3><div style="text-align:center;padding:10px 0"><div style="font-size:44px;font-weight:900;color:var(--success-600)">+72</div><div class="small muted">Excellent • up 4 pts</div></div><div class="progress"><i style="width:86%"></i></div></div>
      </div>`;
    },
    reports() {
      const reports = [['Revenue report', 'Jul 2026', 'barChart'], ['Booking funnel', 'Last 30 days', 'activity'], ['Professional performance', 'Q2 2026', 'users'], ['City-wise growth', 'Jul 2026', 'pin'], ['Refund & disputes', 'Jul 2026', 'refreshCw'], ['Tax summary (GSTR-1)', 'Q2 2026', 'coins']];
      return `<div class="grid g2" style="grid-template-columns:1fr 1fr">${reports.map(r => `
        <div class="card card-hover" style="padding:20px;display:flex;align-items:center;gap:14px"><span class="n-ic" style="width:44px;height:44px;border-radius:13px;background:var(--primary-50);color:var(--primary-600);display:grid;place-items:center">${icon(r[2], 19)}</span>
        <div style="flex:1"><b style="font-size:14px">${r[0]}</b><div class="xsmall muted">${r[1]} • PDF / CSV / XLSX</div></div>
        <button class="btn btn-soft btn-sm" data-act="toast" data-msg="${r[0]} downloaded 📄">${icon('download', 14)} Download</button></div>`).join('')}</div>`;
    },
    cms() {
      const pages = [['Homepage hero', 'Landing page', 'Edited 2h ago', 'live'], ['Search & categories', 'Discovery', 'Edited 1d ago', 'live'], ['Booking confirmation', 'Transactional', 'Edited 3d ago', 'draft'], ['Email templates', 'Notifications', 'Edited 1w ago', 'live'], ['App push copy', 'Notifications', 'Edited 2w ago', 'draft']];
      return table(['Page', 'Type', 'Last edited', 'Status'], pages.map(p => ({ cells: [`<b style="font-size:13.5px">${p[0]}</b>`, p[1], `<span class="small muted">${p[2]}</span>`, `<span class="badge ${p[3] === 'live' ? 'badge-success' : 'badge-warn'}">${p[3] === 'live' ? 'Live' : 'Draft'}</span>`], actions: [mini('edit', 'Edit', 'blue'), mini('eye', 'Preview'), mini('send', 'Publish', 'ok')] })), { right: `<button class="btn btn-primary btn-sm" data-act="toast" data-msg="New content page created 📝">${icon('plus', 13)} New page</button>` });
    },
    blog() {
      return table(['Post', 'Category', 'Date', 'Views'], DATA.blog.map(p => ({ cells: [`<b style="font-size:13.5px">${esc(p.title)}</b>`, p.cat, p.date, (Math.random() * 40 + 4).toFixed(1) + 'k'], actions: [mini('edit', 'Edit', 'blue'), mini('eye', 'Preview'), mini('trash', 'Delete', 'no')] })), { right: `<button class="btn btn-primary btn-sm" data-act="toast" data-msg="Blog editor opened ✍️">${icon('plus', 13)} Write post</button>` });
    },
    banners() {
      return `<div class="grid g3" style="grid-template-columns:repeat(3,1fr)">${[
        ['Monsoon AC Offer', '20% off on all AC services', 'linear-gradient(135deg,#0EA5E9,#6366F1)', true], ['Festive Deep Clean', 'Flat 25% off — use FESTIVE25', 'linear-gradient(135deg,#8B5CF6,#EC4899)', true], ['New city: Ahmedabad', 'Bookings now live', 'linear-gradient(135deg,#10B981,#14B8A6)', false]].map(b => `
        <div class="card" style="overflow:hidden"><div class="svc-art" style="height:120px"><div class="art-bg" style="background:${b[2]}">${icon('camera', 44)}</div></div>
        <div style="padding:16px"><b style="font-size:14px">${b[0]}</b><div class="small muted" style="margin:4px 0 12px">${b[1]}</div>
        <div style="display:flex;justify-content:space-between;align-items:center"><label class="switch"><input type="checkbox" ${b[3] ? 'checked' : ''}><span class="trk"></span></label><span class="badge ${b[3] ? 'badge-success' : 'badge-neutral'}">${b[3] ? 'Live' : 'Paused'}</span></div></div></div>`).join('')}</div>`;
    },
    tickets() { return mgrShell('tickets'); },
    reviews() { return mgrShell('reviews'); },
    referrals() {
      return `<div class="stat-grid">
        ${kpi('Active referrers', '84,200', '9.4%', 'share', 'linear-gradient(135deg,#2563EB,#0EA5E9)')}
        ${kpi('Referral revenue', fmtMoney(2840000), '14%', 'wallet', 'linear-gradient(135deg,#10B981,#14B8A6)')}
        ${kpi('Conversion', '31%', '3%', 'activity', 'linear-gradient(135deg,#F59E0B,#F97316)')}
      </div>
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:24px">
        <div class="card" style="padding:22px"><h3 style="font-size:15px;margin-bottom:14px">Referral settings</h3>
          <div class="sum-row"><span class="muted">Referrer reward</span><b>₹100</b></div>
          <div class="sum-row"><span class="muted">Referee reward</span><b>₹100</b></div>
          <div class="sum-row"><span class="muted">Min. booking for reward</span><b>₹399</b></div>
          <div class="sum-row"><span class="muted">Reward expiry</span><b>30 days</b></div>
          <button class="btn btn-primary btn-sm" style="margin-top:14px" data-act="toast" data-msg="Referral settings saved ✅">${icon('save', 14)} Save</button></div>
        <div class="card" style="padding:22px"><h3 style="font-size:15px;margin-bottom:14px">Top referrers</h3>${[['Kavya Menon', 48, '₹4,800'], ['Mohit Agarwal', 36, '₹3,600'], ['Sara Fernandes', 29, '₹2,900'], ['Devang Joshi', 24, '₹2,400']].map(r => `<div class="list-row" style="padding:10px 0">${avatar(r[0], 36)}<div style="flex:1"><b style="font-size:13px">${r[0]}</b><div class="xsmall muted">${r[1]} referrals</div></div><b>${r[2]}</b></div>`).join('')}</div>
      </div>`;
    },
    tax() {
      return `
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:24px">
        <div class="card" style="padding:24px"><h3 style="font-size:15px;margin-bottom:16px">GST settings</h3>
          <div class="field"><label class="label">GST rate (%)</label><div style="display:flex;gap:8px"><input class="input" value="18" style="max-width:120px"><button class="btn btn-soft" data-act="toast" data-msg="GST rate updated ✅">Save</button></div></div>
          <div class="field"><label class="label">Business GSTIN</label><input class="input" value="27ABCDE1234F1Z5"></div>
          <div class="field"><label class="label">Legal entity</label><input class="input" value="Servehub Services Pvt. Ltd."></div>
          <div class="card glass" style="padding:14px;font-size:12.5px"><b>${icon('info', 13)} GST split:</b> <span class="muted">9% CGST + 9% SGST on every invoice. Auto-filed monthly via GSTR-1.</span></div>
        </div>
        <div class="card" style="padding:24px"><h3 style="font-size:15px;margin-bottom:16px">TDS & settlements</h3>
          <div class="sum-row"><span class="muted">TDS on pro payouts (194J)</span><b>2%</b></div>
          <div class="sum-row"><span class="muted">Payout cycle</span><b>Weekly (Fri)</b></div>
          <div class="sum-row"><span class="muted">Settlement fee</span><b>Free</b></div>
          <div class="sum-row"><span class="muted">Last GSTR-1 filed</span><b>Jul 7, 2026</b></div>
          <button class="btn btn-primary btn-sm" style="margin-top:14px" data-act="toast" data-msg="Tax settings saved ✅">${icon('save', 14)} Save</button></div>
      </div>`;
    },
    roles() {
      const perms = [['Manage customers', true, true, false], ['Manage professionals', true, true, true], ['Process refunds', true, true, false], ['Edit commissions', true, false, false], ['Publish CMS content', true, true, false], ['View analytics', true, true, true], ['Modify roles', true, false, false]];
      const roles = ['Super admin', 'Operations', 'Finance', 'Support'];
      return `
      <div class="card" style="padding:24px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px"><div><h3 style="font-size:16px">Role-based access control</h3><p class="small muted">Define what each role can do across the admin panel.</p></div><button class="btn btn-primary btn-sm" data-act="toast" data-msg="New role created 👤">${icon('plus', 13)} Add role</button></div>
        <div class="tbl-scroll"><table><thead><tr><th>Permission</th>${roles.map(r => `<th class="center" style="text-align:center">${r}</th>`).join('')}</tr></thead><tbody>
        ${perms.map(p => `<tr><td><b style="font-size:13px">${p[0]}</b></td>${p.slice(1).map(v => `<td class="center" style="text-align:center">${v ? `<span style="color:var(--success-600)">${icon('checkCircle', 17)}</span>` : '<span style="color:var(--ink-4)">—</span>'}</td>`).join('')}</tr>`).join('')}
        </tbody></table></div>
        <button class="btn btn-primary" style="margin-top:16px" data-act="toast" data-msg="Permissions saved ✅">${icon('save', 14)} Save changes</button>
      </div>`;
    },
    notifications() {
      return `
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:24px">
        <div class="card" style="padding:24px"><h3 style="font-size:16px;margin-bottom:14px">Broadcast a notification</h3>
          <div class="field"><label class="label">Audience</label><select class="select"><option>All customers</option><option>All professionals</option><option>Plus & Pro members</option><option>City: Mumbai</option><option>Custom segment</option></select></div>
          <div class="field"><label class="label" for="bc-title">Title</label><input class="input" id="bc-title" placeholder="e.g. Monsoon AC offer is live!"></div>
          <div class="field"><label class="label" for="bc-msg">Message</label><textarea class="textarea" id="bc-msg" placeholder="Write your message…"></textarea></div>
          <div class="field"><label class="label">Channels</label><div class="radio-pill">${[['push', 'Push'], ['email', 'Email'], ['sms', 'SMS'], ['whatsapp', 'WhatsApp']].map((c, i) => `<label><input type="checkbox" ${i === 0 ? 'checked' : ''}><span>${c[1]}</span></label>`).join('')}</div></div>
          <button class="btn btn-primary btn-block" data-act="broadcast">${icon('send', 0)} Send to 2.4M users</button>
        </div>
        <div class="card" style="padding:24px"><h3 style="font-size:16px;margin-bottom:14px">Recent broadcasts</h3>
          ${[['Monsoon AC offer is live!', 'Push • 2.4M sent', '2h ago', 'Open rate 34%'], ['₹50 off your first booking', 'Email • 1.1M sent', '1d ago', 'CTR 6.2%'], ['New city: Ahmedabad 🎉', 'Push • 1.2M sent', '3d ago', 'Open rate 41%']].map(n => `
          <div class="list-row"><span class="n-ic" style="width:38px;height:38px;border-radius:11px;background:var(--primary-50);color:var(--primary-600);display:grid;place-items:center">${icon('bell', 16)}</span>
          <div style="flex:1;min-width:0"><b style="font-size:13px">${n[0]}</b><div class="xsmall muted">${n[1]} • ${n[2]}</div></div><span class="badge badge-success">${n[3]}</span></div>`).join('')}
        </div>
      </div>`;
    },
  };

  const mini = (ic, title, cls = '') => `<button class="mini-btn ${cls}" data-act="toast" data-msg="${title} → (demo)" title="${title}" aria-label="${title}">${icon(ic, 14)}</button>`;

  /* ================= LIVE-MANAGED TABS =================
     coupons / giftcards / plans / tickets / reviews load from the admin API
     when reachable; otherwise they fall back to local demo data so the panel
     is always usable. Every mutation re-renders the tab body. */
  const MANAGED = ['coupons', 'giftcards', 'plans', 'tickets', 'reviews'];
  const mgrState = {}; // per-tab cache: { src: 'api'|'demo', items: [...] }

  const mgrShell = name => `
    <div class="card" style="padding:8px">
      <div id="mgr-body" data-mgr="${name}" style="min-height:200px">
        <div class="center" style="padding:60px 0">${icon('loader', 24)} <div class="small muted" style="margin-top:10px">Loading ${name}…</div></div>
      </div>
    </div>`;

  const srcBadge = (src, liveCount) => src === 'api'
    ? `<span class="badge badge-success" style="margin-right:8px">${icon('server', 12)} Live · ${liveCount}</span>`
    : `<span class="badge badge-neutral" style="margin-right:8px">${icon('zap', 12)} Demo data</span>`;

  const statusChip = (st, map = {}) => `<span class="badge ${map[st] || 'badge-neutral'}">${(st || '').replace(/-/g, ' ')}</span>`;

  const managedLoad = async name => {
    const body = U.$('#mgr-body');
    if (!body) return;
    const render = MANAGED_RENDER[name];
    const prev = mgrState[name];
    let src = 'demo';
    let items = prev && prev.src === 'demo' ? prev.items : demoItems(name); // keep demo edits across reloads
    const live = await apiGet('/admin/' + name);
    if (live && (live.coupons || live.giftCards || live.plans || live.tickets || live.reviews)) {
      src = 'api';
      items = live.coupons || live.giftCards || live.plans || live.tickets || live.reviews || [];
    }
    mgrState[name] = { src, items };
    body.innerHTML = render(items, src);
    wireManagedActions(body, name);
    wireTableSearch(body);
  };

  const demoItems = name => {
    if (name === 'coupons') return DATA.coupons.map(c => ({ code: c.code, type: c.type === 'pct' ? 'percent' : 'flat', value: c.value, minAmount: c.min || 0, cap: c.cap || null, active: true, description: c.desc, validUntil: c.valid }));
    if (name === 'plans') return DATA.plans.map(p => ({ id: p.id, name: p.name, price: p.price, period: p.per, featured: !!p.featured, active: true, perks: p.perks }));
    if (name === 'tickets') return Store.state.tickets.map(t => ({ id: t.id, customerName: Store.currentUser()?.name || 'Customer', subject: t.subject, category: t.cat || 'other', status: t.status, priority: 'medium', messages: [{ from: 'customer', text: t.msg || '', createdAt: t.createdAt }] }));
    if (name === 'reviews') return DATA.reviews.map((r, i) => ({ id: i + 1, customerName: r.name, serviceName: 'Deep Cleaning', rating: r.rating, text: r.text, status: 'published', verified: r.v, helpful: r.helpful, createdAt: r.date }));
    return [];
  };

  /* -------- renderers per managed tab -------- */
  const MANAGED_RENDER = {
    coupons(items, src) {
      const rows = items.map(c => ({
        cells: [`<b style="letter-spacing:.04em">${esc(c.code)}</b>`, c.type === 'percent' ? `${c.value}% off${c.cap ? ' (max ' + money(c.cap) + ')' : ''}` : money(c.value), money(c.minAmount || 0), c.description || '—', c.validUntil || '—', `<span class="badge ${c.active === false ? 'badge-neutral' : 'badge-success'}">${c.active === false ? 'Inactive' : 'Active'}</span>`],
        actions: [
          `<button class="mini-btn blue" data-mgr-act="coupon-edit" data-code="${esc(c.code)}" title="Edit">${icon('edit', 14)}</button>`,
          `<button class="mini-btn ${c.active === false ? 'ok' : 'warn'}" data-mgr-act="coupon-toggle" data-code="${esc(c.code)}" title="${c.active === false ? 'Activate' : 'Deactivate'}">${icon(c.active === false ? 'play' : 'pause', 14)}</button>`,
          `<button class="mini-btn no" data-mgr-act="coupon-del" data-code="${esc(c.code)}" title="Delete">${icon('trash', 14)}</button>`,
        ],
      }));
      return table(['Code', 'Discount', 'Min. order', 'Description', 'Valid till', 'Status'], rows, {
        empty: 'No coupons yet — create one to promote your services',
        right: `${srcBadge(src, items.length)}<button class="btn btn-primary btn-sm" data-mgr-act="coupon-new">${icon('plus', 13)} New coupon</button>`,
      });
    },
    giftcards(items, src) {
      const rows = items.map(g => ({
        cells: [`<b style="letter-spacing:.04em">${esc(g.code)}</b>`, money(g.value), money(g.balance || 0), g.expiresAt || '—', g.ownerUserId ? 'Redeemed' : 'Unclaimed', statusChip(g.status, { active: 'badge-success', redeemed: 'badge-primary', expired: 'badge-neutral' })],
        actions: [
          `<button class="mini-btn ${g.status === 'active' ? 'warn' : 'ok'}" data-mgr-act="gift-toggle" data-id="${g.id}" title="${g.status === 'active' ? 'Expire' : 'Re-activate'}">${icon(g.status === 'active' ? 'pause' : 'play', 14)}</button>`,
          `<button class="mini-btn no" data-mgr-act="gift-del" data-id="${g.id}" title="Delete">${icon('trash', 14)}</button>`,
        ],
      }));
      return table(['Code', 'Value', 'Balance', 'Expires', 'Owner', 'Status'], rows, {
        empty: 'No gift cards yet — create one to sell to customers',
        right: `${srcBadge(src, items.length)}<button class="btn btn-primary btn-sm" data-mgr-act="gift-new">${icon('plus', 13)} New gift card</button>`,
      });
    },
    plans(items, src) {
      return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">${srcBadge(src, items.length)}</div>
      <div class="grid g3" style="grid-template-columns:repeat(3,1fr)">${items.map(p => `
        <div class="card plan-card ${p.featured ? 'featured' : ''}" style="min-height:240px">${p.featured ? '<span class="pl-ribbon">Flagship</span>' : ''}
          <b>${esc(p.name)}</b><div class="plan-price">${p.price === 0 ? 'Free' : money(p.price)}<small>/${p.per || 'month'}</small></div>
          <div class="small muted" style="flex:1">${(p.perks || []).length} perks • ${p.active === false ? 'Deactivated' : 'Active'}</div>
          <div style="display:flex;gap:8px"><button class="btn btn-outline btn-sm" style="flex:1" data-mgr-act="plan-edit" data-id="${esc(p.id)}">${icon('edit', 13)} Edit</button>
          <button class="btn btn-soft btn-sm ${p.active === false ? 'ok' : ''}" data-mgr-act="plan-toggle" data-id="${esc(p.id)}">${icon(p.active === false ? 'play' : 'pause', 13)} ${p.active === false ? 'Activate' : 'Pause'}</button></div>
        </div>`).join('') || '<div class="tbl-wrap"><div class="tbl-empty">No plans</div></div>'}</div>`;
    },
    tickets(items, src) {
      const rows = items.map(t => ({
        cells: [`<b style="font-size:13px">${esc(t.id)}</b>`, esc(t.customerName || 'Customer'), esc(t.subject), esc(t.category || 'other'), timeAgo(t.createdAt), statusChip(t.status, { open: 'badge-warn', 'in-progress': 'badge-primary', resolved: 'badge-success', closed: 'badge-neutral' })],
        actions: [`<button class="mini-btn blue" data-mgr-act="ticket-view" data-id="${t.id}" title="Open thread">${icon('eye', 14)}</button>`],
      }));
      return table(['Ticket', 'Customer', 'Subject', 'Category', 'Age', 'Status'], rows, {
        empty: 'No support tickets',
        right: srcBadge(src, items.length),
        search: false,
      });
    },
    reviews(items, src) {
      const rows = items.map(r => ({
        cells: [`<div style="display:flex;gap:10px;align-items:center">${avatar(r.customerName || 'Customer', 32)}<b style="font-size:13px">${esc(r.customerName || 'Customer')}</b></div>`, esc(r.serviceName || '—'), stars(r.rating), `<span class="small muted" style="max-width:220px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.text || '')}</span>`, statusChip(r.status, { published: 'badge-success', pending: 'badge-warn', hidden: 'badge-neutral' })],
        actions: [
          `<button class="mini-btn blue" data-mgr-act="review-view" data-id="${r.id}" title="View">${icon('eye', 14)}</button>`,
          r.status !== 'published' ? `<button class="mini-btn ok" data-mgr-act="review-approve" data-id="${r.id}" title="Approve">${icon('check', 14)}</button>` : `<button class="mini-btn warn" data-mgr-act="review-hide" data-id="${r.id}" title="Hide">${icon('eyeOff', 14)}</button>`,
          `<button class="mini-btn no" data-mgr-act="review-del" data-id="${r.id}" title="Remove">${icon('trash', 14)}</button>`,
        ],
      }));
      return table(['Customer', 'Service', 'Rating', 'Review', 'Status'], rows, {
        empty: 'No reviews yet',
        right: `${srcBadge(src, items.length)}<span class="badge badge-neutral">${items.filter(r => r.status === 'pending').length} pending</span>`,
        search: false,
      });
    },
  };

  /* -------- actions -------- */
  const wireManagedActions = (body, name) => {
    // Only ever attach one delegated listener — reloads replace innerHTML but
    // keep the same #mgr-body element, so a guard prevents listener buildup.
    if (body.dataset.mgrWired) return;
    body.dataset.mgrWired = '1';
    body.addEventListener('click', async e => {
      const btn = e.target.closest('[data-mgr-act]');
      if (!btn) return;
      const act = btn.dataset.mgrAct;
      const reload = () => managedLoad(name);
      const st = mgrState[name] || { src: 'demo', items: [] };
      const items = st.items;

      if (act === 'coupon-new') {
        openModal(modalShell('New coupon', `
          <div class="field"><label class="label">Code</label><input class="input" id="cp-code" placeholder="e.g. MONSOON25" style="text-transform:uppercase"></div>
          <div class="grid g2" style="grid-template-columns:1fr 1fr;gap:10px">
            <div class="field"><label class="label">Type</label><select class="select" id="cp-type"><option value="percent">Percent</option><option value="flat">Flat ₹</option></select></div>
            <div class="field"><label class="label">Value</label><input class="input" id="cp-value" type="number" placeholder="20"></div>
          </div>
          <div class="grid g2" style="grid-template-columns:1fr 1fr;gap:10px">
            <div class="field"><label class="label">Min. order (₹)</label><input class="input" id="cp-min" type="number" value="0"></div>
            <div class="field"><label class="label">Max discount (₹)</label><input class="input" id="cp-cap" type="number" placeholder="optional"></div>
          </div>
          <div class="field"><label class="label">Valid until</label><input class="input" id="cp-valid" type="date"></div>
          <div class="field"><label class="label">Description</label><input class="input" id="cp-desc" placeholder="e.g. 20% off monsoon specials"></div>`, 
          `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" id="cp-save">${icon('save', 14)} Create coupon</button>`));
        U.$('#cp-save').addEventListener('click', async () => {
          const body2 = { code: U.$('#cp-code').value.trim(), type: U.$('#cp-type').value, value: Number(U.$('#cp-value').value || 0), minAmount: Number(U.$('#cp-min').value || 0), cap: U.$('#cp-cap').value ? Number(U.$('#cp-cap').value) : null, validUntil: U.$('#cp-valid').value, description: U.$('#cp-desc').value };
          if (!body2.code) { toast('Coupon code is required', 'warn'); return; }
          const r = await apiPost('/admin/coupons', body2);
          if (r && r.coupon) { toast('Coupon ' + r.coupon.code + ' created 🎟️', 'success'); closeModal(); reload(); }
          else { items.unshift({ ...body2, active: true }); toast('Coupon created (demo)', 'success'); closeModal(); reload(); }
        });
      }
      if (act === 'coupon-edit') {
        const c = items.find(x => String(x.code) === String(btn.dataset.code));
        if (!c) return;
        openModal(modalShell('Edit coupon — ' + esc(c.code), `
          <div class="sum-row"><span class="muted">Discount</span><b>${c.type === 'percent' ? c.value + '% off' : money(c.value)}</b></div>
          <div class="sum-row"><span class="muted">Min. order</span><b>${money(c.minAmount || 0)}</b></div>
          <div class="sum-row"><span class="muted">Valid till</span><b>${c.validUntil || '—'}</b></div>
          <div class="field" style="margin-top:12px"><label class="label">Status</label><select class="select" id="cp-st"><option value="true" ${c.active !== false ? 'selected' : ''}>Active</option><option value="false" ${c.active === false ? 'selected' : ''}>Inactive</option></select></div>`, 
          `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" id="cp-save">${icon('save', 14)} Save</button>`));
        U.$('#cp-save').addEventListener('click', async () => {
          const active = U.$('#cp-st').value === 'true';
          const r = await apiPatch('/admin/coupons/' + encodeURIComponent(c.code), { active });
          if (r && r.coupon) toast('Coupon updated ✅', 'success'); else { c.active = active; toast('Coupon updated (demo) ✅', 'success'); }
          closeModal(); reload();
        });
      }
      if (act === 'coupon-toggle') {
        const c = items.find(x => String(x.code) === String(btn.dataset.code));
        if (!c) return;
        const next = c.active === false;
        const r = await apiPatch('/admin/coupons/' + encodeURIComponent(c.code), { active: next });
        if (!r || !r.coupon) c.active = next;
        toast('Coupon ' + c.code + (next ? ' activated' : ' deactivated') + ' ✅'); reload();
      }
      if (act === 'coupon-del') {
        if (!confirm('Delete coupon ' + btn.dataset.code + '?')) return;
        await apiDelete('/admin/coupons/' + encodeURIComponent(btn.dataset.code));
        toast('Coupon deleted 🗑️'); reload();
      }
      if (act === 'gift-new') {
        openModal(modalShell('New gift card', `<div class="field"><label class="label">Value (₹)</label><div class="radio-pill">${[250, 500, 1000, 2000].map(a => `<label><input type="radio" name="gv" value="${a}" ${a === 500 ? 'checked' : ''}><span>${money(a)}</span></label>`).join('')}</div></div><div class="field"><label class="label">Expires</label><input class="input" id="gc-exp" type="date"></div>`, `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" id="gc-save">${icon('gift', 14)} Create</button>`));
        U.$('#gc-save').addEventListener('click', async () => {
          const value = Number(U.$('input[name="gv"]:checked')?.value || 500);
          const expiresAt = U.$('#gc-exp').value || '';
          const r = await apiPost('/admin/giftcards', { value, expiresAt });
          if (r && r.giftCard) { toast('Gift card ' + r.giftCard.code + ' created 🎁', 'success'); }
          else { items.unshift({ id: 'new' + Date.now(), code: 'GIFT' + Math.floor(1000 + Math.random() * 9000), value, balance: value, expiresAt, status: 'active' }); toast('Gift card created (demo) 🎁', 'success'); }
          closeModal(); reload();
        });
      }
      if (act === 'gift-toggle') {
        const g = items.find(x => String(x.id) === String(btn.dataset.id));
        if (!g) return;
        const next = g.status === 'active' ? 'expired' : 'active';
        const r = await apiPatch('/admin/giftcards/' + g.id, { status: next });
        if (!r || !r.giftCard) g.status = next;
        toast('Gift card ' + g.code + ' → ' + next + ' ✅'); reload();
      }
      if (act === 'gift-del') {
        if (!confirm('Delete gift card?')) return;
        await apiDelete('/admin/giftcards/' + btn.dataset.id);
        toast('Gift card deleted 🗑️'); reload();
      }
      if (act === 'plan-edit') {
        const p = items.find(x => String(x.id) === String(btn.dataset.id));
        if (!p) return;
        openModal(modalShell('Edit plan — ' + esc(p.name), `
          <div class="field"><label class="label">Monthly price (₹)</label><input class="input" id="pl-price" type="number" value="${p.price}"></div>
          <label style="display:flex;gap:8px;align-items:center;font-size:13px;font-weight:600;margin:10px 0"><input type="checkbox" id="pl-feat" ${p.featured ? 'checked' : ''}> Featured / flagship</label>
          <div class="field"><label class="label">Perks (one per line)</label><textarea class="textarea" id="pl-perks" rows="4">${esc((p.perks || []).join('\n'))}</textarea></div>`,
          `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" id="pl-save">${icon('save', 14)} Save plan</button>`));
        U.$('#pl-save').addEventListener('click', async () => {
          const patch = { price: Number(U.$('#pl-price').value || 0), featured: U.$('#pl-feat').checked, perks: U.$('#pl-perks').value.split('\n').map(s => s.trim()).filter(Boolean) };
          const r = await apiPatch('/admin/plans/' + encodeURIComponent(p.id), patch);
          if (r && r.plan) toast('Plan updated ✅', 'success'); else { Object.assign(p, patch); toast('Plan updated (demo) ✅', 'success'); }
          closeModal(); reload();
        });
      }
      if (act === 'plan-toggle') {
        const p = items.find(x => String(x.id) === String(btn.dataset.id));
        if (!p) return;
        const next = p.active === false;
        const r = await apiPatch('/admin/plans/' + encodeURIComponent(p.id), { active: next });
        if (!r || !r.plan) p.active = next;
        toast(p.name + (next ? ' activated' : ' paused') + ' ✅'); reload();
      }
      if (act === 'ticket-view') {
        const t = items.find(x => String(x.id) === String(btn.dataset.id));
        if (!t) return;
        const msgs = (t.messages || []).map(m => `<div class="msg ${m.from === 'admin' ? 'me' : 'them'}" style="align-self:${m.from === 'admin' ? 'flex-end' : 'flex-start'}">${esc(m.text)}<span class="m-time">${timeAgo(m.createdAt)}</span></div>`).join('') || '<div class="small muted center">No messages yet</div>';
        openModal(modalShell('Ticket ' + t.id + ' — ' + esc(t.subject), `
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><span class="badge badge-neutral">${esc(t.customerName || 'Customer')}</span><span class="badge badge-neutral">${esc(t.category || 'other')}</span>${statusChip(t.status, { open: 'badge-warn', 'in-progress': 'badge-primary', resolved: 'badge-success', closed: 'badge-neutral' })}</div>
          <div class="chat-body" style="max-height:220px;border:1px solid var(--line);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px;overflow-y:auto">${msgs}</div>
          <div class="chat-input-row" style="padding:12px 0 0"><input class="input" id="tk-reply" placeholder="Type a reply…"><button class="btn btn-primary" id="tk-send">${icon('send', 0)}</button></div>
          <div style="display:flex;gap:8px;margin-top:14px"><button class="btn btn-success btn-sm" style="flex:1" id="tk-resolve">${icon('check', 13)} Mark resolved</button><button class="btn btn-outline btn-sm" style="flex:1" data-act="close-modal">Close</button></div>`));
        const send = async () => {
          const text = (U.$('#tk-reply')?.value || '').trim();
          if (!text) return;
          const r = await apiPost('/admin/tickets/' + t.id + '/reply', { text });
          if (r && r.ticket) { toast('Reply sent ✅', 'success'); } else { t.messages = t.messages || []; t.messages.push({ from: 'admin', text, createdAt: Date.now() }); t.status = 'in-progress'; toast('Reply sent (demo) ✅', 'success'); }
          closeModal(); reload();
        };
        U.$('#tk-send').addEventListener('click', send);
        U.$('#tk-reply').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
        U.$('#tk-resolve').addEventListener('click', async () => {
          const r = await apiPatch('/admin/tickets/' + t.id, { status: 'resolved' });
          if (r && r.ticket) toast('Ticket resolved 🎉', 'success'); else { t.status = 'resolved'; toast('Ticket resolved (demo) 🎉', 'success'); }
          closeModal(); reload();
        });
      }
      if (act === 'review-view') {
        const r = items.find(x => String(x.id) === String(btn.dataset.id));
        if (!r) return;
        openModal(modalShell('Review by ' + esc(r.customerName || 'Customer'), `
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">${avatar(r.customerName || 'Customer', 40)}<div><b style="font-size:14px">${esc(r.customerName || 'Customer')}</b><div style="margin-top:2px">${stars(r.rating)}</div></div><span class="badge badge-neutral" style="margin-left:auto">${esc(r.serviceName || '—')}</span></div>
          <p class="small" style="line-height:1.65">${esc(r.text || 'No text')}</p>
          <div style="display:flex;gap:8px;margin-top:14px">${r.verified ? '<span class="badge badge-success">Verified customer</span>' : '<span class="badge badge-neutral">Unverified</span>'}<span class="badge badge-neutral">${r.helpful || 0} helpful votes</span></div>`,
          `<button class="btn btn-ghost" data-act="close-modal">Close</button>${r.status !== 'published' ? `<button class="btn btn-success" data-mgr-act="review-approve" data-id="${r.id}" data-inmodal="1">${icon('check', 13)} Approve</button>` : ''}`));
        const appBtn = U.$('[data-mgr-act="review-approve"][data-inmodal]');
        if (appBtn) appBtn.addEventListener('click', async () => {
          const rr = await apiPatch('/admin/reviews/' + r.id, { status: 'published' });
          if (rr && rr.review) toast('Review approved ✅', 'success'); else { r.status = 'published'; toast('Review approved (demo) ✅', 'success'); }
          closeModal(); reload();
        });
      }
      if (act === 'review-approve') {
        const r = items.find(x => String(x.id) === String(btn.dataset.id));
        if (!r) return;
        const rr = await apiPatch('/admin/reviews/' + r.id, { status: 'published' });
        if (rr && rr.review) toast('Review approved ✅', 'success'); else { r.status = 'published'; toast('Review approved (demo) ✅', 'success'); }
        reload();
      }
      if (act === 'review-hide') {
        const r = items.find(x => String(x.id) === String(btn.dataset.id));
        if (!r) return;
        const rr = await apiPatch('/admin/reviews/' + r.id, { status: 'hidden' });
        if (rr && rr.review) toast('Review hidden 👁️‍🗨️', 'success'); else { r.status = 'hidden'; toast('Review hidden (demo) 👁️‍🗨️', 'success'); }
        reload();
      }
      if (act === 'review-del') {
        const r = items.find(x => String(x.id) === String(btn.dataset.id));
        if (!r) return;
        if (!confirm('Permanently remove this review?')) return;
        await apiDelete('/admin/reviews/' + r.id);
        toast('Review removed 🗑️'); reload();
      }
    });
  };

  const render = (params) => {
    const tab = params.tab || 'overview';
    if (!Store.isLoggedIn() || Store.currentUser()?.role !== 'admin') { location.hash = '#/admin-login'; return { html: '', wire: null }; }
    if (!tabs[tab]) return { html: layout('overview', tabs.overview()), wire: () => {} };
    const html = layout(tab, tabs[tab]());
    const wire = () => {
      wireTableSearch(document); U.observeReveals(); setTimeout(animateBars, 120);
      if (tab === 'monitor') startMonitor();
      if (MANAGED.includes(tab)) managedLoad(tab);
    };
    return { html, wire };
  };

  let monIv = null;
  const startMonitor = () => {
    clearInterval(monIv);
    monIv = setInterval(() => {
      U.$$('[data-live]').forEach(card => {
        const b = Store.bookingById(card.dataset.live);
        if (!b) return;
        const pill = U.$('[data-live-pill]', card);
        if (pill) pill.innerHTML = statusPill(b.status);
      });
      const cnt = U.$('#live-count');
      if (cnt) cnt.textContent = Store.state.bookings.filter(x => !['cancelled', 'paid', 'rated'].includes(x.status)).length;
    }, 4000);
  };

  return { render, clearMonitor: () => clearInterval(monIv) };
})();
