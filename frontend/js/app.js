/* ============ SERVEHUB APP SHELL: router, layouts, global actions ============ */
(() => {
  const { icon, money, esc, avatar, toast, openModal, closeModal, modalShell } = U;
  const app = document.getElementById('app');

  /* ---------------- I18N ---------------- */
  const I18N = {
    en: { hero: 'Home services, booked in seconds.', book: 'Book Now', search: 'Search', login: 'Log in', join: 'Join as professional' },
    hi: { hero: 'घर की सेवाएँ, सेकंडों में बुक करें।', book: 'अभी बुक करें', search: 'खोजें', login: 'लॉग इन', join: 'प्रोफेशनल बनें' },
  };
  const t = k => { const d = I18N[Store.state.lang] || I18N.en; return d[k] || I18N.en[k]; };

  /* ---------------- PUBLIC LAYOUT ---------------- */
  const megaItems = DATA.categories.map(c => `
    <a class="mega-item" href="#/category/${c.slug}"><span class="m-ic" style="background:${c.g}">${icon(c.icon, 16)}</span>${c.name}</a>`).join('');

  const navBar = () => {
    const user = Store.currentUser();
    const dash = user ? (user.role === 'admin' ? '#/admin/overview' : user.role === 'pro' ? '#/pro/overview' : '#/dashboard/overview') : '#/login';
    return `
    <header class="navbar" id="navbar">
      <div class="nav-inner">
        <a class="logo" href="#/"><span class="logo-mark">${icon('zap', 20)}</span>Serve<b>hub</b></a>
        <nav class="nav-links" aria-label="Main">
          <a class="nav-link ${route === '' ? 'active' : ''}" href="#/">Home</a>
          <div class="mega-wrap"><a class="nav-link" href="#/categories">Services ${icon('chevronDown', 14)}</a>
            <div class="mega"><div class="mega-grid">${megaItems}</div>
              <div class="mega-foot"><div><b style="font-size:14px">Need something else?</b><div class="small muted">340+ services across 17 categories</div></div>
              <a class="btn btn-primary btn-sm" href="#/categories">Browse all ${icon('arrowRight', 14)}</a></div></div>
          </div>
          <a class="nav-link" href="#/become-pro">For Professionals</a>
          <a class="nav-link" href="#/blog">Blog</a>
          <a class="nav-link" href="#/help">Support</a>
        </nav>
        <div class="nav-actions">
          <button class="loc-pill nav-hide-m" data-act="location" aria-label="Set your location" title="Set your location">${icon('pin', 15)}<span>${esc(Store.currentLocation().label)}</span>${icon('chevronDown', 12)}</button>
          <button class="icon-btn nav-hide-m" data-act="search" aria-label="Search">${icon('search', 19)}</button>
          <button class="icon-btn nav-hide-m" data-act="install-app" aria-label="Get the app" title="Install the Servehub app">${icon('download', 18)}</button>
          <button class="icon-btn" data-act="theme" aria-label="Toggle theme">${icon(Store.state.theme === 'dark' ? 'sun' : 'moon', 18)}</button>
          <button class="icon-btn" data-act="lang" aria-label="Language">${icon('globe', 18)}<span class="small" style="font-weight:800">${Store.state.lang === 'hi' ? 'हिं' : 'EN'}</span></button>
          ${user ? `<a class="icon-btn" href="${dash}" aria-label="Dashboard" title="Dashboard">${avatar(user.name || 'U', 34)}</a>` : `<a class="btn btn-ghost btn-sm nav-hide-m" href="#/login">${t('login')}</a>`}
          <a class="btn btn-primary btn-sm nav-hide-m" href="#/categories">${icon('calendar', 15)} ${t('book')}</a>
          <button class="icon-btn hamburger" data-act="menu" aria-label="Menu">${icon('menu', 20)}</button>
        </div>
      </div>
      <div class="mobile-menu" id="mobile-menu">
        <a class="m-link active" href="#/">${icon('home', 17)} Home</a>
        <a class="m-link" href="#/categories">${icon('grid', 17)} All services</a>
        <a class="m-link" href="#/become-pro">${icon('briefcase', 17)} For professionals</a>
        <a class="m-link" href="#/blog">${icon('book', 17)} Blog</a>
        <a class="m-link" href="#/help">${icon('headset', 17)} Support</a>
        <a class="m-link" href="#/about">${icon('info', 17)} About us</a>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px">
          ${user ? `<a class="btn btn-primary" href="${dash}">${icon('user', 15)} My dashboard</a>` : `<a class="btn btn-primary" href="#/login">${t('login')}</a>`}
          <a class="btn btn-outline" href="#/categories">${t('book')}</a>
          <button class="btn btn-soft" data-act="install-app" style="grid-column:1/-1">${icon('download', 16)} Install app</button>
        </div>
      </div>
    </header>`;
  };

  const footer = () => `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="logo" href="#/"><span class="logo-mark">${icon('zap', 20)}</span>Serve<b>hub</b></a>
            <p class="f-about">Reliable home services at your doorstep.</p>
            <div class="f-social">
              ${[['globe', 'Website'], ['mail', 'Email'], ['chat', 'WhatsApp'], ['play', 'YouTube']].map(s => `<a href="#/contact" aria-label="${s[1]}" title="${s[1]}">${icon(s[0], 16)}</a>`).join('')}
            </div>
            <form class="newsletter" data-newsletter style="max-width:280px;margin-top:16px"><input class="input" type="email" placeholder="you@example.com" aria-label="Email"><button class="btn btn-primary" type="submit">${icon('arrowRight', 15)}</button></form>
          </div>
          <div><h4>Services</h4><div class="f-links">
            <a href="#/">Home</a>
            <a href="#/categories">All Services</a>
            <a href="#/categories">Book a Service</a>
            ${['Cleaning', 'AC Repair', 'Electrician', 'Plumber'].map(c => { const cat = DATA.categories.find(x => x.name === c); return cat ? `<a href="#/category/${cat.slug}">${c}</a>` : ''; }).join('')}
          </div></div>
          <div><h4>Company</h4><div class="f-links">
            ${[['about', 'About Us'], ['careers', 'Careers'], ['blog', 'Blog'], ['become-pro', 'Become a Professional']].map(l => `<a href="#/${l[0]}">${l[1]}</a>`).join('')}
          </div></div>
          <div><h4>Support</h4><div class="f-links">
            ${[['help', 'Help Center'], ['faq', 'FAQs'], ['contact', 'Contact Us'], ['privacy', 'Privacy Policy'], ['terms', 'Terms & Conditions'], ['refund', 'Refund Policy']].map(l => `<a href="#/${l[0]}">${l[1]}</a>`).join('')}
          </div></div>
          <div>
            <h4>Contact</h4>
            <div class="f-links">
              <a href="tel:+918045678900">${icon('phone', 13)} +91 80 4567 8900</a>
              <a href="tel:+918045678901">${icon('phone', 13)} +91 80 4567 8901</a>
              <a href="mailto:support@servehub.in">${icon('mail', 13)} support@servehub.in</a>
              <a href="#/contact">${icon('pin', 13)} Bengaluru, Karnataka, India</a>
            </div>
            <div class="small muted" style="margin-top:14px;line-height:1.65">Working hours<br><b style="color:var(--ink-2)">Monday – Sunday<br>8:00 AM – 10:00 PM</b></div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 ServeHub. All rights reserved.</span>
          <span style="display:flex;gap:14px;align-items:center">${icon('shieldCheck', 14)} Verified professionals • 100% service warranty</span>
        </div>
      </div>
    </footer>`;

  const floating = () => `
    <div class="floating">
      <button class="fab fab-chat" data-act="chat-popup" aria-label="Chat with support" title="Chat with us">${icon('chat', 22)}<span class="fab-badge">1</span></button>
      <button class="fab fab-main" data-act="search" aria-label="Book a service" title="Book a service"><span class="fab-pulse"></span>${icon('calendar', 22)}</button>
    </div>`;

  const publicLayout = (inner, showFloat = true) => `${navBar()}<main id="outlet" class="page-enter">${inner}</main>${footer()}${showFloat ? floating() : ''}`;

  /* ---------------- SEARCH MODAL ---------------- */
  let searchMode = 'services', searchQ = '', lastResults = { services: [], categories: [], pros: [], cities: [] };
  const openSearch = () => {
    const body = `
      <div class="search-input-row">${icon('search', 20)}<input class="input" id="sm-input" placeholder="Search services, professionals, cities…" aria-label="Search"><button class="icon-btn" id="sm-voice" aria-label="Voice search" title="Voice search">${icon('mic', 18)}</button><button class="icon-btn" data-act="close-modal" aria-label="Close">${icon('x', 18)}</button></div>
      <div class="sm-tabs">${['services', 'professionals', 'cities'].map(m => `<button class="sm-tab ${m === searchMode ? 'active' : ''}" data-sm="${m}">${m[0].toUpperCase() + m.slice(1)}</button>`).join('')}</div>
      <div id="sm-filters" class="filters-row"></div>
      <div class="sm-results" id="sm-results"></div>`;
    openModal(body, { wide: true });
    const svcRow = (s, { desc = false } = {}) => {
      const c = DATA.catBySlug(s.cat);
      return `
      <div class="sm-item" style="display:flex;align-items:center;gap:12px;padding:10px;border-bottom:1px solid var(--line-2)">
        ${s.img
          ? `<img src="${s.img}" alt="${esc(s.name)}" style="width:54px;height:54px;border-radius:12px;object-fit:cover;flex:none" loading="lazy" onerror="this.style.display='none'">`
          : `<span class="sm-ic" style="background:${c?.g}">${icon(c?.icon || 'sparkles', 18)}</span>`}
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px">
            <a href="#/service/${s.id}" class="sm-title" style="font-weight:700;color:var(--ink)" data-act="close-modal">${esc(s.name)}</a>
            ${s.isCheapest ? `<span class="cheapest-badge" style="font-size:10px;padding:2px 7px">💰 Cheapest</span>` : ''}
          </div>
          <span class="sm-sub" style="display:block;font-size:12px;color:var(--ink-3);margin-top:2px">${esc(c?.name || '')} • ${s.rating}★ • ${esc(s.dur)}</span>
          ${desc ? `<div class="sm-desc">${esc(s.desc)}</div>` : ''}
          <span class="sm-price">Starting from <b>${money(s.price)}</b> <span class="xsmall muted">${esc(s.unit)}</span></span>
        </div>
        <a class="btn btn-primary btn-sm" href="#/book/${s.id}" data-act="close-modal">Book Now</a>
      </div>`;
    };
    const render = () => {
      const f = U.$('#sm-filters');
      f.innerHTML = searchMode === 'services' ? `<span class="small muted" style="font-weight:700">Filters:</span>${['Price: Low', 'Rating 4.5+', 'Available today', 'Within 2 km', '5+ yrs exp'].map((x, i) => `<button class="f-chip" data-fc="${i}">${x}</button>`).join('')}` : '';
      const r = U.$('#sm-results');
      if (searchMode === 'services') {
        const list = searchQ ? DATA.searchServices(searchQ) : DATA.searchServices('');
        const items = list.slice(0, 8);
        if (!items.length) {
          const sugg = DATA.trending().slice(0, 3);
          r.innerHTML = `
            <div class="sm-empty">${icon('search', 26)}<p style="margin-top:8px;font-weight:700">No services found for “${esc(searchQ)}”</p><p class="small muted" style="margin-top:4px">Try a different keyword, or check out what's popular right now:</p></div>
            <div style="padding:2px 6px 10px">${sugg.map(s => svcRow(s)).join('')}</div>`;
        } else {
          r.innerHTML = `<div class="small muted" style="padding:4px 8px 8px;font-weight:700">${searchQ ? `Results for “${esc(searchQ)}”` : 'Popular right now'}</div>` + items.map(s => svcRow(s, { desc: true })).join('');
        }
      }
      if (searchMode === 'professionals') {
        const list = lastResults.pros.length ? lastResults.pros : DATA.pros.slice(0, 5);
        r.innerHTML = list.map(p => `
          <a class="sm-item" href="#/service/${DATA.servicesByCat(p.cat)[0]?.id || 's1'}">${avatar(p.name, 40)}<span><span class="sm-title">${esc(p.name)} ${p.verified ? icon('badgeCheck', 13) : ''}</span><span class="sm-sub" style="display:block">${esc(p.role)} • ★ ${p.rating} • ${p.dist} km away • ${p.jobs.toLocaleString('en-IN')} jobs</span></span></a>`).join('') || emptySm('No professionals match your search');
      }
      if (searchMode === 'cities') {
        const list = lastResults.cities.length ? lastResults.cities : DATA.cities.map(c => c.name);
        r.innerHTML = list.map(cn => `<button class="sm-item" style="width:100%;text-align:left" data-city="${esc(cn)}"><span class="sm-ic" style="background:var(--grad)">${icon('pin', 18)}</span><span class="sm-title">${cn}</span></button>`).join('') || emptySm('No cities found');
      }
    };
    render();
    const inp = U.$('#sm-input');
    const doSearch = debounce(() => { searchQ = inp.value; lastResults = DATA.searchAll(searchQ); render(); }, 180);
    inp.addEventListener('input', doSearch);
    U.$$('[data-sm]').forEach(b => b.addEventListener('click', () => { searchMode = b.dataset.sm; U.$$('[data-sm]').forEach(x => x.classList.toggle('active', x === b)); doSearch(); }));
    U.$('#sm-voice').addEventListener('click', () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { toast('Voice search not supported in this browser', 'warn'); return; }
      const rec = new SR(); rec.lang = 'en-IN'; rec.start(); rec.onresult = e => { inp.value = e.results[0][0].transcript; doSearch(); }; toast('Listening… speak now 🎙️', 'info');
    });
    U.$$('[data-fc]').forEach(c => c.addEventListener('click', () => c.classList.toggle('on')));
    U.$('#sm-results').addEventListener('click', e => { const city = e.target.closest('[data-city]'); if (city) { Store.setLocation({ city: city.dataset.city, area: '' }); closeModal(); toast('📍 Location set to ' + Store.currentLocation().label); location.hash = '#/categories'; } });
  };

  /* ---------------- LOCATION MODAL ---------------- */
  const locSuggest = q => {
    q = (q || '').toLowerCase().trim();
    if (!q) return [];
    const out = [];
    DATA.cities.forEach(c => {
      if (c.name.toLowerCase().includes(q)) out.push({ city: c.name, area: '' });
      c.areas.forEach(a => { if (a.toLowerCase().includes(q)) out.push({ city: c.name, area: a }); });
    });
    return out.slice(0, 7);
  };
  const locLabel = o => {
    const c = DATA.cities.find(x => x.name === o.city);
    return o.area ? `${o.area}, ${o.city}` : (c ? `${o.city}, ${c.state}` : o.city);
  };
  const openLocationModal = () => {
    const cur = Store.currentLocation();
    openModal(modalShell('Set your location', `
      <div class="loc-head">
        <div class="loc-current">${icon('pin', 17)}<div><span class="xsmall muted" style="font-weight:600">Current selection</span><b style="font-size:15px;display:block">${esc(cur.label)}</b></div></div>
        <button class="btn btn-soft btn-sm" id="loc-detect">${icon('navigation', 14)} Use my location</button>
      </div>
      <div id="loc-status"></div>
      <div class="field" style="margin-top:16px">
        <label class="label" for="loc-input">Enter your location</label>
        <div class="input-group">${icon('search', 16)}<input class="input input-icon-r" id="loc-input" placeholder="Search city or area… e.g. Indiranagar, Bengaluru"></div>
        <div class="loc-suggest" id="loc-suggest"></div>
      </div>
      <div class="loc-quick">
        <span class="small muted" style="font-weight:700">Popular cities</span>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          ${DATA.cities.slice(0, 6).map(c => `<button class="f-chip" data-loc-city="${esc(c.name)}">${esc(c.name)}</button>`).join('')}
        </div>
      </div>
      <p class="xsmall muted" style="margin-top:16px">${icon('lock', 12)} We only save your city &amp; area for nearby professionals — never your exact coordinates.</p>`));

    const inp = U.$('#loc-input');
    const box = U.$('#loc-suggest');
    const pick = o => {
      Store.setLocation({ city: o.city, area: o.area || '' });
      closeModal();
      toast('📍 Location set to ' + locLabel(o));
      window.App && App.refresh();
    };
    const renderSugg = () => {
      const list = locSuggest(inp.value);
      box.innerHTML = list.length
        ? list.map(o => `<button class="loc-item" data-loc="${esc(locLabel(o))}" data-city="${esc(o.city)}" data-area="${esc(o.area)}">${icon('pin', 15)}<span>${esc(locLabel(o))}</span><span class="small muted" style="margin-left:auto">${icon('arrowRight', 14)}</span></button>`).join('')
        : (inp.value.trim() ? `<div class="sm-empty" style="padding:18px">${icon('pin', 22)}<p class="small muted" style="margin-top:6px">No matching city or area. Try “Bengaluru” or “Koramangala”.</p></div>` : '');
      U.$$('.loc-item', box).forEach(b => b.addEventListener('click', () => pick({ city: b.dataset.city, area: b.dataset.area })));
    };
    inp.addEventListener('input', debounce(renderSugg, 120));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter' && locSuggest(inp.value).length) { const o = locSuggest(inp.value)[0]; pick(o); } });
    U.$$('[data-loc-city]').forEach(b => b.addEventListener('click', () => pick({ city: b.dataset.locCity, area: '' })));
    U.$('#loc-detect').addEventListener('click', () => {
      const status = U.$('#loc-status');
      const btn = U.$('#loc-detect');
      if (!('geolocation' in navigator)) { status.innerHTML = `<span class="small" style="color:var(--warn-600)">${icon('alert', 13)} Your browser doesn't support location. Type your area above instead.</span>`; return; }
      btn.disabled = true; btn.innerHTML = `${icon('timer', 14)} Detecting…`;
      navigator.geolocation.getCurrentPosition(async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const j = await r.json();
          const cityName = j.city || j.locality || j.principalSubdivision || '';
          const known = DATA.cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
          const area = j.locality && known ? j.locality : '';
          Store.setLocation({ city: known ? known.name : (cityName || 'Bengaluru'), area });
          closeModal();
          toast('📍 Location set to ' + Store.currentLocation().label);
          window.App && App.refresh();
        } catch (e2) {
          status.innerHTML = `<span class="small" style="color:var(--warn-600)">${icon('alert', 13)} Couldn't pin your exact location — type your area above instead.</span>`;
        }
        btn.disabled = false; btn.innerHTML = `${icon('navigation', 14)} Use my location`;
      }, err => {
        btn.disabled = false; btn.innerHTML = `${icon('navigation', 14)} Use my location`;
        status.innerHTML = `<span class="small" style="color:var(--warn-600)">${icon('alert', 13)} ${err.code === 1 ? 'Location permission was denied. You can still type your area above — we never need your exact address.' : err.code === 2 ? 'Location is unavailable right now. Try typing your area above instead.' : "Couldn't detect your location. Please type your area above."}</span>`;
      }, { timeout: 8000 });
    });
  };
  const emptySm = msg => `<div class="sm-empty">${icon('search', 26)}<p style="margin-top:8px">${msg}</p></div>`;
  const debounce = U.debounce;

  /* ---------------- PWA INSTALL MODAL (device-aware) ---------------- */
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);

  /* Best URL to open Servehub from a phone: the LAN/public host when this
     device is localhost (QR + share link), else the current page itself. */
  const webUrlForPhone = () => {
    const h = (location.hostname || '').toLowerCase();
    const local = /^(|localhost|127\.0\.0\.1|0\.0\.0\.0|::1)$/;
    if (!local.test(h) && location.port) return location.href; // already on a LAN/public page
    const api = window.SH_API || '';
    let host = '';
    try { host = new URL(api).hostname; } catch (e) {} // strips IPv6 brackets for us
    if (host && !local.test(host)) {
      // The phone must reach the SAME web server port this laptop is using.
      const port = location.port || 5501;
      return location.protocol + '//' + (host.includes(':') ? '[' + host + ']' : host) + ':' + port + '/servehub';
    }
    return location.href;
  };
  const apkGuideBody = () => `
    <p class="small muted" style="margin-bottom:12px">The APK isn't built yet — run this once from the project root (needs Java 17 + Android SDK):</p>
    <div class="code-box">npm run build:apk -- http://localhost:5501/servehub</div>
    <p class="small muted" style="margin-top:12px">No tools installed? Use <b>PWABuilder</b> — paste your public HTTPS Servehub URL and download the signed APK. Full guide: <code>android/README.md</code>.</p>`;
  const installModalBody = () => `
    <div class="install-head"><span class="install-logo">${icon('zap', 22)}</span><div><b style="font-size:15px">Servehub</b><div class="small muted">Home services, one tap away</div></div></div>
    <p class="small muted" style="margin:12px 0 14px">Install Servehub on ${isIOS ? 'your iPhone / iPad' : isAndroid ? 'your Android phone' : 'this computer'} — it opens full-screen, works offline and feels just like a native app.</p>
    <div class="install-steps">
      ${isIOS
        ? `<div class="install-step"><span class="is-n">1</span><div><b>Tap the ${icon('share', 13)} Share button</b><div class="small muted">in the Safari toolbar at the bottom of the screen</div></div></div>
           <div class="install-step"><span class="is-n">2</span><div><b>Choose “Add to Home Screen”</b><div class="small muted">scroll down in the share sheet</div></div></div>
           <div class="install-step"><span class="is-n">3</span><div><b>Tap “Add”</b><div class="small muted">Servehub appears on your home screen — done 🎉</div></div></div>`
        : isAndroid
          ? `<div class="install-step"><span class="is-n">1</span><div><b>Open this page in Chrome</b><div class="small muted">not the in-app browser</div></div></div>
             <div class="install-step"><span class="is-n">2</span><div><b>Tap the ⋮ menu</b><div class="small muted">top-right corner of the browser</div></div></div>
             <div class="install-step"><span class="is-n">3</span><div><b>Tap “Add to Home screen” or “Install app”</b><div class="small muted">then confirm — done 🎉</div></div></div>
             <button class="btn btn-soft btn-sm" data-act="android-app" style="width:100%;margin-top:4px">${icon('android', 14)} Prefer an app file? Get the Android APK</button>`
          : `<div class="install-step"><span class="is-n">1</span><div><b>Open this page in Chrome or Edge</b><div class="small muted">any browser with installable-app support</div></div></div>
             <div class="install-step"><span class="is-n">2</span><div><b>Click the ${icon('download', 13)} install icon</b><div class="small muted">in the address bar — or the ⋮ menu → “Install”</div></div></div>
             <div class="install-step"><span class="is-n">3</span><div><b>Click “Install”</b><div class="small muted">Servehub opens in its own app window — done 🎉</div></div></div>`}
    </div>`;

  /* ---------------- ROUTER ---------------- */
  const routes = [
    { m: '^$', name: 'landing', lay: 'public', render: () => Public.render('landing') },
    { m: '^categories$', name: 'categories', lay: 'public', render: () => Public.render('categories') },
    { m: '^category/([^/]+)$', name: 'category', lay: 'public', render: p => Public.render('category', { slug: decodeURIComponent(p[0]) }) },
    { m: '^service/([^/]+)$', name: 'service', lay: 'public', render: p => Public.render('service', { id: p[0] }) },
    { m: '^blog$', name: 'blog', lay: 'public', render: () => Public.render('blog') },
    { m: '^blog/([^/]+)$', name: 'post', lay: 'public', render: p => Public.render('post', { id: p[0] }) },
    { m: '^(about|contact|faq|privacy|terms|refund|help|careers)$', name: 'static', lay: 'public', render: () => Public.render('static', { page: (location.hash || '').replace(/^#\/?/, '') }) },
    { m: '^login$', name: 'login', lay: 'auth', render: () => Auth.render('login') },
    { m: '^register$', name: 'register', lay: 'auth', render: () => Auth.render('register') },
    { m: '^otp$', name: 'otp', lay: 'auth', render: () => Auth.render('otp') },
    { m: '^verify-email$', name: 'verify', lay: 'auth', render: () => Auth.render('verify-email') },
    { m: '^verify-otp$', name: 'verify-otp', lay: 'auth', render: () => Auth.render('verify-otp') },
    { m: '^forgot$', name: 'forgot', lay: 'auth', render: () => Auth.render('forgot') },
    { m: '^forgot-otp$', name: 'forgot-otp', lay: 'auth', render: () => Auth.render('verify-otp') },
    { m: '^reset-password$', name: 'reset-password', lay: 'auth', render: () => Auth.render('reset-password') },
    { m: '^pro-onboarding$', name: 'pro-onboard', lay: 'auth', render: () => Auth.render('pro-onboarding') },
    { m: '^become-pro$', name: 'become-pro', lay: 'public', render: () => Auth.render('become-pro') },
    { m: '^book/([^/]+)$', name: 'book', lay: 'public', render: p => Booking.render('book', { id: p[0] }) },
    { m: '^track/([^/]+)$', name: 'track', lay: 'public', render: p => Booking.render('track', { id: p[0] }) },
    { m: '^invoice/([^/]+)$', name: 'invoice', lay: 'public', render: p => Booking.render('invoice', { id: p[0] }) },
    { m: '^dashboard$', name: 'dash', lay: 'dash', render: () => Customer.render({ tab: 'overview' }) },
    { m: '^dashboard/([^/]+)$', name: 'dash-tab', lay: 'dash', render: p => Customer.render({ tab: p[0] }) },
    { m: '^pro$', name: 'pro', lay: 'dash', render: () => Pro.render({ tab: 'overview' }) },
    { m: '^pro/([^/]+)$', name: 'pro-tab', lay: 'dash', render: p => Pro.render({ tab: p[0] }) },
    { m: '^admin$', name: 'admin', lay: 'dash', render: () => Admin.render({ tab: 'overview' }) },
    { m: '^admin/([^/]+)$', name: 'admin-tab', lay: 'dash', render: p => Admin.render({ tab: p[0] }) },
    { m: '^admin-login$', name: 'admin-login', lay: 'auth', render: () => ({ html: adminLogin(), wire: null }) },
  ];
  let route = '';

  const adminLogin = () => `
    <div class="auth-wrap">
      <div class="auth-visual">
        <a class="logo" href="#/" style="color:#fff;position:relative;z-index:1;margin-bottom:56px"><span class="logo-mark">${icon('zap', 20)}</span>Serve<b style="background:none;-webkit-text-fill-color:#fff">hub</b></a>
        <h2 style="font-size:clamp(24px,3vw,32px);position:relative;z-index:1">Admin command center.</h2>
        <p style="opacity:.8;margin-top:12px;position:relative;z-index:1;max-width:360px">Manage customers, professionals, payments, content and analytics — all in one place.</p>
      </div>
      <div class="auth-form"><div class="auth-card">
        <h1>Admin login</h1><p class="sub">Restricted area — authorized personnel only.</p>
        <div class="field"><label class="label">Admin email</label><div class="input-group">${icon('mail', 17)}<input class="input input-icon-r" placeholder="admin@servehub.in"></div></div>
        <div class="field"><label class="label">Password</label><div class="input-group">${icon('lock', 17)}<input class="input input-icon-r" type="password" placeholder="••••••••"></div></div>
        <button class="btn btn-primary btn-lg btn-block" data-act="admin-login">${icon('shieldCheck', 16)} Sign in to admin</button>
        <p class="auth-alt"><a href="#/login">← Back to customer login</a></p>
      </div></div>
    </div>`;

  const renderRoute = () => {
    Booking.clearTimers(); Admin.clearMonitor(); clearInterval(window.__custLive);
    const hash = (location.hash || '#/').replace(/^#\/?/, '');
    const parts = hash.split('/');
    const r = routes.find(rr => { const mm = hash.match(rr.m); if (!mm) return false; route = hash; return true; });
    document.body.scrollTop = 0; window.scrollTo(0, 0);
    let out;
    if (!r) { out = { html: `<section class="section"><div class="container"><div class="empty-state"><div class="e-ic">${icon('alert', 30)}</div><h3>Page not found</h3><p class="small muted">The page you are looking for doesn't exist.</p><a class="btn btn-primary" style="margin-top:14px" href="#/">Go home</a></div></div></section>`, wire: null, lay: 'public' }; }
    else out = r.render(parts.slice(1)) || { html: '', wire: null, lay: r.lay };
    const lay = out.lay || r.lay;
    const noFloat = ['book', 'track', 'invoice'].includes(r?.name);
    app.innerHTML = lay === 'public' ? publicLayout(out.html, !noFloat) : out.html;
    if (out.wire) out.wire();
    // common wiring
    U.wireAcc(document); U.wireTabs(document); U.wireCarousel(document); U.observeReveals(document);
    const nav = U.$('#navbar');
    if (nav) { const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8); window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
    document.querySelectorAll('[data-newsletter]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); toast('Subscribed! Check your inbox for a welcome gift 🎁'); f.reset(); }));
  };

  /* ---------------- GLOBAL ACTIONS ---------------- */
  const actions = {
    'search': openSearch,
    'location': openLocationModal,
    'menu': () => { const m = U.$('#mobile-menu'); m && m.classList.toggle('open'); const mm = U.$('.mega-wrap'); mm && mm.classList.toggle('open'); },
    'theme': () => toggleTheme(),
    'theme-check': () => toggleTheme(),
    'lang': () => { Store.state.lang = Store.state.lang === 'en' ? 'hi' : 'en'; Store.persist(); document.documentElement.lang = Store.state.lang; renderRoute(); },
    'lang-select': e => { Store.state.lang = e.target.value; Store.persist(); },
    'close-modal': closeModal,
    'toast': (el, e) => toast(el.dataset.msg || 'Done!', 'info'),
    'pw-toggle': el => { const inp = document.getElementById(el.dataset.id); if (inp) inp.type = inp.type === 'password' ? 'text' : 'password'; },
    'edit-phone': () => { location.hash = '#/register'; },
    'oauth': el => { Store.login({ name: el.dataset.provider + ' User', role: 'customer', email: 'user@' + el.dataset.provider.toLowerCase() + '.com' }); Store.walletTx(150, 'signup bonus'); toast('Signed in with ' + el.dataset.provider + ' ✓'); location.hash = '#/dashboard/overview'; },
    'demo-login': () => {
      const role = (U.$('input[name="role"]:checked') || {}).value || 'customer';
      if (role !== 'customer') { Auth.doLogin(role, 'demo@servehub.in', true); return; }
      Store.login({ name: 'Priya Sharma', role: 'customer', email: 'priya@demo.com', phone: '+91 98765 43210' }); Store.addNotif('bell', 'Welcome back!', 'Demo session started. Everything is fully interactive.'); toast('Demo login successful — welcome, Priya! 🎉'); location.hash = '#/dashboard/overview';
    },
    'admin-login': () => { Store.login({ name: 'Servehub Admin', role: 'admin' }); toast('Admin authenticated 🔐'); location.hash = '#/admin/overview'; },
    'logout': () => { closeModal(); Store.logout(); toast('Logged out. See you soon! 👋'); location.hash = '#/'; },
    'wish': el => { const on = Store.toggleWish(el.dataset.id); el.classList.toggle('on', on); el.style.color = on ? 'var(--danger)' : ''; toast(on ? 'Added to wishlist ❤️' : 'Removed from wishlist', on ? 'success' : 'info'); },
    'fav': el => { const on = Store.toggleFav(el.dataset.id); el.classList.toggle('on', on); el.style.color = on ? 'var(--danger)' : ''; toast(on ? 'Saved to favorites ⭐' : 'Removed from favorites', on ? 'success' : 'info'); },
    'chat-popup': () => Chatbot.toggle(),
    'chat-focus': el => { const inp = U.$('#chat-input'); if (inp) { inp.focus(); inp.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else { const b = Store.bookingById(el.dataset.id); if (b) Booking.chatModal('Chat — ' + b.id); } },
    'call': el => { const b = Store.bookingById(el.dataset.id); if (b) Booking.callModal(b); },
    'pro-call': el => {
      const p = DATA.proById(el.dataset.id) || {};
      openModal(modalShell('Call ' + (p.name || 'professional'), `
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:4px 0 2px">
          ${avatar(p.name || 'P', 64)}
          <b style="font-size:17px">${esc(p.name || 'Professional')}</b>
          <div class="small muted">${esc(p.role || '')}${p.rating ? ' • ★ ' + p.rating : ''}${p.city ? ' • ' + esc(p.city) : ''}</div>
          <div class="card glass" style="padding:14px 18px;max-width:340px">
            <b style="display:flex;gap:8px;align-items:center;justify-content:center;color:var(--warn-600)">${icon('alert', 15)} Sample / demo profile</b>
            <p class="small muted" style="margin-top:6px;line-height:1.55">This is a sample provider profile, so no personal phone number is published. Once the professional adds a verified number, a call button will appear here. You can still book this professional now.</p>
          </div>
        </div>`, `<a class="btn btn-ghost" data-act="close-modal">Close</a><a class="btn btn-primary" href="#/service/${DATA.servicesByCat(p.cat || 'ac')[0]?.id || 's3'}" data-act="close-modal">${icon('calendar', 14)} Book now</a>`));
    },
    'video': el => { const b = Store.bookingById(el.dataset.id); if (b) Booking.callModal(b, true); },
    'navigate': el => {
      const b = Store.bookingById(el.dataset.id) || {};
      openModal(modalShell('GPS Navigation', `${U.genMap()}<div style="margin-top:14px"><div class="sum-row"><span class="muted">Destination</span><b>${esc(b.address || 'Customer address')}</b></div><div class="sum-row"><span class="muted">ETA</span><b>~8 min • 2.4 km</b></div></div>`, `<button class="btn btn-ghost" data-act="close-modal">Close</button><button class="btn btn-primary" data-act="toast" data-msg="Opening Google Maps with turn-by-turn directions 🗺️">${icon('navigation', 14)} Open in Maps</button>`));
    },
    'simulate': el => { Store.advanceBooking(el.dataset.id); toast('Status advanced (demo)'); App.refresh(); },
    'cancel-bk': el => { const b = Store.bookingById(el.dataset.id); if (b) Booking.cancelModal(b); },
    'resched': el => { const b = Store.bookingById(el.dataset.id); if (b) Booking.reschedModal(b); },
    'rate': el => { const b = Store.bookingById(el.dataset.id); if (b) Booking.rateModal(b); },
    'helpful': el => { toast('Marked as helpful 👍'); },
    'unlock-coupon': el => { const c = DATA.coupons.find(x => x.code === el.dataset.code); if (c && !Store.state.coupons.includes(c.code)) { Store.state.coupons.push(c.code); Store.persist(); el.classList.remove('btn-soft'); el.classList.add('btn-success'); el.innerHTML = icon('check', 13) + ' Unlocked'; toast(c.code + ' unlocked 🎉'); } else toast(c ? 'Already unlocked' : 'Invalid code', 'info'); },
    'copy-ref': el => { navigator.clipboard && navigator.clipboard.writeText(el.dataset.code).then(() => toast('Referral code copied 🔗')); },
    'share-ref': el => { toast('Opening WhatsApp to share your link… 💬', 'info'); },
    'install-app': async el => {
      if (window.SH_PWA && SH_PWA.canInstall()) {
        const ok = await SH_PWA.promptInstall();
        if (ok) { const bar = U.$('.pwa-bar'); bar && bar.remove(); } // 'appinstalled' fires the confirmation toast
        return;
      }
      if (window.SH_PWA && SH_PWA.isStandalone()) { toast('Servehub is already installed on this device 🎉', 'success'); return; }
      openModal(modalShell('Get the Servehub app', installModalBody(), `<button class="btn btn-ghost" data-act="close-modal">Maybe later</button><button class="btn btn-primary" data-act="close-modal">${icon('check', 14)} Got it</button>`));
    },
    'pwa-dismiss': () => { const bar = U.$('.pwa-bar'); if (bar) bar.remove(); try { localStorage.setItem('sh:pwaDismissed', '1'); } catch (e) {} },
    'android-app': async el => {
      const url = webUrlForPhone();
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&data=${encodeURIComponent(url)}`;
      let hasApk = false;
      try { const r = await fetch('/servehub.apk', { method: 'HEAD' }); hasApk = r.ok; } catch (e) {}
      const apkBlock = hasApk
        ? `<a class="and-opt" href="/servehub.apk" download="servehub.apk"><span class="ao-ic" style="background:var(--success-50);color:var(--success-600)">${icon('download', 20)}</span><span><b>Download APK</b><small>servehub.apk — sideload it on your phone</small></span><span class="ao-arr">${icon('arrowRight', 16)}</span></a>`
        : `<button class="and-opt" data-act="apk-guide"><span class="ao-ic" style="background:var(--warn-50);color:var(--warn-600)">${icon('android', 20)}</span><span><b>Download Android APK</b><small>Build it in one command — npm run build:apk</small></span><span class="ao-arr">${icon('arrowRight', 16)}</span></button>`;
      openModal(modalShell('Get Servehub for Android', `
        <div class="install-head"><span class="install-logo">${icon('android', 24)}</span><div><b style="font-size:15px">Servehub for Android</b><div class="small muted">Free • no Play Store needed</div></div></div>
        <div class="and-opts" style="margin-top:14px">
          <button class="and-opt" data-act="install-app" data-close="1"><span class="ao-ic" style="background:var(--primary-50);color:var(--primary-600)">${icon('zap', 20)}</span><span><b>Install instantly from your browser</b><small>One tap • home-screen icon • works offline</small></span><span class="ao-arr">${icon('arrowRight', 16)}</span></button>
          ${apkBlock}
        </div>
        <div class="and-qr">
          <div class="qr-frame"><img src="${qr}" alt="QR code to open Servehub on your phone" width="200" height="200" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.and-qr').classList.add('qr-off')" /></div>
          <div style="flex:1;min-width:0"><b style="font-size:13px">Open it on your phone</b><p class="small muted" style="margin:4px 0 10px">Scan with your phone camera to open the app on the same Wi-Fi</p><div class="qr-url">${esc(url)}</div><button class="btn btn-soft btn-sm" data-act="copy-url" data-url="${esc(url)}" style="margin-top:10px">${icon('link', 14)} Copy link</button></div>
        </div>`, `<button class="btn btn-ghost" data-act="close-modal">Close</button>`));
    },
    'apk-guide': () => { openModal(modalShell('Build the Android APK', apkGuideBody(), `<button class="btn btn-ghost" data-act="close-modal">Close</button>`)); },
    'copy-url': el => { const u = el.dataset.url; if (navigator.clipboard) { navigator.clipboard.writeText(u).then(() => toast('Link copied 🔗', 'info')).catch(() => toast(u, 'info')); } else toast(u, 'info'); },
    'share-app': async () => {
      const url = location.href;
      if (navigator.share) { try { await navigator.share({ title: 'Servehub — Home Services', text: 'Book home services in seconds with Servehub! 🛠️', url }); return; } catch (e) { return; } }
      if (navigator.clipboard) { try { await navigator.clipboard.writeText(url); } catch (e) {} toast('Link copied — share it with friends 🔗', 'info'); } else toast('Share this link: ' + url, 'info');
    },
    'add-money': () => { openModal(modalShell('Add money to wallet', `<div class="field"><label class="label">Amount</label><div style="display:flex;gap:8px;align-items:center"><input class="input" id="am-amt" type="number" value="500" style="font-size:20px;font-weight:800">${'<span style="font-size:20px">₹</span>'}</div></div><div class="radio-pill">${[100, 200, 500, 1000, 2000].map(a => `<label><input type="radio" name="amt" value="${a}"><span>${money(a)}</span></label>`).join('')}</div><p class="xsmall muted" style="margin-top:10px">Paid via UPI • instant credit</p>`, `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" id="am-go">${icon('wallet', 14)} Add money</button>`)); U.$('#am-go').addEventListener('click', () => { const a = Number(U.$('#am-amt').value || 500); Store.walletTx(a, 'wallet top-up'); closeModal(); toast(money(a) + ' added to wallet 💰'); location.hash = '#/dashboard/wallet'; }); },
    'gift-card': () => { openModal(modalShell('Gift cards', `<div class="radio-pill" style="margin-bottom:16px">${[250, 500, 1000, 2000].map(a => `<label><input type="radio" name="gc" value="${a}"><span>${money(a)}</span></label>`).join('')}</div><div class="field"><label class="label" for="gc-mail">Recipient email</label><input class="input" id="gc-mail" placeholder="friend@example.com"></div><div class="field"><label class="label">Redeem a gift card</label><div style="display:flex;gap:8px"><input class="input" placeholder="Enter gift code"><button class="btn btn-soft">Redeem</button></div></div>`, `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" data-act="toast" data-msg="Gift card sent! 🎁">${icon('gift', 14)} Buy gift card</button>`)); },
    'withdraw-wallet': () => { openModal(modalShell('Withdraw to bank', `<div class="field"><label class="label">Amount</label><input class="input" type="number" value="${Math.min(Store.state.wallet, 1000)}"></div><div class="field"><label class="label">Bank account</label><select class="select"><option>HDFC ****1234 (primary)</option><option>ICICI ****5678</option><option>Add new account</option></select></div><p class="xsmall muted">Arrives in 1–2 business days • free</p>`, `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" data-act="do-withdraw">${icon('download', 14)} Withdraw</button>`)); },
    'do-withdraw': () => { const amt = Number(U.$('.modal input[type=number]')?.value || 0); if (!amt) { toast('Enter an amount', 'warn'); return; } Store.state.withdrawals.unshift({ id: 'WD' + Math.floor(1000 + Math.random() * 9000), amount: amt, bank: 'HDFC ****1234', status: 'Processing', ts: Date.now() }); Store.walletTx(-amt, 'withdrawal to bank'); Store.persist(); closeModal(); toast('Withdrawal of ' + money(amt) + ' initiated ✅'); location.hash = '#/dashboard/wallet'; },
    'withdraw-pro': () => { openModal(modalShell('Withdraw earnings', `<div class="field"><label class="label">Amount</label><input class="input" type="number" value="5000"></div><div class="field"><label class="label">Bank account</label><select class="select"><option>HDFC ****1234</option></select></div><p class="xsmall muted">Instant settlement available for verified pros 🚀</p>`, `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" data-act="do-withdraw-pro">${icon('download', 14)} Withdraw</button>`)); },
    'do-withdraw-pro': () => { Store.state.withdrawals.unshift({ id: 'WD' + Math.floor(1000 + Math.random() * 9000), amount: 5000, bank: 'HDFC ****1234', status: 'Processing', ts: Date.now() }); Store.persist(); closeModal(); toast('Earnings withdrawal initiated ✅'); location.hash = '#/pro/wallet'; },
    'redeem-pts': () => { openModal(modalShell('Redeem reward points', `<p class="small muted" style="margin-bottom:14px">You have <b>${Store.state.points} points</b> — 2 points = ₹1 in wallet credit.</p><div class="radio-pill">${[[100, '₹50'], [200, '₹100'], [400, '₹200']].map(o => `<label><input type="radio" name="rd" value="${o[0]}"><span>${o[0]} pts → ${o[1]}</span></label>`).join('')}</div>`, `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" data-act="do-redeem">${icon('gift', 14)} Redeem</button>`)); },
    'do-redeem': () => { const pts = Number(U.$('input[name="rd"]:checked')?.value || 100); Store.state.points -= pts; Store.walletTx(pts / 2, 'reward redemption'); Store.persist(); closeModal(); toast('Redeemed ' + pts + ' points for ' + money(pts / 2) + ' 🎁'); location.hash = '#/dashboard/rewards'; },
    'subscribe': el => { Store.state.plan = el.dataset.plan; Store.persist(); toast('You are now on the ' + DATA.plans.find(p => p.id === el.dataset.plan).name + ' plan! 👑'); location.hash = '#/dashboard/membership'; },
    'new-ticket': async () => {
      const cat = (U.$('#tk-cat') || U.$('#pk-cat'))?.value || 'Other';
      const sub = (U.$('#tk-sub') || U.$('#pk-sub'))?.value; const msg = (U.$('#tk-msg') || U.$('#pk-msg'))?.value;
      if (!sub) { toast('Please enter a subject', 'warn'); return; }
      if (localStorage.getItem('sh:token') && Customer.api) {
        const r = await Customer.api('POST', '/tickets', { category: cat, subject: sub, text: msg });
        if (!r || !r.ticket) { toast((r && r.error) || 'Could not create ticket', 'warn'); return; }
        Store.state.tickets.unshift(Customer.normTicket(r.ticket)); Store.persist();
        toast('Ticket ' + r.ticket.id + ' created — we are on it 🎧');
      } else {
        Store.createTicket({ cat, subject: sub, msg, status: 'open' });
        toast('Ticket ' + Store.state.tickets[0].id + ' created — we are on it 🎧');
      }
      location.hash = location.hash.includes('/pro/') ? '#/pro/support' : '#/dashboard/support';
    },
    'read-all': async () => {
      if (localStorage.getItem('sh:token') && Customer.api) { const r = await Customer.api('POST', '/notifications/read-all'); if (!r) { toast('Could not reach server', 'warn'); return; } }
      Store.markAllRead(); toast('All notifications marked as read ✅'); renderRoute();
    },
    'add-addr': () => Customer.addrModal(),
    'edit-addr': el => { const a = Store.state.addr.find(x => String(x.id) === String(el.dataset.id)); if (a) Customer.addrModal(a); },
    'del-addr': el => {
      const a = Store.state.addr.find(x => String(x.id) === String(el.dataset.id)); if (!a) return;
      openModal(modalShell('Delete address', `<div style="display:flex;gap:14px"><span class="e-ic" style="width:48px;height:48px;border-radius:14px;background:var(--danger-50);color:var(--danger);display:grid;place-items:center;flex:none">${icon('trash', 20)}</span><p class="small muted">Delete <b>${esc(a.label)}</b> (${esc(a.line)}, ${esc(a.city)})? This cannot be undone.</p></div>`, `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-danger" data-act="confirm-del-addr" data-id="${a.id}">${icon('trash', 14)} Delete</button>`));
    },
    'confirm-del-addr': async el => {
      const id = el.dataset.id; const a = Store.state.addr.find(x => String(x.id) === String(id));
      closeModal();
      if (a && a._live && localStorage.getItem('sh:token') && Customer.api) {
        const r = await Customer.api('DELETE', '/addresses/' + id);
        if (!r || r.error) { toast((r && r.error) || 'Could not delete address', 'warn'); return; }
      }
      Store.state.addr = Store.state.addr.filter(x => String(x.id) !== String(id));
      Store.persist(); toast('Address deleted 🗑️'); renderRoute();
    },
    'set-primary': async el => {
      const id = el.dataset.id;
      if (localStorage.getItem('sh:token') && Customer.api) {
        const r = await Customer.api('PATCH', '/addresses/' + id, { isDefault: true });
        if (!r || r.error) { toast((r && r.error) || 'Could not update address', 'warn'); return; }
      }
      Store.state.addr.forEach(x => x.primary = String(x.id) === String(id));
      Store.persist(); toast('Default address updated 📍'); renderRoute();
    },
    'ticket-thread': el => { const t = Store.state.tickets.find(x => String(x.id) === String(el.dataset.id)); if (t) Customer.ticketThread(t); },
    'notif-open': el => {
      const n = Store.state.notifs.find(x => String(x.id) === String(el.dataset.id));
      if (n && !n.read) { n.read = true; Store.persist(); if (localStorage.getItem('sh:token') && Customer.api) Customer.api('PATCH', '/notifications/' + n.id + '/read'); renderRoute(); }
      // navigate to the linked page when the notification carries one
      if (n && n.link) { const l = String(n.link).replace(/^\/?/, ''); if (l) location.hash = '#/' + l; }
    },
    'save-profile': () => { const u = Store.currentUser(); if (!u) return; u.name = U.$('#st-name')?.value || u.name; u.phone = U.$('#st-phone')?.value || u.phone; u.email = U.$('#st-email')?.value || u.email; Store.persist(); toast('Profile updated ✅'); renderRoute(); },
    'delete-account': () => { openModal(modalShell('Delete account', `<div style="display:flex;gap:14px"><span class="e-ic" style="width:48px;height:48px;border-radius:14px;background:var(--danger-50);color:var(--danger);display:grid;place-items:center;flex:none">${icon('alert', 22)}</span><p class="small muted">This permanently deletes your account, bookings and wallet balance. This cannot be undone.</p></div>`, `<button class="btn btn-ghost" data-act="close-modal">Keep my account</button><button class="btn btn-danger" data-act="do-delete">${icon('trash', 14)} Delete everything</button>`)); },
    'do-delete': () => { Object.keys(Store.state).forEach(k => { try { localStorage.removeItem('sh:' + k); } catch (e) {} }); location.hash = '#/'; toast('Account deleted. We are sorry to see you go 💔', 'info'); },
    'accept-job': el => { const b = Store.bookingById(el.dataset.id); if (b && b.status === 'confirmed') { Store.advanceBooking(b.id, 'assigned'); toast('Booking accepted ✅'); renderRoute(); } },
    'reject-job': el => { const b = Store.bookingById(el.dataset.id); if (b) { b.status = 'rejected'; Store.persist(); toast('Booking rejected — customer notified', 'info'); renderRoute(); } },
    'complete-job': el => { const b = Store.bookingById(el.dataset.id); if (b) { Store.advanceBooking(b.id, 'paid'); toast('Job completed — payment released 💸'); renderRoute(); } },
    'call-cust': () => { openModal(modalShell('Calling customer…', `<div class="call-ui"><div class="call-ava">${avatar(Store.currentUser()?.name || 'Customer', 0)}</div><b style="font-size:18px">${esc(Store.currentUser()?.name || 'Customer')}</b><div class="call-timer">00:00</div><div class="call-actions"><button class="call-btn call-mute">${icon('mic', 22)}</button><button class="call-btn call-end" data-act="close-modal">${icon('phone', 22)}</button></div></div>`)); },
    'set-available': () => toast('Availability toggled — you are now open for bookings ✅', 'success'),
    'save-avail': () => toast('Availability saved ✅'),
    'train': el => { toast('Course progress updated: ' + (el.dataset.p === '100' ? 'already completed' : '+25% → ' + Math.min(Number(el.dataset.p) + 25, 100) + '%') + ' 🎓'); },
    'approve-pro': el => { const a = Store.state.proApps.find(x => x.id === el.dataset.id); if (a) { a.status = 'approved'; Store.persist(); toast(a.name + ' approved! They can now accept bookings 🎉'); renderRoute(); } },
    'reject-pro': el => { const a = Store.state.proApps.find(x => x.id === el.dataset.id); if (a) { a.status = 'rejected'; Store.persist(); toast(a.name + ' rejected — applicant notified', 'info'); renderRoute(); } },
    'view-pro': el => { const a = Store.state.proApps.find(x => x.id === el.dataset.id); if (a) openModal(modalShell('Review application — ' + a.id, `<div class="sum-row"><span class="muted">Name</span><b>${esc(a.name)}</b></div><div class="sum-row"><span class="muted">Category</span><b>${esc(a.cat)}</b></div><div class="sum-row"><span class="muted">City</span><b>${esc(a.city)}</b></div><div class="sum-row"><span class="muted">Experience</span><b>${a.exp} years</b></div><div class="sum-row"><span class="muted">Phone</span><b>${esc(a.phone || '—')}</b></div><hr class="divider"><p class="small muted">Documents: Aadhaar ✓ • Selfie ✓ • Certificate — pending</p>`, `<button class="btn btn-danger" data-act="reject-pro" data-id="${a.id}">Reject</button><button class="btn btn-success" data-act="approve-pro" data-id="${a.id}">${icon('check', 14)} Approve</button>`)); },
    'admin-advance': el => { Store.advanceBooking(el.dataset.id); toast('Status advanced'); App.refresh(); },
    'broadcast': () => { const title = U.$('#bc-title')?.value || 'New offer'; const msg = U.$('#bc-msg')?.value || 'Check out the latest offers on Servehub!'; Store.addNotif('bell', title, msg); toast('Broadcast sent to 2.4M users 📣'); U.$('#bc-title').value = ''; U.$('#bc-msg').value = ''; },
    'apply': el => { openModal(modalShell('Apply — ' + el.dataset.role, `<div class="field"><label class="label">Full name</label><input class="input" placeholder="Your name"></div><div class="field"><label class="label">Email</label><input class="input" type="email" placeholder="you@example.com"></div><div class="field"><label class="label">Resume / portfolio</label><label class="upload-zone" style="padding:16px"><div class="u-ic" style="width:40px;height:40px">${icon('upload', 18)}</div><b style="font-size:13px">Upload file</b><input type="file" style="display:none"></label></div>`, `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" data-act="toast" data-msg="Application received! We will reach out within 5 days 🤝">Submit application</button>`)); },
    'detect-location': () => { toast('GPS: location detected — Bandra, Mumbai 📍', 'success'); },
  };

  const toggleTheme = () => {
    Store.state.theme = Store.state.theme === 'dark' ? 'light' : 'dark';
    Store.persist();
    document.documentElement.dataset.theme = Store.state.theme;
    U.$$('[data-act="theme"]').forEach(b => b.innerHTML = icon(Store.state.theme === 'dark' ? 'sun' : 'moon', 18));
    toast(Store.state.theme === 'dark' ? 'Dark mode on 🌙' : 'Light mode on ☀️', 'info');
  };

  /* ---------------- delegation ---------------- */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (el && actions[el.dataset.act]) { if (el.dataset.close) closeModal(); actions[el.dataset.act](el, e); return; }
    // ripple on .btn
    const btn = e.target.closest('.btn');
    if (btn && !btn.classList.contains('btn-ghost') && !e.target.closest('[data-act]')) {
      const r = document.createElement('span'); r.className = 'ripple';
      const rect = btn.getBoundingClientRect();
      r.style.left = (e.clientX - rect.left - 20) + 'px'; r.style.top = (e.clientY - rect.top - 20) + 'px';
      r.style.width = r.style.height = '40px';
      btn.appendChild(r); setTimeout(() => r.remove(), 560);
    }
  });
  document.addEventListener('submit', e => {
    if (e.target.id === 'login-form') { e.preventDefault(); const role = U.$('input[name="role"]:checked', e.target)?.value || 'customer'; const email = U.$('#l-email').value.trim() || 'demo@servehub.in'; Auth.doLogin(role, email); }
    if (e.target.id === 'reg-form') { e.preventDefault(); Auth.startRegister(); }
    if (e.target.id === 'forgot-form') { e.preventDefault(); toast('Reset code sent to your email 📩', 'info'); location.hash = '#/forgot-otp'; }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); const m = U.$('#mobile-menu'); m && m.classList.remove('open'); }
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });
  document.addEventListener('change', e => {
    const city = e.target.closest('.city-select');
    if (city) { Store.setLocation({ city: city.value, area: '' }); toast('📍 Location set to ' + Store.currentLocation().label); }
    const nf = e.target.closest('[data-notif]');
    if (nf) { Store.state.settings[nf.dataset.notif] = nf.checked; Store.persist(); }
  });

  /* ---------------- PWA: install banner + events ---------------- */
  const ensurePwaBar = () => {
    if (U.$('.pwa-bar') || (window.SH_PWA && SH_PWA.isStandalone())) return;
    const bar = document.createElement('div');
    bar.className = 'pwa-bar';
    bar.innerHTML = `<span class="pwa-logo">${icon('zap', 20)}</span><div><b style="font-size:13.5px">Install Servehub</b><div class="small muted">Full-screen app • works offline</div></div><div style="margin-left:auto;display:flex;gap:8px;align-items:center"><button class="icon-btn" data-act="pwa-dismiss" aria-label="Dismiss">${icon('x', 15)}</button><button class="btn btn-primary btn-sm" data-act="install-app">${icon('download', 14)} Install</button></div>`;
    document.body.appendChild(bar);
  };
  document.addEventListener('sh:pwa-ready', () => { let d = '0'; try { d = localStorage.getItem('sh:pwaDismissed') || '0'; } catch (e) {} if (d !== '1') ensurePwaBar(); });
  document.addEventListener('sh:pwa-standalone', () => { const bar = U.$('.pwa-bar'); bar && bar.remove(); });
  document.addEventListener('sh:pwa-installed', () => { const bar = U.$('.pwa-bar'); bar && bar.remove(); toast('Servehub installed — find it on your home screen 🎉', 'success'); });

  /* ---------------- init ---------------- */
  document.documentElement.dataset.theme = Store.state.theme;
  window.addEventListener('hashchange', renderRoute);
  window.App = { refresh: renderRoute };
  window.SH_PWA && SH_PWA.init();
  renderRoute();
})();
