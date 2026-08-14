/* ============ SERVEHUB PROFESSIONAL DASHBOARD ============ */
window.Pro = (() => {
  const { icon, money, esc, stars, avatar, toast, openModal, closeModal, modalShell, fmtDate, fmtTime, timeAgo, statusPill, areaChart, barChart, animateBars } = U;
  const u = () => Store.currentUser() || {};

  const TABS = [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'today', label: "Today's Jobs", icon: 'zap' },
    { id: 'upcoming', label: 'Upcoming', icon: 'calendar' },
    { id: 'completed', label: 'Completed', icon: 'checkCircle' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'availability', label: 'Availability', icon: 'clock' },
    { id: 'income', label: 'Income', icon: 'lineChart' },
    { id: 'wallet', label: 'Wallet & Withdraw', icon: 'wallet' },
    { id: 'analytics', label: 'Analytics', icon: 'barChart' },
    { id: 'ratings', label: 'Ratings', icon: 'star' },
    { id: 'documents', label: 'Documents & KYC', icon: 'doc' },
    { id: 'training', label: 'Training Center', icon: 'graduation' },
    { id: 'support', label: 'Support', icon: 'headset' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
  ];

  const proName = () => u().name || 'Rahul Sharma';
  const proMeta = () => ({ rating: 4.9, jobs: 1240, exp: 8, completion: 98 });

  const sideNav = active => `
    <div class="side-user">${avatar(proName(), 44)}<div style="min-width:0"><b style="font-size:14px">${esc(proName())}</b><div class="xsmall muted">Professional • ★ ${proMeta().rating}</div></div></div>
    <nav class="side-nav">
      <div class="side-group">Work</div>
      ${TABS.slice(0, 6).map(t => `<a class="side-link ${active === t.id ? 'active' : ''}" href="#/pro/${t.id}">${icon(t.icon, 18)}<span>${t.label}</span></a>`).join('')}
      <div class="side-group">Earnings</div>
      ${TABS.slice(6, 9).map(t => `<a class="side-link ${active === t.id ? 'active' : ''}" href="#/pro/${t.id}">${icon(t.icon, 18)}<span>${t.label}</span></a>`).join('')}
      <div class="side-group">Growth</div>
      ${TABS.slice(9, 12).map(t => `<a class="side-link ${active === t.id ? 'active' : ''}" href="#/pro/${t.id}">${icon(t.icon, 18)}<span>${t.label}</span></a>`).join('')}
      <div class="side-group">Support</div>
      ${TABS.slice(12).map(t => `<a class="side-link ${active === t.id ? 'active' : ''}" href="#/pro/${t.id}">${icon(t.icon, 18)}<span>${t.label}</span></a>`).join('')}
    </nav>
    <a class="btn btn-outline btn-sm btn-block" href="#/dashboard/overview">${icon('user', 15)} Customer view</a>
    <button class="btn btn-outline btn-sm btn-block" style="margin-top:8px" data-act="logout">${icon('logout', 15)} Log out</button>`;

  const mobileNav = (active) => `<nav class="mobile-dash-nav" aria-label="Dashboard sections">${TABS.map(t => `<a class="m-dash-link ${active === t.id ? 'active' : ''}" href="#/pro/${t.id}">${icon(t.icon, 15)} ${t.label}</a>`).join('')}</nav>`;

  const layout = (active, inner) => `
    <div class="layout"><aside class="sidebar">${sideNav(active)}</aside>
    <main class="main">${mobileNav(active)}<div class="main-head"><div><h2>${(TABS.find(t => t.id === active) || {}).label || 'Dashboard'}</h2><div class="greet">${esc(proName())} • ${active === 'today' ? 'Ready for a busy day?' : 'Here is your work overview'}</div></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><span class="badge badge-success"><span class="status-dot dot-green"></span>Available</span><span class="badge badge-primary">${icon('navigation', 12)} GPS on</span></div></div>
    ${pendingBanner()}
    <div id="tab-body">${inner}</div></main></div>`;

  const pendingBanner = () => {
    const app = Store.state.proApps.find(a => a.id === u().appId);
    if (!app || app.status !== 'pending') return '';
    return `<div class="card" style="padding:18px;margin-bottom:22px;background:var(--warn-50);border-color:var(--warn-100);display:flex;gap:14px;align-items:center;flex-wrap:wrap">
      <span class="n-ic" style="width:44px;height:44px;border-radius:13px;background:var(--warn);color:#fff;display:grid;place-items:center">${icon('timer', 20)}</span>
      <div style="flex:1;min-width:200px"><b style="font-size:14px">Application ${app.id} under review</b><div class="small muted">Our team is verifying your documents. This usually takes under 48 hours — you can explore the dashboard meanwhile.</div></div>
      <span class="badge badge-warn">In review</span></div>`;
  };

  const jobs = () => Store.state.bookings;
  const todayJobs = () => jobs().filter(b => { const d = new Date(b.date); const n = new Date(); return d.toDateString() === n.toDateString() && !['cancelled'].includes(b.status); });
  const upcomingJobs = () => jobs().filter(b => new Date(b.date) > new Date(new Date().setHours(0, 0, 0, 0)) && !['cancelled'].includes(b.status));
  const completedJobs = () => jobs().filter(b => ['paid', 'rated'].includes(b.status));
  const activeJobs = () => jobs().filter(b => !['cancelled', 'paid', 'rated'].includes(b.status));

  const jobCard = (b, { showActions = false } = {}) => `
    <div class="card" style="padding:20px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
        <div style="display:flex;gap:12px;align-items:center">${avatar(Store.currentUser()?.name || 'Customer', 42)}<div><b style="font-size:14px">${esc(Store.currentUser()?.name || 'Customer')}</b><div class="small muted">${b.id} • ${esc(b.serviceName)}</div></div></div>
        ${statusPill(b.status)}
      </div>
      <div style="display:flex;gap:18px;margin:14px 0;flex-wrap:wrap">
        <span style="display:flex;gap:6px;align-items:center;font-size:13px;font-weight:600">${icon('calendar', 15)} ${fmtDate(b.date)}</span>
        <span style="display:flex;gap:6px;align-items:center;font-size:13px;font-weight:600">${icon('clock', 15)} ${b.time}</span>
        <span style="display:flex;gap:6px;align-items:center;font-size:13px;font-weight:600">${icon('pin', 15)} ${esc(b.address.split(',')[0])}</span>
        <span style="display:flex;gap:6px;align-items:center;font-size:13px;font-weight:700;color:var(--success-600)">${icon('wallet', 15)} ${money(b.total)}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${showActions && b.status === 'confirmed' ? `<button class="btn btn-success btn-sm" data-act="accept-job" data-id="${b.id}">${icon('check', 14)} Accept booking</button><button class="btn btn-danger btn-sm" data-act="reject-job" data-id="${b.id}">${icon('x', 14)} Reject</button>` : ''}
        ${showActions && b.status === 'started' ? `<button class="btn btn-cta btn-sm" data-act="complete-job" data-id="${b.id}">${icon('checkCircle', 14)} Mark completed</button>` : ''}
        <button class="btn btn-outline btn-sm" data-act="call-cust" data-id="${b.id}">${icon('phone', 14)} Call</button>
        <button class="btn btn-outline btn-sm" data-act="chat-focus" data-id="${b.id}">${icon('chat', 14)} Chat</button>
        <button class="btn btn-outline btn-sm" data-act="navigate" data-id="${b.id}">${icon('navigation', 14)} Navigate</button>
        ${showActions ? `<a class="btn btn-soft btn-sm" href="#/track/${b.id}">${icon('eye', 14)} View</a>` : ''}
      </div>
    </div>`;

  const tabs = {
    overview() {
      const doneJobs = completedJobs();
      const t = todayJobs().length, up = upcomingJobs().length, done = doneJobs.length;
      const earnings = doneJobs.reduce((a, b) => a + (b.total || 0), 0);
      return `
      <div class="stat-grid">
        ${[['zap', "Today's jobs", t, 'linear-gradient(135deg,#F59E0B,#F97316)'], ['calendar', 'Upcoming', up, 'linear-gradient(135deg,#2563EB,#0EA5E9)'], ['checkCircle', 'Completed', done, 'linear-gradient(135deg,#10B981,#14B8A6)'], ['wallet', 'Earnings', money(earnings), 'linear-gradient(135deg,#8B5CF6,#EC4899)']].map(s => `
          <div class="card stat-card"><div class="st-top"><span class="st-ic" style="background:${s[3]}">${icon(s[0], 19)}</span><span class="badge badge-success">${icon('trendingUp', 12)} +${8 + s[2] * 3}%</span></div><div class="st-val" data-count="${s[2]}">0</div><div class="st-lbl">${s[1]}</div></div>`).join('')}
      </div>
      <div class="grid" style="grid-template-columns:1.5fr 1fr;gap:24px;align-items:start">
        <div><div class="sec-head" style="margin-bottom:14px"><div><h3 style="font-size:16px">Upcoming jobs</h3></div><a class="btn btn-ghost btn-sm" href="#/pro/upcoming">View all</a></div>
        ${upcomingJobs().slice(0, 3).map(b => jobCard(b)).join('') || `<div class="tbl-wrap"><div class="tbl-empty">${icon('calendar', 28)} No upcoming jobs — your availability is open for bookings.</div></div>`}</div>
        <div style="display:flex;flex-direction:column;gap:20px">
          <div class="card" style="padding:20px"><h3 style="font-size:15px;margin-bottom:12px">Weekly earnings</h3>${barChart([4200, 5100, 4600, 6900, 5800, 7600, 8200], ['M', 'T', 'W', 'T', 'F', 'S', 'S'])}</div>
          <div class="card" style="padding:20px"><h3 style="font-size:15px;margin-bottom:12px">Performance</h3>
            ${[['Completion rate', proMeta().completion + '%', 'linear-gradient(135deg,#10B981,#14B8A6)'], ['Avg. rating', proMeta().rating + ' ★', 'linear-gradient(135deg,#F59E0B,#FBBF24)'], ['Response time', '4 min', 'linear-gradient(135deg,#2563EB,#0EA5E9)']].map(p => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--line-2)"><span class="small muted" style="font-weight:600">${p[0]}</span><span class="badge" style="background:var(--surface-2);color:var(--ink)">${p[1]}</span></div>`).join('')}
          </div>
        </div>
      </div>`;
    },
    today() {
      const list = todayJobs();
      return `<div class="sec-head" style="margin-bottom:16px"><div><h3 style="font-size:16px">${list.length} job${list.length === 1 ? '' : 's'} scheduled today</h3><p class="small muted">Keep your availability green to receive more bookings.</p></div><button class="btn btn-soft btn-sm" data-act="set-available">${icon('toggle', 0)} Toggle availability</button></div>
      ${list.map(b => jobCard(b, { showActions: true })).join('') || `<div class="tbl-wrap"><div class="tbl-empty"><div class="e-ic" style="width:64px;height:64px;border-radius:18px;background:var(--surface-2);display:grid;place-items:center;margin:0 auto 12px;color:var(--ink-4)">${icon('zap', 26)}</div><b>No jobs today</b><p class="small muted">Enjoy the free day — or check tomorrow's schedule.</p></div></div>`}`;
    },
    upcoming() {
      const list = upcomingJobs();
      return `${list.map(b => jobCard(b, { showActions: true })).join('') || `<div class="tbl-wrap"><div class="tbl-empty">${icon('calendar', 28)} No upcoming bookings.</div></div>`}`;
    },
    completed() {
      const list = completedJobs();
      return `<div class="tbl-wrap"><div class="tbl-scroll"><table><thead><tr><th>Job</th><th>Service</th><th>Date</th><th>Amount</th><th>Rating</th><th></th></tr></thead><tbody>
      ${list.map(b => `<tr><td><b>${b.id}</b><div class="xsmall muted">${esc(b.pack)} • ${esc(b.dur)}</div></td><td>${esc(b.serviceName)}</td><td>${fmtDate(b.date)}</td><td><b>${money(b.total)}</b></td><td>${b.rating ? stars(b.rating) : '<span class="small muted">—</span>'}</td><td><div class="row-actions"><a class="mini-btn blue" href="#/invoice/${b.id}" title="View invoice">${icon('file', 14)}</a><a class="mini-btn" href="#/book/${b.serviceId}" title="View service">${icon('eye', 14)}</a></div></td></tr>`).join('') || `<tr><td colspan="6"><div class="tbl-empty">${icon('checkCircle', 28)} No completed jobs yet.</div></td></tr>`}
      </tbody></table></div></div>`;
    },
    calendar() {
      const now = new Date();
      const y = now.getFullYear(), m = now.getMonth();
      const first = new Date(y, m, 1).getDay();
      const days = new Date(y, m + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < first; i++) cells.push('<div class="cal-day other"></div>');
      for (let d = 1; d <= days; d++) {
        const ts = new Date(y, m, d).getTime();
        const bkCount = jobs().filter(b => { const bd = new Date(b.date); return bd.getFullYear() === y && bd.getMonth() === m && bd.getDate() === d && !['cancelled'].includes(b.status); }).length;
        cells.push(`<div class="cal-day ${d === now.getDate() ? 'today' : ''}" title="${bkCount} job${bkCount === 1 ? '' : 's'}"><span>${d}</span>${bkCount ? `<span class="j-dots">${Array(Math.min(bkCount, 3)).fill('<i class="j-dot"></i>').join('')}</span>` : ''}</div>`);
      }
      return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px">
        <b style="font-size:17px">${now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</b>
        <div style="display:flex;gap:8px"><button class="btn btn-outline btn-sm" data-act="toast" data-msg="Previous month">${icon('arrowLeft', 14)}</button><button class="btn btn-outline btn-sm" data-act="toast" data-msg="Next month">${icon('arrowRight', 14)}</button></div>
      </div>
      <div class="card" style="padding:18px"><div class="cal-grid">
        ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="cal-dow">${d}</div>`).join('')}
        ${cells.join('')}
      </div>
      <div class="small muted" style="margin-top:14px;display:flex;gap:16px;align-items:center"><span class="status-dot dot-blue"></span>Today <span class="status-dot dot-green"></span>Jobs scheduled <span class="status-dot dot-gray"></span>Off day</div></div>`;
    },
    availability() {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return `
      <div class="card" style="padding:24px;margin-bottom:20px">
        <h3 style="font-size:16px;margin-bottom:6px">Weekly availability</h3><p class="small muted" style="margin-bottom:16px">Customers can only book slots you mark available.</p>
        <div style="display:flex;flex-direction:column;gap:10px" id="avail-days">
          ${days.map((d, i) => `<div style="display:flex;align-items:center;gap:14px;padding:12px;border:1px solid var(--line-2);border-radius:12px;background:var(--surface)">
            <label class="switch"><input type="checkbox" data-day="${i}" ${i < 6 ? 'checked' : ''}><span class="trk"></span></label>
            <b style="width:100px;font-size:13.5px">${d}</b>
            <span class="small muted">${i < 6 ? '09:00 AM – 07:00 PM' : 'Not working'}</span>
          </div>`).join('')}
        </div>
        <button class="btn btn-primary" style="margin-top:16px" data-act="save-avail">${icon('save', 14)} Save availability</button>
      </div>
      <div class="card" style="padding:24px">
        <h3 style="font-size:16px;margin-bottom:6px">Break / off days</h3><p class="small muted" style="margin-bottom:14px">Block dates when you are unavailable (e.g. holidays).</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><input class="input" type="date" style="max-width:200px"><button class="btn btn-outline" data-act="toast" data-msg="Off day added to your calendar 🗓️">${icon('plus', 14)} Add off day</button></div>
      </div>`;
    },
    income() {
      const done = completedJobs();
      const monthly = [18200, 21400, 19800, 24600, 22800, 27900, 26400, 31200, 29800, 34200, 33100, 38400];
      return `
      <div class="card" style="padding:24px;margin-bottom:20px">
        <div class="cc-head"><div><h3>Income — last 12 months</h3><div class="cc-sub">Total earned: ${money(monthly.reduce((a, b) => a + b, 0))}</div></div><span class="badge badge-success">${icon('trendingUp', 12)} +12.4% YoY</span></div>
        ${areaChart(monthly, { color: '#10B981', labels: ['S', 'O', 'N', 'D', 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A'] })}
      </div>
      <div class="tbl-wrap"><div class="tbl-tools"><b style="font-size:14px">Earnings breakdown</b></div>
      ${done.slice(0, 8).map(b => `<div class="list-row"><span class="n-ic" style="width:40px;height:40px;border-radius:12px;background:var(--success-50);color:var(--success-600);display:grid;place-items:center">${icon('briefcase', 17)}</span><div style="flex:1;min-width:0"><b style="font-size:13.5px">${esc(b.serviceName)}</b><div class="xsmall muted">${b.id} • ${fmtDate(b.date)} • ${b.pack}</div></div><b style="color:var(--success-600)">+${money(b.total)}</b></div>`).join('') || `<div class="tbl-empty">Complete jobs to see earnings here.</div>`}
      </div>`;
    },
    wallet() {
      return `
      <div class="card" style="padding:28px;margin-bottom:20px;background:linear-gradient(135deg,#0F172A,#065F46);color:#fff;border:none;position:relative;overflow:hidden">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(16,185,129,.4),transparent 70%)"></div>
        <div class="small" style="opacity:.8;display:flex;gap:8px;align-items:center">${icon('wallet', 15)} Earnings wallet</div>
        <div style="font-size:44px;font-weight:900;margin:10px 0 4px">${money(Store.state.wallet + 12480)}</div>
        <div class="small" style="opacity:.8">Including ${money(12480)} settled from completed jobs</div>
        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap"><button class="btn btn-sm" style="background:#fff;color:#065F46" data-act="withdraw-pro">${icon('download', 14)} Withdraw earnings</button><button class="btn btn-sm" style="background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.3)" data-act="toast" data-msg="Statement sent to your email 📩">${icon('file', 14)} Statement</button></div>
      </div>
      <div class="grid" style="grid-template-columns:1.4fr .6fr;gap:24px;align-items:start">
        <div class="tbl-wrap"><div class="tbl-tools"><b style="font-size:14px">Withdrawal history</b><span class="badge badge-neutral">Next payout: Fri</span></div>
        ${Store.state.withdrawals.map(w => `<div class="list-row"><span class="n-ic" style="width:40px;height:40px;border-radius:12px;background:var(--primary-50);color:var(--primary-600);display:grid;place-items:center">${icon('bank', 17)}</span><div style="flex:1;min-width:0"><b style="font-size:13.5px">${money(w.amount)} to ${esc(w.bank)}</b><div class="xsmall muted">${w.id} • ${fmtDate(w.ts)}</div></div><span class="badge badge-success">${w.status}</span></div>`).join('') || `<div class="tbl-empty">${icon('bank', 26)} No withdrawals yet — withdraw your earnings anytime.</div>`}</div>
        <div class="card" style="padding:22px"><h3 style="font-size:15px;margin-bottom:12px">Payout info</h3><p class="small muted" style="margin-bottom:12px">Earnings settle every Friday. Withdrawals hit your bank within 1 business day.</p><div class="sum-row"><span class="muted">Settlement fee</span><b>Free</b></div><div class="sum-row"><span class="muted">Min. withdrawal</span><b>${money(500)}</b></div><div class="sum-row"><span class="muted">Bank</span><b>HDFC ****1234</b></div></div>
      </div>`;
    },
    analytics() {
      const completion = proMeta().completion, rating = proMeta().rating;
      return `
      <div class="stat-grid">
        ${[['activity', 'Completion rate', completion + '%', 'linear-gradient(135deg,#10B981,#14B8A6)'], ['star', 'Average rating', rating + ' ★', 'linear-gradient(135deg,#F59E0B,#FBBF24)'], ['clock', 'Avg. response', '4 min', 'linear-gradient(135deg,#2563EB,#0EA5E9)'], ['users', 'Repeat customers', '68%', 'linear-gradient(135deg,#8B5CF6,#EC4899)']].map(s => `<div class="card stat-card"><div class="st-top"><span class="st-ic" style="background:${s[3]}">${icon(s[0], 19)}</span></div><div class="st-val">${s[2]}</div><div class="st-lbl">${s[1]}</div></div>`).join('')}
      </div>
      <div class="grid" style="grid-template-columns:1.4fr .6fr;gap:24px;align-items:start">
        <div class="card" style="padding:24px"><div class="cc-head"><div><h3>Bookings per week</h3><div class="cc-sub">+18% vs last month</div></div></div>
          ${barChart([12, 15, 14, 19, 17, 22, 21, 26], ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'])}</div>
        <div class="card" style="padding:24px"><h3 style="font-size:15px;margin-bottom:14px">Rating breakdown</h3>
          ${[5, 4, 3, 2, 1].map((r, i) => { const p = [78, 17, 4, 1, 0][i]; return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:12.5px;font-weight:700;width:18px">${r}★</span><div class="progress"><i style="width:${p}%"></i></div><span class="small muted" style="width:34px">${p}%</span></div>`; }).join('')}
          <div class="card glass" style="padding:14px;margin-top:14px"><b>${money(12800)}</b><div class="xsmall muted">tips received this quarter</div></div>
        </div>
      </div>`;
    },
    ratings() {
      const rated = completedJobs().filter(b => b.rating);
      const canned = [
        { name: 'Ananya R.', r: 5, text: 'Super professional, on time, and did a spotless job. Highly recommended!', d: '2 days ago' },
        { name: 'Mohit A.', r: 5, text: 'Explained everything before starting. Great workmanship.', d: '1 week ago' },
        { name: 'Sara F.', r: 4, text: 'Very skilled. Arrived a little late but the work was excellent.', d: '3 weeks ago' },
      ];
      const list = [...rated.map(b => ({ name: 'Verified customer', r: b.rating, text: b.rateText || '', d: fmtDate(b.date) })), ...canned];
      return `<div class="grid g2" style="grid-template-columns:1fr 1fr">${list.map(x => `
        <div class="card" style="padding:20px"><div style="display:flex;justify-content:space-between;align-items:center"><div style="display:flex;gap:10px;align-items:center">${avatar(x.name, 40)}<div><b style="font-size:13.5px">${esc(x.name)}</b><div class="xsmall muted">${x.d}</div></div></div>${stars(x.r)}</div>
        <p class="small muted" style="margin-top:12px">${esc(x.text) || 'No written review.'}</p>
        <div style="display:flex;gap:8px;margin-top:14px"><button class="btn btn-soft btn-sm" data-act="toast" data-msg="Reply sent to the customer ✅">${icon('chat', 13)} Reply</button><button class="btn btn-ghost btn-sm" data-act="toast" data-msg="Flagged for moderation">${icon('flag', 0)} Report</button></div></div>`).join('')}</div>`;
    },
    documents() {
      const docs = [
        ['Government ID', 'Aadhaar •••• 4567', 'verified', 'success'], ['Police verification', 'Clean record', 'verified', 'success'], ['Skill certificate', 'ITI — Electrical', 'pending', 'warn'], ['Bank details', 'HDFC ****1234', 'verified', 'success'], ['PAN card', 'ABCDE1234F', 'pending', 'warn']];
      return `
      <div class="grid g2" style="grid-template-columns:1fr 1fr;margin-bottom:20px">
        <div class="card" style="padding:22px"><h3 style="font-size:15px;margin-bottom:4px">KYC status</h3><p class="small muted" style="margin-bottom:14px">Complete all steps to unlock instant settlement & priority bookings.</p>
        ${docs.map(d => `<div class="list-row" style="padding:11px 0"><span class="n-ic" style="width:38px;height:38px;border-radius:11px;background:var(--surface-2);color:var(--ink-3);display:grid;place-items:center">${icon('doc', 16)}</span><div style="flex:1"><b style="font-size:13px">${d[0]}</b><div class="xsmall muted">${d[1]}</div></div><span class="badge ${d[3] === 'success' ? 'badge-success' : 'badge-warn'}">${d[2] === 'verified' ? icon('check', 12) + ' Verified' : 'Under review'}</span></div>`).join('')}
        </div>
        <div class="card" style="padding:22px">
          <h3 style="font-size:15px;margin-bottom:12px">Upload a document</h3>
          <label class="upload-zone" for="pd-file"><div class="u-ic">${icon('upload', 20)}</div><b style="font-size:13.5px">Tap to upload</b><div class="xsmall muted" style="margin-top:4px">PDF / image, max 5MB</div><input type="file" id="pd-file" accept="image/*,.pdf" style="display:none"></label>
          <button class="btn btn-outline btn-block" style="margin-top:12px" data-act="toast" data-msg="Document uploaded — under review ✅">${icon('upload', 14)} Upload & submit</button>
          <div class="card glass" style="padding:14px;margin-top:16px;font-size:12.5px"><b>${icon('info', 13)} Tip:</b> <span class="muted">Uploading your degree/ITI certificate can increase your hourly rate by up to 20%.</span></div>
        </div>
      </div>`;
    },
    training() {
      const courses = [
        ['Spark', 'AC Servicing Masterclass', '12 lessons', 80, 'linear-gradient(135deg,#2563EB,#0EA5E9)'], ['shield', 'Customer Safety & Hygiene', '6 lessons', 100, 'linear-gradient(135deg,#10B981,#14B8A6)'], ['zap', 'Electrical Safety Basics', '8 lessons', 60, 'linear-gradient(135deg,#F59E0B,#F97316)'], ['crown', 'Premium Service Upselling', '5 lessons', 0, 'linear-gradient(135deg,#8B5CF6,#EC4899)'], ['wallet', 'Financial Planning for Pros', '4 lessons', 0, 'linear-gradient(135deg,#0EA5E9,#6366F1)']];
      return `
      <div class="card" style="padding:22px;margin-bottom:20px;background:var(--grad-soft);border-color:var(--primary-100);display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <span class="n-ic" style="width:48px;height:48px;border-radius:14px;background:var(--grad);color:#fff;display:grid;place-items:center">${icon('graduation', 22)}</span>
        <div style="flex:1;min-width:200px"><b style="font-size:15px">Training Center</b><div class="small muted">Free courses that boost your earnings. Completing a course adds a verified badge to your profile.</div></div>
        <span class="badge badge-primary">3 badges unlocked</span>
      </div>
      ${courses.map(c => `
        <div class="card card-hover course-card" style="margin-bottom:12px"><span class="co-ic" style="background:${c[4]}">${icon(c[0], 22)}</span>
        <div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;gap:10px"><b style="font-size:14.5px">${c[1]}</b><span class="small muted">${c[2]}</span></div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:8px"><div class="progress"><i style="width:${c[3]}%"></i></div><b style="font-size:12.5px;color:${c[3] === 100 ? 'var(--success-600)' : 'var(--primary-600)'}">${c[3]}%</b></div></div>
        <button class="btn ${c[3] === 100 ? 'btn-success' : 'btn-soft'} btn-sm" data-act="train" data-c="${esc(c[1])}" data-p="${c[3]}">${c[3] === 100 ? icon('check', 13) + ' Done' : c[3] > 0 ? 'Continue' : 'Start'}</button></div>`).join('')}`;
    },
    support() {
      return `
      <div class="grid" style="grid-template-columns:1.2fr .8fr;gap:24px;align-items:start">
        <div class="tbl-wrap"><div class="tbl-tools"><b style="font-size:14px">My tickets</b><span class="badge badge-success">Priority support for pros</span></div>
        ${Store.state.tickets.map(t => `<div class="list-row"><span class="n-ic" style="width:40px;height:40px;border-radius:12px;background:var(--primary-50);color:var(--primary-600);display:grid;place-items:center">${icon('headset', 17)}</span><div style="flex:1;min-width:0"><b style="font-size:13.5px">${esc(t.subject)}</b><div class="xsmall muted">${t.id} • ${timeAgo(t.createdAt)}</div></div><span class="badge ${t.status === 'open' ? 'badge-warn' : 'badge-success'}">${t.status === 'open' ? 'Open' : 'Resolved'}</span></div>`).join('') || `<div class="tbl-empty">${icon('headset', 26)} No tickets raised yet.</div>`}</div>
        <div class="card" style="padding:24px"><h3 style="font-size:15px;margin-bottom:12px">Raise a ticket</h3>
          <div class="field"><label class="label">Category</label><select class="select" id="pk-cat"><option>Payment issue</option><option>Booking support</option><option>Equipment & tools</option><option>Customer dispute</option><option>Other</option></select></div>
          <div class="field"><label class="label" for="pk-sub">Subject</label><input class="input" id="pk-sub" placeholder="What happened?"></div>
          <div class="field"><label class="label" for="pk-msg">Details</label><textarea class="textarea" id="pk-msg" placeholder="Describe the issue…"></textarea></div>
          <button class="btn btn-primary btn-block" data-act="new-ticket">${icon('plus', 15)} Create ticket</button>
          <button class="btn btn-outline btn-block" style="margin-top:8px" data-act="chat-popup">${icon('chat', 15)} Chat with support</button></div>
      </div>`;
    },
    notifications() {
      return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><span class="small muted">${Store.state.notifs.length} notifications</span><button class="btn btn-ghost btn-sm" data-act="read-all">${icon('check', 14)} Mark all read</button></div>
      <div class="tbl-wrap">${Store.state.notifs.map(n => `<div class="notif-item ${n.read ? '' : 'unread'}"><span class="n-ic" style="background:linear-gradient(135deg,#2563EB,#0EA5E9);color:#fff">${icon(n.icon, 17)}</span><div style="flex:1"><b style="font-size:13.5px">${esc(n.title)}</b><p class="small muted">${esc(n.msg)}</p><div class="n-time">${timeAgo(n.time)}</div></div></div>`).join('') || `<div class="tbl-empty">${icon('bell', 26)} No notifications yet.</div>`}</div>`;
    },
  };

  const render = (params) => {
    const tab = params.tab || 'overview';
    if (!Store.isLoggedIn()) { location.hash = '#/login'; return { html: '', wire: null }; }
    if (u().role === 'admin') { location.hash = '#/admin/overview'; return { html: '', wire: null }; }
    if (u().role !== 'pro') { location.hash = '#/dashboard/overview'; return { html: '', wire: null }; }
    if (!tabs[tab]) return { html: layout('overview', tabs.overview()), wire: () => {} };
    const html = layout(tab, tabs[tab]());
    const wire = () => { U.$$('[data-count]').forEach(el => U.countUp(el, Number(el.dataset.count))); U.observeReveals(); setTimeout(animateBars, 120); };
    return { html, wire };
  };

  return { render };
})();
