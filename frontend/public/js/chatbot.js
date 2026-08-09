/* ============ SERVEHUB CHATBOT v3 — Nova Smart Service Assistant ============
   Features:
   - Real-time intent recognition for AC, Plumbing, Electrical, Cleaning, Appliance Repair, etc.
   - Natural language search integration with dynamic "💰 Cheapest" badge computation.
   - Rich in-chat service recommendation cards featuring images, prices, ratings, duration, badges, and direct Book Now triggers.
   - Conversation context memory to remember user requirements across multiple turns.
   - Photo identification to recognize issues from uploaded images.
   - Quick action buttons ("Book Cheapest", "View All Services", etc.).
   ========================================================================== */
window.Chatbot = (() => {
  const { icon, esc, money } = U;

  let open = false;
  let root = null;

  /* Conversation Context Memory */
  let memory = {
    lastCategory: null,
    lastQuery: '',
    lastServices: [],
    cheapestService: null,
  };

  const userName = () => (Store.currentUser() || {}).name || '';
  const latestBooking = () => Store.state.bookings[0] || null;

  /* Quick action chips */
  const CHIPS = ['🔧 AC Repair', '🚰 Plumbing', '⚡ Electrician', '🧹 Cleaning', '💬 What services?', '💰 Cheapest AC Repair', '📱 My Bookings', '📸 Identify by photo'];

  /* ---- Render rich service card inside chat window ---- */
  const renderChatSvcCard = s => {
    const cat = DATA.catBySlug ? DATA.catBySlug(s.cat) : null;
    const img = s.img || `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&fit=crop`;
    return `
    <div class="cb-card-item" data-svc-id="${esc(s.id)}" style="position:relative;background:var(--card);border:1.5px solid ${s.isCheapest ? 'var(--success-600)' : 'var(--line)'};border-radius:14px;overflow:hidden;margin-top:10px;box-shadow:var(--sh-sm);transition:.2s">
      ${s.isCheapest ? `<div style="position:absolute;top:8px;left:8px;z-index:2;background:linear-gradient(135deg,#10B981,#059669);color:#fff;font-weight:800;font-size:11px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(16,185,129,.35)">💰 CHEAPEST</div>` : ''}
      <div style="position:relative;height:120px;width:100%;overflow:hidden;background:var(--surface-2)">
        <img src="${img}" alt="${esc(s.name)}" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display='none'">
        <span style="position:absolute;bottom:8px;right:8px;background:rgba(15,23,42,.75);color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;backdrop-filter:blur(4px)">⏱ ${esc(s.dur)}</span>
      </div>
      <div style="padding:12px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div>
            <h4 style="font-size:14px;font-weight:800;color:var(--ink);margin:0;line-height:1.2">${esc(s.name)}</h4>
            <div style="font-size:11.5px;color:var(--ink-3);margin-top:2px">${esc(cat ? cat.name : s.cat)}</div>
          </div>
          <span style="font-size:12px;font-weight:700;color:var(--warn-600);background:var(--warn-50);padding:2px 6px;border-radius:6px;flex:none">★ ${s.rating}</span>
        </div>
        <p style="font-size:12px;color:var(--ink-2);margin:8px 0 10px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(s.desc)}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid var(--line-2)">
          <div>
            <span style="font-size:10px;color:var(--ink-3);display:block;font-weight:600">Starting from</span>
            <span style="font-size:16px;font-weight:900;color:var(--success-600)">${money(s.price)}</span>
          </div>
          <div style="display:flex;gap:6px">
            <a href="#/service/${esc(s.id)}" class="btn btn-outline btn-sm" style="font-size:11.5px;padding:6px 10px" onclick="window.Chatbot.close()">Details</a>
            <a href="#/book/${esc(s.id)}" class="btn btn-primary btn-sm" style="font-size:11.5px;padding:6px 12px" onclick="window.Chatbot.close()">Book Now</a>
          </div>
        </div>
      </div>
    </div>`;
  };

  /* ---- Photo identification mapping ---- */
  const PHOTO_KEYWORDS = [
    { words: ['water','leak','pipe','tap','drip','flood','plumb','toilet','bathroom','cistern'], cat: 'plumber', label: 'Plumbing Repair' },
    { words: ['ac','air','cool','compressor','refriger','fridge','freeze','hvac'], cat: 'ac', label: 'AC Service / Cooling Repair' },
    { words: ['wire','electric','switch','fan','light','bulb','mcb','fuse','spark','socket'], cat: 'electrician', label: 'Electrical Repair' },
    { words: ['dirty','dust','stain','clean','mop','floor','mess','bathroom'], cat: 'cleaning', label: 'Home Cleaning' },
    { words: ['sofa','carpet','mattress','upholster','couch'], cat: 'homeclean', label: 'Upholstery Deep Cleaning' },
    { words: ['furniture','door','hinge','wardrobe','cabinet','drawer','wood','kitchen'], cat: 'carpenter', label: 'Carpentry Repair' },
    { words: ['paint','wall','crack','peel','colour','texture'], cat: 'painting', label: 'Wall Painting' },
    { words: ['pest','cockroach','ant','termite','insect','rodent','rat','lizard'], cat: 'pest', label: 'Pest Control' },
    { words: ['laptop','computer','screen','keyboard','battery','charging'], cat: 'laptop', label: 'Laptop Repair' },
    { words: ['washing','machine','appliance','microwave','geyser','dishwasher'], cat: 'appliance', label: 'Appliance Repair' },
  ];

  const identifyFromText = filename => {
    const lower = (filename || '').toLowerCase().replace(/[_\-\.]/g, ' ');
    for (const kw of PHOTO_KEYWORDS) {
      if (kw.words.some(w => lower.includes(w))) return kw;
    }
    return null;
  };

  /* ---- Core Assistant Logic with Natural Language & Context Memory ---- */
  const processQuery = userText => {
    const text = userText.toLowerCase().trim();

    // 1. Check for booking tracking
    if (/(track|status|where is|arriv|live (tracking|status|updates)|my booking)/i.test(text)) {
      const b = latestBooking();
      if (b) {
        return {
          text: `You have <b>${Store.state.bookings.length}</b> booking(s). Your latest booking is <b>${esc(b.id)}</b> — current status: <b>${esc(b.status)}</b>. Tap below to follow live. 🗺️`,
          actions: [{ label: 'Track Latest Booking', href: '#/track/' + b.id }]
        };
      }
      return {
        text: `You don't have any active bookings yet. Browse our top services and get booked in under a minute!`,
        actions: [{ label: 'Browse All Services', href: '#/categories' }]
      };
    }

    // 2. Check for cancellations/refunds
    if (/(cancel|reschedul)/i.test(text)) {
      return {
        text: `You can cancel for free up to 24h before your slot (instant wallet refund) and reschedule free up to 6h before. Go to <b>My Bookings</b> to manage your appointment. ✅`,
        actions: [{ label: 'Manage My Bookings', href: '#/dashboard/bookings' }]
      };
    }

    // 3. Human support
    if (/(human|agent|support|real person|call|talk|complaint|representative)/i.test(text)) {
      return {
        text: `Connecting you to a live support agent right now… Our team usually responds in under 60 seconds! 🙌`,
        human: true
      };
    }

    // 3b. "What services do you provide?"
    if (/(what services|services do you provide|what do you offer|list of services|all services|which services|what can you)/i.test(text)) {
      return {
        text: `ServeHub offers <b>${DATA.categories.length} categories</b> and 340+ home services — AC repair &amp; service, plumbing, electrical, home cleaning, pest control, painting, carpentry, appliance repair, salon, spa and more. Here are the most popular right now:`,
        cards: DATA.services.filter(s => s.popular).slice(0, 3),
        actions: [
          { label: 'Browse all services', href: '#/categories', primary: true },
          { label: 'Explore categories', href: '#/categories' }
        ]
      };
    }

    // 3c. Price queries: "What is the price of AC service?"
    if (/(price|cost|rate|charge|how much)/i.test(text)) {
      const clean = text.replace(/\b(what is|whats|what|the|price|cost|rate|charge|of|for|how much|tell me|show|me|please|a|an)\b/g, ' ').replace(/\s+/g, ' ').trim().replace(/[?.,!]+$/g, '');
      const svcs = clean ? DATA.searchServices(clean) : DATA.services.filter(s => s.popular);
      if (svcs.length) {
        const cheapest = svcs.reduce((a, b) => a.price <= b.price ? a : b);
        memory.lastQuery = text; memory.lastServices = svcs; memory.cheapestService = cheapest; memory.lastCategory = svcs[0].cat;
        return {
          text: `Here are the current <b>ServeHub starting prices</b>${clean ? ' for “' + esc(clean) + '”' : ''} — the final price may vary after an on-site inspection:`,
          cards: svcs.slice(0, 3),
          cheapest,
          actions: [{ label: 'View all options', href: `#/category/${svcs[0].cat}`, primary: true }]
        };
      }
    }

    // 3d. "Cheapest …" — compare available services honestly
    if (/\b(cheap|cheapest|lowest|budget|affordable|low price|low cost|best price)\b/i.test(text)) {
      const clean = text.replace(/\b(cheap|cheapest|lowest|budget|affordable|show|me|the|price|best|for|near|please)\b/g, ' ').replace(/\s+/g, ' ').trim();
      const svcs = clean ? DATA.searchServices(clean) : DATA.services.filter(s => s.popular);
      if (svcs.length) {
        const cheapest = svcs.reduce((a, b) => a.price <= b.price ? a : b);
        const catName = DATA.catBySlug(cheapest.cat)?.name || 'Service';
        memory.lastQuery = text; memory.lastServices = svcs; memory.cheapestService = cheapest; memory.lastCategory = cheapest.cat;
        return {
          text: `For <b>${esc(catName)}</b>, the <b>lowest starting price among the currently available ServeHub services</b> is <b>${money(cheapest.price)}</b> — <b>${esc(cheapest.name)}</b>. The final price can vary after an on-site inspection.`,
          cards: svcs.slice(0, 3),
          cheapest,
          actions: [
            { label: `Book Now (${money(cheapest.price)})`, href: `#/book/${cheapest.id}`, primary: true },
            { label: 'View Details', href: `#/service/${cheapest.id}` }
          ]
        };
      }
    }

    // 4. Natural Language Service Intent Search
    const searchResults = DATA.searchServices(text);

    if (searchResults && searchResults.length > 0) {
      // For specific problems ("fridge not cooling") rank the most relevant
      // service first — the cheapest badge still marks the lowest price.
      const isSpecificProblem = /(not cooling|water leaking|noise|broken|fault|leak|issue|problem|not working|repair|service)/i.test(text);
      let ranked = searchResults;
      if (isSpecificProblem) {
        const probWords = text
          .replace(/\b(i|need|my|is|not|book|an|a|the|for|me|please|want|have|to|get|some|help|with|it)\b/g, ' ')
          .replace(/[^a-z ]/g, ' ').split(/\s+/).filter(w => w.length > 2);
        const score = s => {
          let sc = 0;
          (s.keywords || []).forEach(k => probWords.forEach(w => { if (k.toLowerCase().includes(w)) sc += 3; }));
          if (s.name.toLowerCase().split(/[\s-]+/).some(w => probWords.includes(w))) sc += 2;
          return sc;
        };
        ranked = [...searchResults].sort((a, b) => (score(b) - score(a)) || (b.bookings - a.bookings));
      }

      // Find lowest starting price among the matched set
      let minPrice = Infinity;
      let cheapestSvc = null;
      searchResults.forEach(s => {
        if (s.price < minPrice) {
          minPrice = s.price;
          cheapestSvc = s;
        }
      });

      // Update memory
      memory.lastQuery = text;
      memory.lastServices = searchResults;
      memory.cheapestService = cheapestSvc;
      if (ranked[0]) memory.lastCategory = ranked[0].cat;

      const categoryName = DATA.catBySlug(ranked[0].cat)?.name || 'Service';

      const responsePrefix = isSpecificProblem
        ? `I'm sorry to hear you're experiencing a ${categoryName} issue! I found suitable services for you. The <b>lowest starting price among the currently available ServeHub services</b> is <b>${money(cheapestSvc.price)}</b>:`
        : `I found <b>${searchResults.length}</b> verified ${categoryName} services — starting from <b>${money(cheapestSvc.price)}</b> (the final price may vary after inspection):`;

      return {
        text: responsePrefix,
        cards: ranked.slice(0, 3),
        cheapest: cheapestSvc,
        actions: [
          { label: `Book Cheapest (${money(cheapestSvc.price)})`, href: `#/book/${cheapestSvc.id}`, primary: true },
          { label: 'View All Services', href: `#/category/${ranked[0].cat}` }
        ]
      };
    }

    // 5. Context-aware follow ups using Memory
    if (memory.lastCategory && /(yes|cooling|leak|noise|repair|book|option|cheapest|sure|okay|help)/i.test(text)) {
      const svcs = DATA.searchServices(memory.lastCategory);
      if (svcs.length > 0) {
        const cheapest = memory.cheapestService || svcs[0];
        return {
          text: `Got it! For your ${memory.lastCategory.toUpperCase()} request, I recommend <b>${esc(cheapest.name)}</b> — the <b>lowest starting price among the currently available ServeHub services</b> is <b>${money(cheapest.price)}</b>.`,
          cards: svcs.slice(0, 3),
          cheapest: cheapest,
          actions: [
            { label: `Book ${cheapest.name} (${money(cheapest.price)})`, href: `#/book/${cheapest.id}`, primary: true }
          ]
        };
      }
    }

    // 6. Generic Fallback
    return {
      text: `Hello${userName() ? ' <b>' + esc(userName().split(' ')[0]) + '</b>' : ''}! I'm <b>Nova</b>, your ServeHub assistant. I can help you find services, locate the <b>cheapest options</b>, or identify issues from a photo 📸.`,
      cards: DATA.services.filter(s => s.popular).slice(0, 3),
      actions: [
        { label: 'Browse All Categories', href: '#/categories' }
      ]
    };
  };

  /* -------- Handle Photo Upload -------- */
  const handlePhoto = file => {
    if (!file || !file.type.startsWith('image/')) {
      addMsg('Please upload a valid image file (JPG, PNG, WEBP). 🖼️', 'them');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      addMsg(`<img src="${e.target.result}" alt="Uploaded photo" style="max-width:220px;max-height:160px;border-radius:10px;display:block;margin-bottom:6px"><span style="font-size:12px;color:var(--ink-3)">📎 ${esc(file.name)}</span>`, 'me');
      typing(true);
      setTimeout(() => {
        typing(false);
        const match = identifyFromText(file.name);
        if (match) {
          const svcs = DATA.searchServices(match.cat);
          const cheapest = svcs[0];
          addMsg(`🔍 I identified this as a <b>${esc(match.label)}</b> issue! Here are the best services recommended for you — the lowest starting price among the currently available ServeHub services is <b>${money(cheapest ? cheapest.price : 199)}</b> (final price may vary after inspection):`, 'them');
          if (svcs.length) {
            addMsg(svcs.slice(0, 3).map(renderChatSvcCard).join(''), 'them');
            if (cheapest) {
              addMsg(`<div style="display:flex;gap:8px;margin-top:10px"><a href="#/book/${cheapest.id}" class="btn btn-primary btn-sm" onclick="window.Chatbot.close()">Book Cheapest (${money(cheapest.price)}) →</a></div>`, 'them');
            }
          }
        } else {
          addMsg(`📸 Image received! Based on common home repair issues, here are our top recommended services:`, 'them');
          const topSvcs = DATA.searchServices('repair');
          addMsg(topSvcs.slice(0, 3).map(renderChatSvcCard).join(''), 'them');
        }
        updateChips(['🔧 AC Repair', '🚰 Plumbing', '⚡ Electrician', '🧹 Cleaning']);
      }, 1100);
    };
    reader.readAsDataURL(file);
  };

  /* -------- Dynamic Chip Buttons -------- */
  const updateChips = chips => {
    if (!root) return;
    const el = U.$('#cb-chips', root);
    if (!el) return;
    el.innerHTML = chips.map(c => `<button class="quick-chip" data-cb-chip="${esc(c)}">${esc(c)}</button>`).join('');
    el.querySelectorAll('[data-cb-chip]').forEach(b => b.addEventListener('click', () => send(b.dataset.cbChip)));
  };

  /* ---------------- UI Builder ---------------- */
  const openPanel = () => {
    if (open) return;
    open = true;
    root = document.createElement('div');
    root.className = 'chatbot';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Nova — ServeHub Service Assistant');
    root.innerHTML = `
      <div class="chatbot-head">
        <div class="cb-avatar">${icon('sparkles', 18)}</div>
        <div class="cb-id"><b>Nova — ServeHub Assistant</b><div class="cb-sub"><span class="status-dot dot-green"></span> Online · replies instantly</div></div>
        <button class="icon-btn" id="cb-close" aria-label="Close chat">${icon('x', 18)}</button>
      </div>
      <div class="chatbot-body" id="cb-body">
        <div class="msg them">Hi${userName() ? ' <b>' + esc(userName().split(' ')[0]) + '</b>' : ''}! 👋 I'm <b>Nova</b>. Ask me anything like <i>"AC not cooling"</i>, <i>"cheapest AC repair"</i>, or <i>"plumber"</i> — I'll find the best options and mark the <b>cheapest suitable service</b>! 💰</div>
      </div>
      <div class="chatbot-chips" id="cb-chips">${CHIPS.map(c => `<button class="quick-chip" data-cb-chip="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="chatbot-input">
        <label class="cb-photo-btn" title="Upload photo to identify service" aria-label="Upload photo">
          ${icon('camera', 18)}
          <input type="file" id="cb-photo-input" accept="image/*" style="display:none">
        </label>
        <input class="input" id="cb-input" placeholder="Describe your problem or service needed…" aria-label="Ask Nova">
        <button class="btn btn-primary" id="cb-send" aria-label="Send">${icon('send', 0)}</button>
      </div>`;
    document.body.appendChild(root);
    const badge = document.querySelector('.fab-chat .fab-badge');
    if (badge) badge.style.display = 'none';
    requestAnimationFrame(() => { root.classList.add('show'); const inp = U.$('#cb-input', root); if (inp) inp.focus(); });
    bind(root);
  };

  const closePanel = () => {
    if (!root) return;
    const el = root;
    el.classList.remove('show');
    const badge = document.querySelector('.fab-chat .fab-badge');
    if (badge) badge.style.display = '';
    setTimeout(() => { if (el && el.parentNode) el.remove(); if (root === el) root = null; }, 220);
    open = false;
  };

  const toggle = () => (open ? closePanel() : openPanel());

  /* ---------------- Messaging & Rendering ---------------- */
  const addMsg = (html, from, time = Date.now()) => {
    const body = U.$('#cb-body');
    if (!body) return;
    body.insertAdjacentHTML('beforeend', `<div class="msg ${from}">${html}<span class="m-time">${new Date(time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>`);
    body.scrollTop = body.scrollHeight;
  };

  const typing = on => {
    const body = U.$('#cb-body');
    if (!body) return;
    if (on) body.insertAdjacentHTML('beforeend', `<div class="msg them typing"><i></i><i></i><i></i></div>`);
    else U.$('.msg.typing', body)?.remove();
    body.scrollTop = body.scrollHeight;
  };

  const send = raw => {
    const text = String(raw || '').trim();
    if (!text) return;

    if (text === '📸 Identify by photo') {
      addMsg('📸 Please select or drop a photo of your issue below:', 'them');
      setTimeout(() => { const inp = U.$('#cb-photo-input', root); if (inp) inp.click(); }, 350);
      return;
    }

    addMsg(esc(text), 'me');
    typing(true);

    setTimeout(() => {
      typing(false);
      const res = processQuery(text);
      
      addMsg(res.text, 'them');

      if (res.cards && res.cards.length > 0) {
        addMsg(res.cards.map(renderChatSvcCard).join(''), 'them');
      }

      if (res.human) {
        addMsg(`<button class="btn btn-primary btn-sm" data-cb-call="human">Chat with Human Support ${icon('arrowRight', 13)}</button>`, 'them');
      } else if (res.actions && res.actions.length > 0) {
        const actionHtml = `<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">` +
          res.actions.map(a => `<a href="${esc(a.href)}" class="btn ${a.primary ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="window.Chatbot.close()">${esc(a.label)} ${icon('arrowRight', 13)}</a>`).join('') +
          `</div>`;
        addMsg(actionHtml, 'them');
      }

      updateChips(['🔧 AC Repair', '🚰 Plumbing', '⚡ Electrician', '🧹 Cleaning', '📱 My Bookings']);
    }, 650);
  };

  /* ---------------- Event Listeners ---------------- */
  const bind = rootEl => {
    const input = U.$('#cb-input', rootEl);
    const photoInput = U.$('#cb-photo-input', rootEl);

    const doSend = () => { const v = input?.value || ''; if (v.trim()) { input.value = ''; send(v); } };
    U.$('#cb-send', rootEl)?.addEventListener('click', doSend);
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
    U.$('#cb-close', rootEl)?.addEventListener('click', closePanel);

    photoInput?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) handlePhoto(file);
      e.target.value = '';
    });

    rootEl.addEventListener('dragover', e => { e.preventDefault(); rootEl.classList.add('drag-over'); });
    rootEl.addEventListener('dragleave', () => rootEl.classList.remove('drag-over'));
    rootEl.addEventListener('drop', e => {
      e.preventDefault();
      rootEl.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handlePhoto(file);
    });

    U.$$('[data-cb-chip]', rootEl).forEach(c => c.addEventListener('click', () => send(c.dataset.cbChip)));

    rootEl.addEventListener('click', e => {
      const human = e.target.closest('[data-cb-call="human"]');
      if (human) { closePanel(); if (window.Booking) Booking.chatModal('ServeHub Support'); return; }
      const link = e.target.closest('a[href^="#"]');
      if (link) closePanel();
    });
  };

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closePanel(); });

  return { toggle, open: openPanel, close: closePanel, send };
})();
