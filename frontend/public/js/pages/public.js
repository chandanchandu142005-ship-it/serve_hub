/* ============ SERVEHUB PUBLIC PAGES ============ */
window.Public = (() => {
  const { icon, money, esc, stars, ratingPill, avatar, skel, toast } = U;

  /* ---------- shared card builders ---------- */
  const catArt = c => `
    <div class="cat-art" style="background:${c.g};position:absolute;inset:0;overflow:hidden">
      ${c.img ? `<img src="${c.img}" alt="${esc(c.name)}" style="width:100%;height:100%;object-fit:cover;opacity:.18;transition:transform .35s,opacity .3s" class="cat-img" onerror="this.style.display='none'">` : ''}
    </div>`;
  const catCard = c => `
    <a class="card card-hover cat-card reveal" href="#/category/${c.slug}" data-reveal style="position:relative">
      ${catArt(c)}
      <div class="c-ic" style="background:${c.g}">${icon(c.icon, 22)}</div>
      <h3>${esc(c.name)}</h3>
      <p>${esc(c.tag.split(',')[0])}</p>
      <div class="c-foot"><span>Starts from <span class="price">${money(c.price)}</span></span><span>${ratingPill(c.rating)}</span></div>
    </a>`;
  const svcCard = (s, hideTag) => `
    <div class="card card-hover svc-card reveal" data-reveal>
      <div class="svc-art">
        ${s.img
          ? `<img src="${s.img}" alt="${esc(s.name)}" class="svc-photo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ''}
        <div class="art-bg" style="background:${s.g};${s.img ? 'display:none' : ''}">${icon(s.icon, 54)}</div>
        ${!hideTag ? `<span class="art-tag">${esc(DATA.catBySlug(s.cat)?.name || '')}</span>` : ''}
        ${s.isCheapest ? `<span class="cheapest-badge" title="Lowest price in this category">💰 Cheapest</span>` : ''}
        <button class="art-heart ${Store.isWish(s.id) ? 'on' : ''}" data-act="wish" data-id="${s.id}" aria-label="Save to wishlist" title="Save">${icon(Store.isWish(s.id) ? 'heart' : 'heart', 16)}</button>
      </div>
      <div class="svc-body">
        <h3><a href="#/service/${s.id}" style="color:inherit">${esc(s.name)}</a></h3>
        <div class="svc-meta">${ratingPill(s.rating)}<span>${s.bookings.toLocaleString('en-IN')} bookings</span><span>${icon('clock', 13)} ${esc(s.dur)}</span></div>
        <div class="svc-foot"><div><span class="xsmall muted" style="display:block;font-weight:600">Starting from</span><span class="svc-price">${money(s.price)} <small>${esc(s.unit)}</small></span></div>
          <div style="display:flex;gap:6px">
            <a class="btn btn-soft btn-sm" href="#/service/${s.id}">View Details</a>
            <a class="btn btn-primary btn-sm" href="#/book/${s.id}">Book Now</a>
          </div>
        </div>
      </div>
    </div>`;
  const proCard = p => `
    <div class="card card-hover pro-card reveal" data-reveal>
      <div class="pro-head">
        ${avatar(p.name, 52, p.id.charCodeAt(1))}
        <div class="pro-info">
          <h3>${esc(p.name)}</h3>
          <div class="small muted">${esc(p.role)} • ${esc(p.city || 'Bengaluru')}</div>
          <div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">${ratingPill(p.rating)} ${p.verified ? '<span class="verified">' + icon('badgeCheck', 11) + ' Verified</span>' : ''}${p.avail ? `<span class="pro-avail ${p.avail === 'Available Today' ? 'ok' : 'later'}">${icon('clock', 11)} ${esc(p.avail)}</span>` : ''}</div>
        </div>
        <button class="icon-btn ${Store.isFav(p.id) ? 'on' : ''}" data-act="fav" data-id="${p.id}" aria-label="Favorite" style="${Store.isFav(p.id) ? 'color:var(--danger)' : ''}">${icon('heart', 17)}</button>
      </div>
      <div class="pro-tags">${p.tags.slice(0, 3).map(t => `<span class="pro-tag">${esc(t)}</span>`).join('')}<span class="pro-tag pro-tag-demo">Sample profile</span></div>
      <div class="pro-stats">
        <span><b>${p.jobs.toLocaleString('en-IN')}</b>Jobs done</span>
        <span><b>${p.exp} yrs</b>Experience</span>
        <span><b>${p.dist} km</b>Away</span>
      </div>
      <div class="pro-stats" style="border-top:none;padding-top:0">
        <span style="font-weight:800;font-size:16px;color:var(--success-600)">${money(p.rate)}<span class="xsmall muted" style="font-weight:500">/hr</span></span>
        <div style="display:flex;gap:6px">
          <button class="btn btn-soft btn-sm" data-act="pro-call" data-id="${p.id}">${icon('phone', 13)} Call</button>
          <a class="btn btn-primary btn-sm" href="#/service/${DATA.servicesByCat(p.cat)[0]?.id || 's1'}">Book</a>
        </div>
      </div>
    </div>`;

  const secHead = (kicker, title, lead, link, linkLabel) => `
    <div class="sec-head">
      <div><span class="kicker">${icon('sparkles', 13)}${kicker}</span><h2 class="h2">${title}</h2>${lead ? `<p class="lead">${lead}</p>` : ''}</div>
      ${link ? `<a class="btn btn-outline btn-sm" href="#/${link}">${linkLabel || 'View all'} ${icon('arrowRight', 15)}</a>` : ''}
    </div>`;

  /* ============================================================
     LANDING
  ============================================================ */
  const Landing = () => {
    const rec = JSON.parse(localStorage.getItem('sh:recent') || '[]').slice(0, 4);
    const recent = rec.map(DATA.serviceById).filter(Boolean);
    return `
    <section class="hero">
      <div class="container">
        <div class="hero-grid">
          <div>
            <div class="hero-badge"><span class="pulse"></span> Rated 4.8/5 by 2.4M+ happy customers</div>
            <h1 class="display">Home services,<br><span class="grad-text">booked in seconds.</span></h1>
            <p class="lead">Verified professionals for cleaning, repairs, salon, spa &amp; more — transparent pricing, live tracking and a 100% service warranty on every booking.</p>
            <div class="searchbar">
              <button class="sb-field" data-act="search" aria-label="Search services">
                ${icon('search', 20)}<span><span class="sb-label">What do you need?</span><span class="sb-value" style="display:block">Search services, pros…</span></span>
              </button>
              <span class="sb-div"></span>
              <button class="sb-field" data-act="location" aria-label="Change location" title="Set your location">
                ${icon('pin', 20)}<span><span class="sb-label">Location</span><span class="sb-value" style="display:block">${esc(Store.currentLocation().label)}</span></span>
              </button>
              <span class="sb-div"></span>
              <button class="btn btn-cta btn-lg" data-act="search">${icon('search', 17)} Book Now</button>
            </div>
            <div class="hero-trust">
              <div class="trust-item"><span class="t-ic">${icon('shieldCheck', 17)}</span>100% verified experts</div>
              <div class="trust-item"><span class="t-ic">${icon('navigation', 17)}</span>Live booking tracking</div>
              <div class="trust-item"><span class="t-ic">${icon('refreshCw', 17)}</span>Free rescheduling</div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="vis-inner">
              <div class="phone">
                <div class="ph-screen">
                  <div class="ph-top"><span>Servehub</span><span class="badge badge-success">On the way</span></div>
                  <div class="ph-progress"><i></i></div>
                  <div class="ph-card">
                    <div class="ph-row">${avatar('Priya Menon', 34)}<div><div style="font-weight:800;font-size:13px">Priya Menon</div><div class="ph-status">Deep Cleaning Expert • ★ 4.9</div></div></div>
                    <div style="display:flex;gap:8px;margin-top:12px">
                      <span class="ph-ava" style="background:#10B981">${icon('phone', 14)}</span>
                      <span class="ph-ava" style="background:#8B5CF6">${icon('chat', 14)}</span>
                      <span class="ph-ava" style="background:#F59E0B">${icon('video', 14)}</span>
                      <span style="margin-left:auto;font-weight:800;font-size:13px;color:#34D399">₹499</span>
                    </div>
                  </div>
                  <div class="ph-timeline">
                    <div class="ph-step done"><span class="ph-dot">${icon('check', 9)}</span><span>Booking confirmed</span></div>
                    <div class="ph-step done"><span class="ph-dot">${icon('check', 9)}</span><span>Professional assigned</span></div>
                    <div class="ph-step now"><span class="ph-dot"></span><span>Arriving in ~8 min</span></div>
                    <div class="ph-step"><span class="ph-dot"></span><span>Service started</span></div>
                    <div class="ph-step"><span class="ph-dot"></span><span>Payment &amp; rating</span></div>
                  </div>
                </div>
              </div>
              <div class="float-chip fc-1">${'<span class="fc-ic" style="background:linear-gradient(135deg,#10B981,#14B8A6)">' + icon('wallet', 18) + '</span><span>₹150 cashback<small>credited to wallet</small></span>'}</div>
              <div class="float-chip fc-2">${'<span class="fc-ic" style="background:linear-gradient(135deg,#F59E0B,#F97316)">' + icon('zap', 18) + '</span><span>48k+ pros online<small>in your city right now</small></span>'}</div>
              <div class="float-chip fc-3">${'<span class="fc-ic" style="background:linear-gradient(135deg,#8B5CF6,#EC4899)">' + icon('starF', 18) + '</span><span>4.8 ★ average rating<small>1.2M+ reviews</small></span>'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="strip"><div class="strip-inner">
      ${['Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'].map((c, i) => `<span class="strip-item"><span class="s-ic" style="background:linear-gradient(135deg,hsl(${(i * 47) % 360},70%,55%),hsl(${(i * 47 + 60) % 360},70%,55%))">${icon('pin', 14)}</span>${c}</span>`).join('')}
    </div></section>

    <section class="section" style="padding-bottom:40px">
      <div class="container">
        ${secHead('Categories', 'What do you need done today?', '16 categories, 340+ services, one tap away. Transparent pricing shown before you book.', 'categories', 'All categories')}
        <div class="grid g4">${DATA.categories.slice(0, 8).map(catCard).join('')}</div>
      </div>
    </section>

    <section class="section" style="padding-top:40px">
      <div class="container">
        ${secHead('Trending', 'Popular right now', 'The services everyone is booking this week — with real-time demand and ratings.', 'categories', 'Explore all')}
        <div class="grid g4">${DATA.trending().slice(0, 4).map(s => svcCard(s)).join('')}</div>
      </div>
    </section>

    <section class="section" style="padding-top:8px;background:var(--grad-soft);border-block:1px solid var(--line-2)">
      <div class="container">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span class="kicker" style="margin-bottom:0">${icon('sparkles', 13)}AI Service Recommendations</span></div>
        <div class="sec-head" style="margin-bottom:24px">
          <div><h2 class="h2">Handpicked for you <span style="display:inline-flex;vertical-align:middle">${icon('sparkles', 24)}</span></h2><p class="lead">Our AI looks at your past bookings, ratings and city trends to recommend exactly what your home needs next.</p></div>
        </div>
        <div class="grid g4">${DATA.recommended().map((s, i) => svcCard(s)).join('')}</div>
        <div class="center" style="margin-top:22px"><a class="btn btn-outline" href="#/categories">See why these were chosen ${icon('arrowRight', 15)}</a></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${secHead('Top Rated', 'Featured professionals', 'Background-verified, skill-tested experts with thousands of happy customers.', 'categories', 'Find more pros')}
        <div class="grid g4">${DATA.pros.slice(0, 4).map(proCard).join('')}</div>
      </div>
    </section>

    <section class="section" style="padding-top:8px">
      <div class="container">
        ${secHead('Why Servehub', 'Service, without the stress', 'Everything we build is designed around one idea — booking a home service should feel effortless.')}
        <div class="grid g4">
          ${[
            ['shieldCheck', 'Verified professionals', 'Police background checks, ID verification and skill tests for every single expert on our platform.', 'linear-gradient(135deg,#2563EB,#0EA5E9)'],
            ['navigation', 'Live tracking', 'Watch your professional arrive in real time. Chat, call or video-call them directly from the booking.', 'linear-gradient(135deg,#10B981,#14B8A6)'],
            ['wallet', 'Transparent pricing', 'See the exact final price before you book — with GST invoice, coupons and wallet cashback. No hidden charges.', 'linear-gradient(135deg,#8B5CF6,#EC4899)'],
            ['shield', '100% warranty', 'Not happy? We re-serve for free or refund in full within 48 hours. That is our promise on every booking.', 'linear-gradient(135deg,#F59E0B,#F97316)'],
          ].map(w => `<div class="card card-hover why-card reveal" data-reveal><div class="w-ic" style="background:${w[3]}">${icon(w[0], 24)}</div><h3>${w[1]}</h3><p>${w[2]}</p></div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:8px">
      <div class="container">
        ${secHead('How it works', 'Booked in 60 seconds', 'Three simple steps between you and a spotless home.')}
        <div class="grid g3">
          ${[
            ['search', '1. Tell us what you need', 'Pick a service, choose a variant and see the exact price — including duration, inclusions and GST.', 'var(--primary)'],
            ['calendar', '2. Pick a time that works', 'Choose date, time slot and your preferred professional. Instant or scheduled — you decide.', 'var(--success)'],
            ['checkCircle', '3. Relax, we handle the rest', 'Track your expert live, pay securely after service, and rate your experience. Cashback lands instantly.', 'var(--violet)'],
          ].map(s => `<div class="card why-card reveal" data-reveal style="background:var(--surface);border-style:dashed"><div class="w-ic" style="background:${s[3]}">${icon(s[0], 24)}</div><h3>${s[1]}</h3><p>${s[2]}</p></div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:8px">
      <div class="container">
        ${secHead('Testimonials', 'Loved by millions of homes', 'Real stories from real customers, in their own words.')}
        <div class="carousel" data-carousel>
          <button class="car-btn prev" aria-label="Previous">${icon('arrowLeft', 18)}</button>
          <div class="car-track" style="padding-left:2px">
            ${DATA.testimonials.map(t => `<div class="card testi-card" style="width:330px">
              <div>${stars(t.rating)}</div>
              <p class="testi-quote">“${esc(t.text)}”</p>
              <div class="t-head">${avatar(t.name, 44)}<div><b style="font-size:14px">${esc(t.name)}</b><div class="xsmall muted">${esc(t.role)}</div></div><span class="verified" style="margin-left:auto">${icon('badgeCheck', 11)} Verified</span></div>
            </div>`).join('')}
          </div>
          <button class="car-btn next" aria-label="Next">${icon('arrowRight', 18)}</button>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:8px">
      <div class="container">
        <div class="grid g2" style="grid-template-columns:1fr 1fr;align-items:center;gap:64px">
          <div class="app-visual">
            <div class="app-phone">
              <div class="ap-screen">
                <div style="font-weight:900;font-size:19px;letter-spacing:-.02em">Servehub<span style="color:#60A5FA">.</span></div>
                <div class="ph-card" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12)">
                  <div class="ph-row">${avatar('Rohit Nair', 34)}<div><div style="font-weight:800;font-size:12.5px">Rohit Nair</div><div class="ph-status">Painting Expert • ★ 4.5</div></div></div>
                  <div style="margin-top:10px;font-size:11px;color:#93C5FD;font-weight:700">BOOKING SH204893 • IN PROGRESS</div>
                  <div class="ph-progress" style="margin-top:8px"><i style="animation-duration:1.4s;width:72%"></i></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                  <div class="ph-card"><div style="font-size:9.5px;color:#94A3B8;font-weight:700">WALLET</div><div style="font-weight:900;font-size:15px;color:#34D399">₹2,540</div></div>
                  <div class="ph-card"><div style="font-size:9.5px;color:#94A3B8;font-weight:700">POINTS</div><div style="font-weight:900;font-size:15px;color:#FBBF24">1,280 ★</div></div>
                </div>
                <div class="ph-card" style="display:flex;gap:8px"><span class="ph-ava" style="background:#10B981">${icon('phone', 13)}</span><span class="ph-ava" style="background:#8B5CF6">${icon('chat', 13)}</span><span class="ph-ava" style="background:#F59E0B">${icon('video', 13)}</span><span style="margin-left:auto;font-size:10.5px;color:#94A3B8;font-weight:600">Live support</span></div>
              </div>
            </div>
            <div class="float-chip" style="top:-6px;right:-30px;animation-delay:1.2s">${'<span class="fc-ic" style="background:linear-gradient(135deg,#10B981,#14B8A6)">' + icon('percent', 18) + '</span><span>Save 10%<small>with Servehub Plus</small></span>'}</div>
          </div>
          <div>
            <span class="kicker">${icon('smartphone', 13)}Servehub App</span>
            <h2 class="h2" style="margin-bottom:14px">Your home, in your pocket.<br><span class="grad-text">Everything, one app.</span></h2>
            <p class="lead">Book services, track experts live, chat, pay securely, earn cashback and manage subscriptions — all from the palm of your hand.</p>
            <ul style="margin:22px 0;display:flex;flex-direction:column;gap:12px">
              ${[['zap', 'Instant & emergency booking, 24×7'], ['bell', 'Smart reminders and offer notifications'], ['wallet', 'Wallet, coupons, gift cards & loyalty points'], ['mic', 'Voice search — just say what you need']].map(f => `<li style="display:flex;gap:12px;align-items:center;font-weight:600"><span class="t-ic" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:var(--primary-50);color:var(--primary-600)">${icon(f[0], 17)}</span>${f[1]}</li>`).join('')}
            </ul>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-cta btn-lg" data-act="install-app">${icon('smartphone', 18)} Get the app</button>
              <button class="btn btn-outline btn-lg" data-act="share-app">${icon('share', 18)} Share with friends</button>
            </div>
            <div class="app-badges" style="margin-top:16px">
              <button class="badge-cta" data-act="android-app" aria-label="Get Servehub for Android">${icon('android', 20)}<span><small>Get it on</small><b>Android</b></span></button>
              <button class="badge-cta" data-act="install-app" aria-label="Install on iPhone or iPad">${icon('smartphone', 20)}<span><small>Add to Home Screen</small><b>iPhone & iPad</b></span></button>
              <button class="badge-cta" data-act="install-app" aria-label="Install on Windows or Mac">${icon('monitor', 20)}<span><small>Install on</small><b>Windows / Mac</b></span></button>
            </div>
            <p class="xsmall muted" style="margin-top:10px">Free • full-screen • works offline • no App Store needed.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:8px">
      <div class="container" style="max-width:820px">
        ${secHead('FAQ', 'Frequently asked questions', 'Everything you need to know about booking with Servehub.')}
        <div id="faq-root">${DATA.faqs.slice(0, 6).map((f, i) => `
          <div class="acc ${i === 0 ? 'open' : ''}">
            <button class="acc-head">${esc(f.q)} ${icon('chevronDown', 17)}</button>
            <div class="acc-body" ${i === 0 ? 'style="max-height:200px"' : ''}><div class="acc-body-in">${esc(f.a)}</div></div>
          </div>`).join('')}
        </div>
        <div class="center" style="margin-top:24px"><a class="btn btn-outline" href="#/faq">View all FAQs ${icon('arrowRight', 15)}</a></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="cta-banner">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:28px;flex-wrap:wrap;position:relative">
            <div><h2>Your home deserves better.<br>Book your first service today.</h2><p>Get ₹50 off your first booking with code WELCOME50 — plus 10% cashback in your wallet.</p></div>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <a class="btn btn-white btn-lg" href="#/categories">Book a service</a>
              <a class="btn btn-lg" href="#/register" style="background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.4);backdrop-filter:blur(6px)">Join as professional</a>
            </div>
          </div>
        </div>
      </div>
    </section>
    ${recent.length ? `<section class="section" style="padding-top:0"><div class="container">${secHead('history', 'Recently viewed', 'Pick up right where you left off.')}<div class="grid g4">${recent.map(s => svcCard(s)).join('')}</div></div></section>` : ''}
    `;
  };

  /* ============================================================
     CATEGORIES
  ============================================================ */
  const Categories = () => `
    <section class="page-hero">
      <div class="container">
        <div class="crumbs"><a href="">Home</a><span>/</span><span>Categories</span></div>
        <h1 class="h2" style="font-size:clamp(28px,4vw,40px)">Browse all services</h1>
        <p class="lead" style="margin-top:8px">17 categories, 340+ services, 12,000+ verified professionals. Pick a category and get booked in under a minute.</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px" id="cat-filter">
          ${['All', ...DATA.categories.map(c => c.name)].map((n, i) => `<button class="f-chip ${i === 0 ? 'on' : ''}" data-cat-filter="${i === 0 ? 'all' : DATA.categories[i - 1].slug}">${n}</button>`).join('')}
        </div>
        <div class="grid g4" id="cat-grid">${DATA.categories.map(catCard).join('')}</div>
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="grid g2" style="grid-template-columns:1.2fr .8fr;align-items:center;gap:40px">
          <div>
            <span class="kicker">${icon('briefcase', 13)}For professionals</span>
            <h2 class="h2">Earn ₹30,000+ a month on your schedule.</h2>
            <p class="lead" style="margin-top:10px">Join 12,000+ verified professionals earning with Servehub. Set your own hours, get steady bookings, and grow with free training.</p>
            <div style="display:flex;gap:12px;margin-top:22px;flex-wrap:wrap">
              <a class="btn btn-cta btn-lg" href="#/become-pro">${icon('rocket', 18)} Apply to become a pro</a>
              <a class="btn btn-outline btn-lg" href="#/login">Log in as professional</a>
            </div>
          </div>
          <div class="card glass" style="padding:26px;position:relative;overflow:hidden">
            <div style="position:absolute;top:-30px;right:-30px;width:140px;height:140px;border-radius:50%;background:var(--grad);opacity:.1"></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:18px"><span class="badge badge-success">${icon('trendingUp', 12)} +32% this month</span><span class="badge badge-neutral">Live</span></div>
            <div style="font-size:34px;font-weight:900">₹38,400<span class="small muted" style="font-weight:600">  avg. monthly earnings</span></div>
            ${U.barChart([42, 55, 48, 62, 58, 71, 66, 79, 74, 86, 82, 96], ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'])}
          </div>
        </div>
      </div>
    </section>`;

  const CategoriesWire = root => {
    U.$$('[data-cat-filter]', root).forEach(btn => btn.addEventListener('click', () => {
      U.$$('[data-cat-filter]', root).forEach(b => b.classList.toggle('on', b === btn));
      const slug = btn.dataset.catFilter;
      U.$('#cat-grid', root).innerHTML = DATA.categories.filter(c => slug === 'all' || c.slug === slug).map(catCard).join('');
      U.observeReveals(root);
    }));
  };

  /* ============================================================
     CATEGORY PAGE
  ============================================================ */
  const CategoryPage = ({ slug }) => {
    const c = DATA.catBySlug(slug);
    if (!c) return `<section class="section"><div class="container"><div class="empty-state"><div class="e-ic">${icon('alert', 30)}</div><h3>Category not found</h3><a class="btn btn-primary" href="#/categories">Browse categories</a></div></div></section>`;
    const svcs = DATA.searchServices('', { category: slug });
    const pros = DATA.pros.filter(p => p.cat === slug);
    return `
    <section class="page-hero">
      <div class="container">
        <div class="crumbs"><a href="">Home</a><span>/</span><a href="#/categories">Categories</a><span>/</span><span>${esc(c.name)}</span></div>
        <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">
          <div class="c-ic" style="width:64px;height:64px;border-radius:18px;background:${c.g};display:grid;place-items:center;color:#fff;box-shadow:0 10px 24px rgba(0,0,0,.2)">${icon(c.icon, 30)}</div>
          <div style="flex:1;min-width:240px">
            <h1 class="h2" style="font-size:clamp(26px,3.6vw,36px)">${esc(c.name)}</h1>
            <p class="muted" style="margin-top:6px;max-width:560px">${esc(c.desc)}</p>
          </div>
          <div style="display:flex;gap:26px">
            <div style="text-align:center"><div style="font-size:22px;font-weight:900;color:var(--success-600)">${money(c.price)}</div><div class="xsmall muted" style="font-weight:600">starts from</div></div>
            <div style="text-align:center"><div style="font-size:22px;font-weight:900">${c.rating}★</div><div class="xsmall muted" style="font-weight:600">avg. rating</div></div>
            <div style="text-align:center"><div style="font-size:22px;font-weight:900">${(c.bookings / 1000).toFixed(1)}k</div><div class="xsmall muted" style="font-weight:600">bookings</div></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="sec-head"><div><h2 class="h2">${esc(c.name)} services</h2><p class="lead">Book in seconds, get it done right.</p></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap" id="svc-filters">
            <button class="f-chip on" data-sort="recommended">Recommended</button>
            <button class="f-chip" data-sort="low">Price: Low to High</button>
            <button class="f-chip" data-sort="high">Price: High to Low</button>
            <button class="f-chip" data-sort="rating">Top rated</button>
          </div>
        </div>
        <div class="grid g3" id="svc-grid">${svcs.map(s => svcCard(s)).join('')}</div>
      </div>
    </section>

    ${pros.length ? `<section class="section" style="padding-top:0"><div class="container">
      ${secHead('Professionals', `Top ${esc(c.name)} experts`, `Verified pros in ${esc(c.name)} ready for instant or scheduled bookings.`, 'categories', 'Browse all')}
      <div class="grid g4">${pros.map(proCard).join('')}</div>
    </div></section>` : ''}

    <section class="section" style="padding-top:0"><div class="container">
      ${secHead('Explore', 'You may also like', 'More ways to keep your home running perfectly.')}
      <div class="grid g4">${DATA.categories.filter(x => x.slug !== slug).slice(0, 4).map(catCard).join('')}</div>
    </div></section>

    <section class="section" style="padding-top:0"><div class="container"><div class="cta-banner">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;position:relative">
        <div><h2>Need ${esc(c.name.toLowerCase())} today?</h2><p>Choose your slot, get a verified expert, track them live. First booking? Use code WELCOME50.</p></div>
        <a class="btn btn-white btn-lg" href="#/book/${svcs[0]?.id || 's3'}">Book ${esc(c.name)} now</a>
      </div>
    </div></div></section>`;
  };
  const CategoryWire = root => {
    U.$$('[data-sort]', root).forEach(btn => btn.addEventListener('click', () => {
      U.$$('[data-sort]', root).forEach(b => b.classList.toggle('on', b === btn));
      const slug = location.hash.split('/')[2];
      const sort = btn.dataset.sort;
      const svcs = DATA.searchServices('', { category: slug, sortBy: sort });
      U.$('#svc-grid', root).innerHTML = svcs.map(s => svcCard(s)).join('');
      U.observeReveals(root);
    }));
  };

  /* ============================================================
     SERVICE DETAILS
  ============================================================ */
  const SERVICE_FAQS = [
    { q: 'How long will the service take?', a: 'Duration varies by the service and home size. You will see the estimated duration before booking, and the expert shares a precise timeline when they arrive.' },
    { q: 'What if the expert is late?', a: 'We guarantee on-time arrival for scheduled bookings. If your expert is more than 30 minutes late, we automatically apply a discount on the booking.' },
    { q: 'What about spare parts or materials?', a: 'Minor consumables are included. For major parts, the expert shares a transparent quote with photos before replacing anything — you approve first, always.' },
    { q: 'Is there a service warranty?', a: 'Every booking includes our 100% service warranty. If anything is not right within 48 hours, we re-serve for free or refund in full.' },
  ];
  const ServicePage = ({ id }) => {
    const s = DATA.serviceById(id);
    if (!s) return `<section class="section"><div class="container"><div class="empty-state"><div class="e-ic">${icon('alert', 30)}</div><h3>Service not found</h3><a class="btn btn-primary" href="#/categories">Browse services</a></div></div></section>`;
    try {
      const rec = JSON.parse(localStorage.getItem('sh:recent') || '[]');
      localStorage.setItem('sh:recent', JSON.stringify([id, ...rec.filter(x => x !== id)].slice(0, 8)));
    } catch (e) {}
    const cat = DATA.catBySlug(s.cat);
    const packs = [
      { name: 'Standard', price: s.price, dur: s.dur, desc: 'Everything included, great value' },
      { name: 'Premium', price: Math.round(s.price * 1.3 / 10) * 10, dur: s.dur + ' + 30 min', desc: 'Senior expert + premium products' },
      { name: 'Express', price: Math.round(s.price * 1.15 / 10) * 10, dur: 'Priority slot', desc: 'Booked for today, faster arrival' },
    ];
    const pros = DATA.prosForService(s);
    const related = DATA.related(s);
    const dist = [62, 21, 9, 4, 2, 1, 1];
    const reviews = DATA.reviews;
    const avg = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
    return `
    <section class="page-hero" style="padding-bottom:0">
      <div class="container">
        <div class="crumbs"><a href="">Home</a><span>/</span><a href="#/categories">Categories</a><span>/</span><a href="#/category/${s.cat}">${esc(cat.name)}</a><span>/</span><span>${esc(s.name)}</span></div>
      </div>
    </section>
    <section class="section" style="padding-top:28px">
      <div class="container">
        <div class="grid" style="grid-template-columns:1.6fr 1fr;gap:36px;align-items:start">
          <div style="min-width:0">
            <div class="card" style="overflow:hidden">
              <div class="svc-art" style="height:280px;position:relative;background:var(--surface-2)">
                ${s.img ? `<img src="${s.img}" alt="${esc(s.name)}" class="svc-photo" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
                <div class="art-bg" style="background:${s.g};${s.img ? 'display:none' : ''}">${icon(s.icon, 96)}</div>
                <span class="art-tag" style="top:16px;left:16px">${esc(cat.name)}</span>
                <button class="art-heart ${Store.isWish(s.id) ? 'on' : ''}" data-act="wish" data-id="${s.id}" style="top:14px;right:14px;width:38px;height:38px">${icon('heart', 18)}</button>
              </div>
            </div>
            <div class="card" style="padding:26px;margin-top:20px">
              <div class="svc-meta" style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px">${ratingPill(s.rating)}<span class="muted small" style="font-weight:600">${s.bookings.toLocaleString('en-IN')} bookings</span><span class="badge badge-neutral">${icon('clock', 12)} ${esc(s.dur)}</span><span class="badge badge-success">${icon('shieldCheck', 12)} 100% warranty</span></div>
              <h1 class="h3" style="font-size:clamp(22px,3vw,30px);margin-bottom:12px">${esc(s.name)}</h1>
              <p class="muted">${esc(s.desc)}</p>
              <hr class="divider">
              <h3 style="margin-bottom:14px;font-size:16px">What's included</h3>
              <ul style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${s.inc.map(i => `<li style="display:flex;gap:9px;align-items:flex-start;font-size:14px"><span style="color:var(--success);margin-top:2px">${icon('checkCircle', 15)}</span>${esc(i)}</li>`).join('')}</ul>
              <hr class="divider" style="margin:22px 0">
              <h3 style="margin-bottom:14px;font-size:16px">What's not included</h3>
              <ul style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${DATA.notIncOf(s).map(i => `<li style="display:flex;gap:9px;align-items:flex-start;font-size:14px"><span style="color:var(--ink-4);margin-top:2px">${icon('x', 14)}</span>${esc(i)}</li>`).join('')}</ul>
            </div>
            <div class="card" style="padding:26px;margin-top:20px">
              <h3 style="font-size:16px;margin-bottom:6px">Choose your package</h3>
              <p class="small muted" style="margin-bottom:16px">Prices include expert fee, standard materials and GST invoice. <a href="#/book/${s.id}" style="color:var(--primary-600);font-weight:700">Book now →</a></p>
              ${packs.map((p, i) => `<div class="pack-row ${i === 0 ? 'on' : ''}" data-pack="${i}" style="cursor:default"><div><div class="pk-name">${p.name} <span class="badge badge-success" style="margin-left:6px">${i === 1 ? 'Best value' : i === 2 ? 'Urgent' : 'Popular'}</span></div><div class="pk-desc">${p.desc} • ${p.dur}</div></div><div class="pk-price">${money(p.price)}</div></div>`).join('')}
              <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
                <a class="btn btn-cta btn-lg" href="#/book/${s.id}" style="flex:1">${icon('calendar', 18)} Book Appointment</a>
                <button class="btn btn-outline btn-lg" data-act="wish" data-id="${s.id}">${icon('heart', 18)} Save</button>
              </div>
            </div>
            <div class="card" style="padding:26px;margin-top:20px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
                <div><h3 style="font-size:17px">Customer reviews</h3><div style="display:flex;align-items:center;gap:10px;margin-top:6px"><span style="font-size:30px;font-weight:900">${avg}</span>${stars(avg)}<span class="small muted">${reviews.length} verified reviews</span></div></div>
                <div style="display:flex;gap:8px" id="rv-filters">
                  <button class="f-chip on" data-rv="all">All</button><button class="f-chip" data-rv="5">5★</button><button class="f-chip" data-rv="4">4★</button><button class="f-chip" data-rv="3">3★ &amp; below</button>
                </div>
              </div>
              <div class="grid g2" style="grid-template-columns:150px 1fr;gap:20px;margin-bottom:24px">
                <div>${dist.map((d, i) => `<div style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:6px"><span style="width:16px;font-weight:700">${5 - i}★</span><div class="progress"><i style="width:${d}%"></i></div><span class="small muted">${d}%</span></div>`).join('')}</div>
                <div class="card glass" style="padding:18px;display:flex;flex-direction:column;gap:10px;justify-content:center">
                  <div style="font-weight:800">${icon('shieldCheck', 16)} Our review policy</div>
                  <p class="small muted" style="line-height:1.55">Only customers who completed a booking can review. ${reviews.filter(r => r.v).length} of ${reviews.length} reviews are from verified customers.</p>
                  <button class="btn btn-soft btn-sm" style="align-self:flex-start" data-act="toast" data-msg="Review written? It will appear after moderation ✅">Write a review</button>
                </div>
              </div>
              <div id="rv-list">${reviews.map(rv => `
                <div class="list-row" data-rv-val="${rv.rating}" style="align-items:flex-start">
                  ${avatar(rv.name, 42)}<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><b style="font-size:14px">${esc(rv.name)}</b>${rv.v ? '<span class="verified">' + icon('badgeCheck', 11) + ' Verified</span>' : ''}<span class="small muted" style="margin-left:auto">${esc(rv.date)}</span></div>
                  <div style="margin:6px 0">${stars(rv.rating)}</div>
                  <p class="small muted">${esc(rv.text)}</p>
                  <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">${rv.tags.map(t => `<span class="pro-tag">${esc(t)}</span>`).join('')}${rv.hasImg ? '<span class="pro-tag" style="background:var(--primary-50);color:var(--primary-700)">' + icon('camera', 11) + ' 2 photos</span>' : ''}</div>
                  <div style="display:flex;gap:14px;margin-top:12px"><button class="small" style="font-weight:600;color:var(--ink-3);display:flex;gap:5px;align-items:center" data-act="helpful" data-id="${esc(rv.name)}">${icon('thumbsUp', 14)} Helpful (${rv.helpful})</button><button class="small muted" data-act="toast" data-msg="Flag sent to moderation team">${icon('flag', 13)} Flag</button></div>
                  </div>
                </div>`).join('')}</div>
            </div>
            <div class="card" style="padding:26px;margin-top:20px">
              <h3 style="font-size:16px;margin-bottom:16px">Frequently asked questions</h3>
              ${SERVICE_FAQS.map((f, i) => `<div class="acc ${i === 0 ? 'open' : ''}"><button class="acc-head">${esc(f.q)} ${icon('chevronDown', 17)}</button><div class="acc-body" ${i === 0 ? 'style="max-height:200px"' : ''}><div class="acc-body-in">${esc(f.a)}</div></div></div>`).join('')}
            </div>
          </div>
          <aside style="min-width:0">
            <div class="card summary-card" style="padding:24px">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">${avatar(cat.name, 46, 3)}<div><b>${esc(cat.name)}</b><div class="xsmall muted">Service ID: ${esc(s.id.toUpperCase())}</div></div></div>
              <div class="price-list">
                <div class="price-row"><span class="muted">Base price</span><b>${money(s.price)}</b></div>
                <div class="price-row"><span class="muted">Duration</span><b>${esc(s.dur)}</b></div>
                <div class="price-row"><span class="muted">GST (18%)</span><b>${money(Math.round(s.price * 0.18))}</b></div>
                <div class="sum-total"><span>Total</span><span class="grad-text">${money(Math.round(s.price * 1.18))}</span></div>
              </div>
              <a class="btn btn-cta btn-lg btn-block" style="margin-top:18px" href="#/book/${s.id}">${icon('calendar', 18)} Book Now</a>
              <a class="btn btn-outline btn-block" style="margin-top:10px" href="tel:+918045678900">${icon('phone', 16)} Call Support — +91 80 4567 8900</a>
              <button class="btn btn-outline btn-block" style="margin-top:10px" data-act="chat-popup">${icon('chat', 17)} Chat with us</button>
              <div class="small muted center" style="margin-top:14px">${icon('lock', 12)} Secure payment • Free cancellation 24h</div>
            </div>
            <div class="card summary-card" style="padding:24px;margin-top:20px">
              <h3 style="font-size:15px;margin-bottom:14px">Top experts for this service</h3>
              ${pros.map(p => `<div class="list-row" style="padding:10px 0">
                ${avatar(p.name, 40)}<div style="flex:1;min-width:0"><b style="font-size:13.5px">${esc(p.name)}</b><div class="xsmall muted">${ratingPill(p.rating)} • ${p.jobs.toLocaleString('en-IN')} jobs</div></div>
                <a class="btn btn-soft btn-sm" href="#/book/${s.id}">Book</a>
              </div>`).join('')}
            </div>
          </aside>
        </div>
      </div>
    </section>
    <section class="section" style="padding-top:0"><div class="container">
      ${secHead('Related', 'You might also like', 'More services to keep your home in top shape.')}
      <div class="grid g4">${related.map(r => svcCard(r)).join('')}</div>
    </div></section>`;
  };
  const ServiceWire = root => {
    U.$$('[data-rv]', root).forEach(btn => btn.addEventListener('click', () => {
      U.$$('[data-rv]', root).forEach(b => b.classList.toggle('on', b === btn));
      const v = btn.dataset.rv;
      U.$$('[data-rv-val]', root).forEach(row => {
        const show = v === 'all' || (v === '3' ? Number(row.dataset.rvVal) <= 3 : Number(row.dataset.rvVal) === Number(v));
        row.style.display = show ? '' : 'none';
      });
    }));
  };

  /* ============================================================
     STATIC PAGES
  ============================================================ */
  const staticPages = {
    about: {
      title: 'About Servehub', kicker: 'Our story',
      body: `
      <section class="page-hero"><div class="container">
        <div class="crumbs"><a href="">Home</a><span>/</span><span>About us</span></div>
        <h1 class="h2" style="font-size:clamp(28px,4vw,40px)">We exist to make home services <span class="grad-text">effortless.</span></h1>
        <p class="lead" style="margin-top:10px">Servehub started in 2021 with one belief — booking a home service should be as easy as ordering food.</p>
      </div></section>
      <section class="section"><div class="container">
        <div class="grid g2" style="grid-template-columns:1.2fr .8fr;gap:48px;align-items:center">
          <div>
            <h2 class="h3" style="margin-bottom:14px">From 3 cities to 14 — and counting.</h2>
            <p class="muted" style="margin-bottom:16px">What began with 40 professionals in three Indian cities is now a full-fledged home services platform serving over 2.4 million customers with 12,000+ verified experts across 14 cities.</p>
            <p class="muted" style="margin-bottom:22px">Every feature we build — live tracking, transparent pricing, 100% warranty, instant refunds — is a direct response to what customers told us frustrated them about traditional home services.</p>
            <div class="grid g4" style="grid-template-columns:repeat(4,1fr);gap:14px">
              ${[['2.4M+', 'Customers served'], ['12k+', 'Verified pros'], ['14', 'Cities live'], ['340+', 'Services']].map(s => `<div class="card" style="padding:16px;text-align:center"><div style="font-size:22px;font-weight:900;color:var(--primary-600)">${s[0]}</div><div class="xsmall muted" style="font-weight:600">${s[1]}</div></div>`).join('')}
            </div>
          </div>
          <div class="card glass" style="padding:26px">
            <h3 style="font-size:16px;margin-bottom:16px">Our mission</h3>
            <p style="font-size:19px;font-weight:700;line-height:1.5">“To make every home in India run beautifully, by putting trusted, skilled professionals one tap away from every family.”</p>
            <hr class="divider">
            <div class="small muted">— Servehub founding team, 2021</div>
          </div>
        </div>
        <div class="grid g3" style="margin-top:56px">
          ${[['eye', 'Radical transparency', 'Fixed prices shown upfront. Every review from verified customers. Every professional background-checked.'], ['heart', 'Customer obsession', 'Our 100% warranty, instant refunds and 24×7 support exist because you deserve a stress-free home.'], ['zap', 'Speed & reliability', 'Booking in 60 seconds, on-time arrival promise, and live tracking on every single job.']].map(v => `<div class="card why-card reveal" data-reveal><div class="w-ic" style="background:var(--grad)">${icon(v[0], 24)}</div><h3>${v[1]}</h3><p>${v[2]}</p></div>`).join('')}
        </div>
      </div></section>`,
    },
    contact: {
      title: 'Contact Us', kicker: 'Customer support',
      body: `
      <section class="page-hero"><div class="container">
        <div class="crumbs"><a href="">Home</a><span>/</span><span>Contact us</span></div>
        <h1 class="h2" style="font-size:clamp(28px,4vw,40px)">ServeHub <span class="grad-text">Customer Support</span></h1>
        <p class="lead" style="margin-top:10px">We're here every day, <b>8:00 AM – 10:00 PM</b>. Call, email or send a message — we usually reply within 2 hours.</p>
      </div></section>
      <section class="section"><div class="container">
        <div class="grid g2" style="grid-template-columns:1fr 1fr;gap:36px;align-items:start">
          <div class="card" style="padding:28px">
            <h3 style="margin-bottom:6px">Send us a message</h3>
            <p class="small muted" style="margin-bottom:18px">Fill in the form and our support team will get back to you.</p>
            <form id="contact-form" novalidate>
              <div class="field"><label class="label" for="cf-name">Name *</label><input class="input" id="cf-name" placeholder="Your full name" autocomplete="name"></div>
              <div class="field"><label class="label" for="cf-email">Email *</label><input class="input" id="cf-email" type="email" placeholder="you@example.com" autocomplete="email"></div>
              <div class="field"><label class="label" for="cf-phone">Phone *</label><input class="input" id="cf-phone" type="tel" placeholder="+91 98765 43210" autocomplete="tel"></div>
              <div class="field"><label class="label" for="cf-svc">Service *</label><select class="select" id="cf-svc"><option value="">Select a service…</option><option>General enquiry</option>${DATA.categories.map(c => `<option>${esc(c.name)}</option>`).join('')}<option>Other</option></select></div>
              <div class="field"><label class="label" for="cf-msg">Message *</label><textarea class="textarea" id="cf-msg" style="min-height:110px" placeholder="How can we help? e.g. My AC is not cooling…"></textarea></div>
              <button class="btn btn-primary btn-lg btn-block" type="submit">${icon('send', 16)} Submit</button>
            </form>
            <div id="cf-success" style="display:none;text-align:center;padding:26px 10px">
              <div class="e-ic" style="width:72px;height:72px;border-radius:22px;background:var(--success-50);color:var(--success);display:grid;place-items:center;margin:0 auto 16px">${icon('checkCircle', 32)}</div>
              <h3 style="font-size:19px">Message sent! 🎉</h3>
              <p class="small muted" style="margin:8px 0 4px">Thank you for contacting ServeHub support. Our team will reply within <b>2 hours</b> during working hours.</p>
              <p class="xsmall muted">Working hours: Monday – Sunday, 8:00 AM – 10:00 PM</p>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="card" style="padding:20px 22px;background:var(--grad-soft);border:1px solid var(--primary-100)">
              <b style="display:flex;gap:8px;align-items:center;margin-bottom:4px">${icon('headset', 17)} ServeHub Customer Support</b>
              <p class="xsmall muted" style="line-height:1.5">These are sample professional contact details for this demo interface — not verified real-world ServeHub company details.</p>
            </div>
            ${[['phone', 'Call Now', '+91 80 4567 8900', 'tel:+918045678900', 'Main line', 'linear-gradient(135deg,#10B981,#14B8A6)', '📞 Call Now'],
               ['phone', 'Call Support', '+91 80 4567 8901', 'tel:+918045678901', 'Customer support', 'linear-gradient(135deg,#2563EB,#0EA5E9)', '📞 Call Support'],
               ['mail', 'Email Support', 'support@servehub.in', 'mailto:support@servehub.in', 'Replies within 2 hrs', 'linear-gradient(135deg,#8B5CF6,#EC4899)', '✉️ Email'],
               ['clock', 'Working Hours', 'Monday – Sunday', '', '8:00 AM – 10:00 PM', 'linear-gradient(135deg,#F59E0B,#F97316)', ''],
               ['building', 'Location', 'Bengaluru, Karnataka, India', '', 'Head office', 'linear-gradient(135deg,#06B6D4,#3B82F6)', '']].map(c => `
              <div class="card card-hover" style="padding:20px;display:flex;gap:15px;align-items:center">
                <span class="w-ic" style="width:48px;height:48px;border-radius:14px;background:${c[5]};display:grid;place-items:center;color:#fff;flex:none">${icon(c[0], 22)}</span>
                <div style="flex:1;min-width:0"><b>${c[1]}</b>
                  ${c[3] ? `<a href="${c[3]}" style="font-weight:800;font-size:15px;color:var(--primary-600);display:block;margin-top:2px">${c[2]}</a>` : `<div style="font-weight:800;font-size:15px;color:var(--ink);margin-top:2px">${c[2]}</div>`}
                  <div class="xsmall muted">${c[4]}</div></div>
                ${c[6] ? `<a class="btn btn-primary btn-sm" href="${c[3]}" style="flex:none">${c[6]}</a>` : ''}
              </div>`).join('')}
          </div>
        </div>
      </div></section>`,
    },
    faq: {
      title: 'Help Center & FAQ', kicker: 'Help center',
      body: `
      <section class="page-hero"><div class="container">
        <div class="crumbs"><a href="">Home</a><span>/</span><span>Help center</span></div>
        <h1 class="h2" style="font-size:clamp(28px,4vw,40px)">How can we help?</h1>
        <div style="max-width:560px;margin-top:22px;position:relative">${'<div style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--ink-4)">' + icon('search', 18) + '</div>'}<input class="input" id="help-search" style="padding-left:44px" placeholder="Search help articles… e.g. cancel booking, refund, invoice"></div>
      </div></section>
      <section class="section"><div class="container">
        <div class="grid g4" style="margin-bottom:40px">
          ${[['calendar', 'Bookings', 'Book, reschedule, cancel'], ['wallet', 'Payments & refunds', 'Wallet, invoices, coupons'], ['shield', 'Warranty', 'Service guarantee policy'], ['user', 'My account', 'Profile, login, settings']].map(h => `<a class="card card-hover" style="padding:22px" href="#/faq"><span class="w-ic" style="width:46px;height:46px;border-radius:13px;background:var(--grad);display:grid;place-items:center;color:#fff">${icon(h[0], 21)}</span><b style="display:block;margin:12px 0 4px">${h[1]}</b><span class="small muted">${h[2]}</span></a>`).join('')}
        </div>
        <div class="container" style="max-width:820px;padding:0" id="faq-root">
          ${DATA.faqs.map((f, i) => `<div class="acc"><button class="acc-head">${esc(f.q)} ${icon('chevronDown', 17)}</button><div class="acc-body"><div class="acc-body-in">${esc(f.a)}</div></div></div>`).join('')}
        </div>
        <div class="center" style="margin-top:36px"><p class="muted small" style="margin-bottom:12px">Still stuck? Our team replies in under 2 hours.</p><a class="btn btn-cta" href="#/contact">${icon('chat', 17)} Contact support</a></div>
      </div></section>`,
    },
    privacy: { title: 'Privacy Policy', kicker: 'Legal', body: legalPage('Privacy Policy', [
      ['Information we collect', 'We collect information you provide directly — name, phone number, email, addresses — along with booking and payment details needed to deliver services. Device and usage data helps us improve the experience.'],
      ['How we use your data', 'Your data is used to connect you with professionals, process payments, send booking updates, personalize recommendations and prevent fraud. We never sell your personal information.'],
      ['Data sharing', 'We share only what is necessary — your name, address and service details with the assigned professional, and payment details with our PCI-DSS compliant payment partners (Stripe & Razorpay).'],
      ['Your rights', 'You can access, correct or delete your personal data at any time from Settings, or by writing to privacy@servehub.in. You can also export or erase your account data.'],
      ['Cookies & security', 'We use essential and analytics cookies. All data is encrypted in transit and at rest.'],
    ]) },
    terms: { title: 'Terms & Conditions', kicker: 'Legal', body: legalPage('Terms & Conditions', [
      ['Using Servehub', 'By using Servehub you agree to provide accurate information, treat professionals with respect, and use services for lawful purposes only.'],
      ['Bookings & pricing', 'Prices shown at booking are final and inclusive of all applicable taxes. A booking is confirmed when you complete payment.'],
      ['Cancellations & refunds', 'Free cancellation up to 24 hours before the slot with instant refund. Between 24 and 6 hours, a 10% cancellation fee applies. Within 6 hours, cancellation fees may apply per city policy.'],
      ['Warranty', 'Every service includes a 48-hour workmanship warranty. Reported issues are re-served free or refunded in full.'],
      ['Limitation of liability', 'Servehub connects customers with independent professionals. Our liability is limited to the value of the booking.'],
    ]) },
    refund: { title: 'Refund Policy', kicker: 'Legal', body: legalPage('Refund Policy', [
      ['Full refunds', 'You are entitled to a 100% refund when you cancel 24+ hours before the slot, when we fail to provide a confirmed professional, or when the service is not completed.'],
      ['Partial refunds', 'Partial refunds (up to 90%) apply for partially completed services or quality issues reported within 48 hours where a re-serve is not possible.'],
      ['Refund timelines', 'Wallet refunds are instant. Card/UPI refunds are initiated within 24 hours and reflect in 3–7 business days per bank.'],
      ['Payment failures', 'If money is debited but the booking fails, we auto-refund within 24 hours. Contact support if it takes longer.'],
    ]) },
    careers: {
      title: 'Careers at Servehub', kicker: 'Join us',
      body: `
      <section class="page-hero"><div class="container">
        <div class="crumbs"><a href="">Home</a><span>/</span><span>Careers</span></div>
        <h1 class="h2" style="font-size:clamp(28px,4vw,40px)">Build the future of <span class="grad-text">home services.</span></h1>
        <p class="lead" style="margin-top:10px">We are a team of 200+ builders, designers and operators on a mission to make 400 million Indian homes run beautifully.</p>
      </div></section>
      <section class="section"><div class="container">
        <div class="grid g2" style="grid-template-columns:1fr 1.4fr;gap:36px;align-items:start">
          <div>
            <h3 class="h3" style="margin-bottom:18px">Why join Servehub?</h3>
            ${[['sparkles', 'Impact at scale', 'Ship features used by 2.4M+ people'], ['graduation', 'Grow relentlessly', '₹75k/yr learning budget per person'], ['heart', 'Care that shows', 'Parental leave, insurance, mental health support'], ['users', 'Radically open', 'Transparent salaries, weekly all-hands, zero silos']].map(w => `<div style="display:flex;gap:14px;margin-bottom:20px"><span class="w-ic" style="width:44px;height:44px;border-radius:13px;background:var(--grad);display:grid;place-items:center;color:#fff;flex:none">${icon(w[0], 20)}</span><div><b>${w[1]}</b><p class="small muted" style="margin-top:2px">${w[2]}</p></div></div>`).join('')}
          </div>
          <div>
            <h3 class="h3" style="margin-bottom:18px">Open roles</h3>
            ${[['Engineering', 'Senior Frontend Engineer — React/Next.js', 'Bengaluru', 'Full-time'], ['Engineering', 'Backend Engineer — Node.js & PostgreSQL', 'Remote', 'Full-time'], ['Product', 'Product Manager — Marketplace', 'Mumbai', 'Full-time'], ['Design', 'Senior Product Designer', 'Bengaluru', 'Full-time'], ['Operations', 'City Operations Lead', 'Delhi NCR', 'Full-time'], ['Data', 'Data Scientist — Recommendations', 'Remote', 'Full-time']].map(r => `
              <div class="card card-hover" style="padding:20px;margin-bottom:12px;display:flex;align-items:center;gap:16px">
                <span class="badge badge-primary">${r[0]}</span><div style="flex:1;min-width:0"><b style="font-size:14.5px">${r[1]}</b><div class="xsmall muted">${r[2]} • ${r[3]}</div></div>
                <button class="btn btn-soft btn-sm" data-act="apply" data-role="${esc(r[1])}">Apply</button>
              </div>`).join('')}
          </div>
        </div>
      </div></section>`,
    },
    help: { title: 'Help Center', kicker: 'Support', body: '' },
  };

  function legalPage(title, sections) {
    return `<section class="page-hero"><div class="container">
      <div class="crumbs"><a href="">Home</a><span>/</span><span>${title}</span></div>
      <h1 class="h2" style="font-size:clamp(28px,4vw,36px)">${title}</h1>
      <p class="small muted" style="margin-top:8px">Last updated: August 1, 2026</p>
    </div></section>
    <section class="section"><div class="container" style="max-width:820px">
      ${sections.map((s, i) => `<div class="card" style="padding:26px;margin-bottom:16px"><span class="kicker" style="margin-bottom:10px">Section ${i + 1}</span><h3 style="margin-bottom:10px">${s[0]}</h3><p class="muted" style="font-size:14.5px">${s[1]}</p></div>`).join('')}
      <div class="card glass" style="padding:24px;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap"><b>Questions about this policy?</b><a class="btn btn-primary" href="#/contact">Contact us</a></div>
    </div></section>`;
  }

  /* ---------- blog ---------- */
  const Blog = () => `
    <section class="page-hero"><div class="container">
      <div class="crumbs"><a href="">Home</a><span>/</span><span>Blog</span></div>
      <h1 class="h2" style="font-size:clamp(28px,4vw,40px)">The Servehub Journal</h1>
      <p class="lead" style="margin-top:10px">Expert advice on home care, maintenance and lifestyle — written with the people who do the work.</p>
    </div></section>
    <section class="section"><div class="container">
      <div class="grid g3">${DATA.blog.map(p => `
        <a class="card card-hover svc-card" href="#/blog/${p.id}">
          <div class="svc-art"><div class="art-bg" style="background:${p.g}">${icon(p.icon, 52)}</div><span class="art-tag">${p.cat}</span></div>
          <div class="svc-body"><h3 style="font-size:16.5px">${esc(p.title)}</h3><p class="small muted" style="flex:1">${esc(p.excerpt)}</p>
          <div class="svc-meta"><span>${p.date}</span><span>${p.read} read</span><span class="muted" style="margin-left:auto;font-weight:700;color:var(--primary-600)">Read →</span></div></div>
        </a>`).join('')}
      </div>
    </div></section>`;

  const BlogPost = ({ id }) => {
    const p = DATA.blog.find(b => b.id === id);
    if (!p) return `<section class="section"><div class="container"><div class="empty-state"><div class="e-ic">${icon('alert', 30)}</div><h3>Post not found</h3><a class="btn btn-primary" href="#/blog">Back to blog</a></div></div></section>`;
    const more = DATA.blog.filter(b => b.id !== id).slice(0, 3);
    return `
    <section class="page-hero"><div class="container">
      <div class="crumbs"><a href="">Home</a><span>/</span><a href="#/blog">Blog</a><span>/</span><span>${esc(p.cat)}</span></div>
      <span class="badge badge-primary" style="margin-bottom:14px">${esc(p.cat)}</span>
      <h1 class="h2" style="font-size:clamp(26px,4vw,40px);max-width:760px">${esc(p.title)}</h1>
      <div style="display:flex;gap:18px;margin-top:18px;align-items:center"><span style="display:flex;gap:9px;align-items:center">${avatar('Servehub', 34)}<b style="font-size:13px">Servehub Editorial</b></span><span class="small muted">${p.date}</span><span class="small muted">${p.read} read</span></div>
    </div></section>
    <section class="section"><div class="container" style="max-width:780px">
      <div class="card" style="overflow:hidden;margin-bottom:28px"><div class="svc-art" style="height:300px"><div class="art-bg" style="background:${p.g}">${icon(p.icon, 110)}</div></div></div>
      <p class="lead" style="max-width:none;margin-bottom:18px">${esc(p.excerpt)}</p>
      ${[1, 2, 3].map(n => `
        <h3 style="margin:26px 0 12px">${n === 1 ? 'Why this matters for your home' : n === 2 ? 'What the experts say' : 'A simple action plan'}</h3>
        <p class="muted" style="margin-bottom:12px">${['Most homes wait until something breaks before calling a professional — and then pay emergency prices. A small, predictable maintenance habit is cheaper, faster and far less stressful. Our field experts see this difference every single day in the homes they visit.', 'We spoke to the professionals who perform thousands of services a month. The consistent advice: schedule recurring services, keep clear access to equipment, and never ignore small warning signs — a dripping tap, a warm switchboard, a noisy AC. Small issues become big bills when left alone.', 'Start with one recurring service this month. Use the Servehub app to schedule it, set a reminder, and let live tracking handle the rest. Future you — and your wallet — will be grateful.'] [n - 1]}</p>`).join('')}
      <hr class="divider">
      <div class="card glass" style="padding:22px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
        <div><b>Enjoyed this? Share it with a friend.</b><div class="small muted">Refer them and you both get ₹100 in wallet credit.</div></div>
        <button class="btn btn-primary" data-act="toast" data-msg="Link copied to clipboard 🔗">${icon('share', 16)} Share</button>
      </div>
    </div></section>
    <section class="section" style="padding-top:0"><div class="container">
      ${secHead('More reads', 'Keep exploring', 'More expert advice from the Servehub Journal.')}
      <div class="grid g3">${more.map(p => `<a class="card card-hover svc-card" href="#/blog/${p.id}"><div class="svc-art"><div class="art-bg" style="background:${p.g}">${icon(p.icon, 44)}</div><span class="art-tag">${p.cat}</span></div><div class="svc-body"><h3 style="font-size:15.5px">${esc(p.title)}</h3><span class="small muted">${p.date} • ${p.read}</span></div></a>`).join('')}</div>
    </div></section>`;
  };

  /* ============================================================
     HELPERS
  ============================================================ */
  staticPages.help = staticPages.faq;

  const helpSearchWire = root => {
    const inp = U.$('#help-search', root);
    if (!inp) return;
    inp.addEventListener('input', debounce(() => {
      const q = inp.value.toLowerCase();
      U.$$('#faq-root .acc', root).forEach(a => {
        const match = a.textContent.toLowerCase().includes(q);
        a.style.display = match ? '' : 'none';
      });
    }, 150));
  };

  /* Contact form — client-side validation + success state */
  const contactWire = root => {
    const form = U.$('#contact-form', root);
    if (!form) return;
    const fieldOf = id => U.$('#' + id, root)?.closest('.field');
    const err = (id, msg) => {
      const f = fieldOf(id); if (!f) return;
      let e = f.querySelector('.field-err');
      if (msg) {
        f.classList.add('field-invalid');
        if (!e) { e = document.createElement('span'); e.className = 'field-err'; f.appendChild(e); }
        e.textContent = msg;
      } else {
        f.classList.remove('field-invalid');
        if (e) e.remove();
      }
    };
    const val = id => (U.$('#' + id, root)?.value || '').trim();
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      const name = val('cf-name'), email = val('cf-email'), phone = val('cf-phone'), svc = val('cf-svc'), msg = val('cf-msg');
      if (name.length < 2) { err('cf-name', 'Please enter your name'); ok = false; } else err('cf-name', '');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err('cf-email', 'Please enter a valid email address'); ok = false; } else err('cf-email', '');
      const digits = phone.replace(/[^\d]/g, '');
      if (!/^(91)?[6-9]\d{9}$/.test(digits)) { err('cf-phone', 'Please enter a valid 10-digit mobile number'); ok = false; } else err('cf-phone', '');
      if (!svc) { err('cf-svc', 'Please select a service'); ok = false; } else err('cf-svc', '');
      if (msg.length < 10) { err('cf-msg', 'Please describe your query (min 10 characters)'); ok = false; } else err('cf-msg', '');
      if (!ok) { toast('Please fix the highlighted fields', 'warn'); return; }
      form.style.display = 'none';
      const success = U.$('#cf-success', root);
      if (success) success.style.display = 'block';
      toast('Message sent! Our team will reply within 2 hours ✅');
    });
  };
  const debounce = U.debounce;

  const proCardPub = proCard;
  return {
    Landing, Categories, CategoriesWire, CategoryPage, CategoryWire, ServicePage, ServiceWire,
    staticPages, Blog, BlogPost, helpSearchWire, proCard: proCardPub,
    render(name, params) {
      const map = {
        landing: () => ({ html: Landing(), wire: null }),
        categories: () => ({ html: Categories(), wire: CategoriesWire }),
        'category': () => ({ html: CategoryPage(params), wire: CategoryWire }),
        'service': () => ({ html: ServicePage(params), wire: ServiceWire }),
        'blog': () => ({ html: Blog(), wire: null }),
        'post': () => ({ html: BlogPost(params), wire: null }),
        'static': () => ({ html: staticPages[params.page]?.body || '', wire: params.page === 'contact' ? contactWire : (['faq', 'help'].includes(params.page) ? helpSearchWire : null) }),
      };
      const fn = map[name];
      return fn ? fn() : null;
    },
  };
})();
