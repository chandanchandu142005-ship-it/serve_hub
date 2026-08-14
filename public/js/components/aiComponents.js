/* ==================================================================
   SERVEHUB AI UI COMPONENTS MODULE
   Reusable frontend UI widgets for all 10 AI features
   ================================================================== */
window.AIComponents = (() => {
  const { icon, esc, money } = U;

  /**
   * Helper: Call AI Backend API
   */
  async function apiCall(endpoint, data = {}) {
    try {
      const token = localStorage.getItem('sh_token') || Store.state.user?.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/ai/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.warn(`[AI API Fallback - /api/ai/${endpoint}]`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * 1. AI SERVICE RECOMMENDATION WIDGET ("Recommended For You")
   */
  function renderRecommendationSection(services = [], title = 'Recommended For You') {
    if (!services || services.length === 0) {
      services = (DATA.services || []).slice(0, 4);
    }

    return `
    <div class="sh-ai-section" style="margin-bottom:28px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div>
          <h3 style="font-size:18px;font-weight:900;color:var(--ink);display:flex;align-items:center;gap:8px">
            <span style="background:var(--grad-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent">✨ ${esc(title)}</span>
          </h3>
          <p class="small muted" style="margin:2px 0 0">Personalized by ServeHub AI based on your activity, category & local demand</p>
        </div>
        <span class="badge badge-primary" style="font-size:11px">AI Ranked</span>
      </div>

      <div class="grid g4" style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px">
        ${services.map(s => `
          <div class="card card-hover" style="position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:16px;border:1px solid var(--line);border-radius:16px;background:var(--card)">
            <span style="position:absolute;top:12px;right:12px;background:var(--primary-50);color:var(--primary-600);font-size:10.5px;font-weight:800;padding:3px 8px;border-radius:999px;border:1px solid var(--primary-100)">
              ★ ${s.aiScore || 92}% Match
            </span>
            <div>
              <div style="font-size:11px;font-weight:800;color:var(--primary-600);text-transform:uppercase;margin-bottom:4px">
                ${esc(s.cat || 'Service')}
              </div>
              <h4 style="font-size:15px;font-weight:800;color:var(--ink);margin:0 0 6px">${esc(s.name)}</h4>
              <p class="small muted" style="margin-bottom:10px;line-height:1.4">${esc(s.desc)}</p>
              ${s.matchReason ? `<div style="font-size:11.5px;color:var(--success-600);background:var(--success-50);padding:4px 8px;border-radius:6px;margin-bottom:12px;display:inline-block">💡 ${esc(s.matchReason)}</div>` : ''}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px dashed var(--line)">
              <div>
                <span class="xsmall muted" style="display:block">Starts at</span>
                <span style="font-size:16px;font-weight:900;color:var(--ink)">${money(s.price)}</span>
              </div>
              <a href="#/book/${esc(s.id)}" class="btn btn-primary btn-sm" style="padding:6px 14px">Book Now</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  /**
   * 2. AI NATURAL LANGUAGE SEARCH WIDGET
   */
  function renderSearchWidget() {
    return `
    <div class="sh-ai-box" style="background:linear-gradient(135deg,rgba(79,70,229,0.06),rgba(147,51,234,0.06));border:1.5px solid var(--primary-200);border-radius:20px;padding:24px;margin-bottom:30px">
      <div style="max-width:700px;margin:0 auto;text-align:center">
        <span class="badge badge-primary" style="margin-bottom:10px;padding:4px 12px;font-size:12px">🔍 AI Natural Language Search</span>
        <h2 style="font-size:24px;font-weight:900;color:var(--ink);margin-bottom:8px">Tell us what you need in plain English</h2>
        <p class="small muted" style="margin-bottom:20px">Search using natural sentences like <i>"I need an electrician near Bandra tomorrow under ₹600"</i></p>

        <div style="position:relative;display:flex;gap:8px">
          <input type="text" id="sh-ai-search-input" class="input" placeholder="e.g. Fix my leaking kitchen tap in Bandra under 500" style="padding-left:42px;height:52px;font-size:15px;border-radius:14px;box-shadow:var(--sh-md)">
          <span style="position:absolute;left:14px;top:15px;color:var(--primary-600)">${icon('sparkles', 20)}</span>
          <button type="button" id="sh-ai-search-btn" class="btn btn-primary btn-lg" style="height:52px;padding:0 24px;border-radius:14px;flex:none">Search AI</button>
        </div>

        <!-- Extracted Intent Pills -->
        <div id="sh-ai-search-extracted" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:14px"></div>
      </div>

      <!-- Search Results Area -->
      <div id="sh-ai-search-results" style="margin-top:24px"></div>
    </div>`;
  }

  /**
   * 3. AI PRICE ESTIMATOR WIDGET
   */
  function renderPriceEstimatorWidget() {
    const services = DATA.services || [];
    return `
    <div class="sh-ai-card" style="background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px;margin-bottom:30px">
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:16px">
        <span class="e-ic" style="width:40px;height:40px;border-radius:12px;background:var(--success-50);color:var(--success-600);display:grid;place-items:center">${icon('tag', 20)}</span>
        <div>
          <h3 style="font-size:17px;font-weight:900;color:var(--ink);margin:0">💰 AI Price Suggestion Engine</h3>
          <p class="small muted" style="margin:0">Calculate estimated cost based on complexity, location & material requirements</p>
        </div>
      </div>

      <div class="grid g2" style="gap:16px;margin-bottom:16px">
        <div>
          <label class="label">Select Service</label>
          <select id="sh-price-svc-select" class="input">
            ${services.map(s => `<option value="${s.id}">${esc(s.name)} (Base ₹${s.price})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="label">Problem Complexity</label>
          <select id="sh-price-complexity-select" class="input">
            <option value="low">Low — Simple fix / inspection</option>
            <option value="medium" selected>Medium — Standard repair work</option>
            <option value="high">High — Complex repair with parts replacement</option>
            <option value="urgent">Urgent — Emergency dispatch</option>
          </select>
        </div>
      </div>

      <button type="button" id="sh-price-calc-btn" class="btn btn-soft btn-block" style="font-weight:700">Calculate Price Estimate</button>

      <!-- Output Result -->
      <div id="sh-price-result-box" style="display:none;margin-top:18px;padding:16px;background:var(--surface-2);border-radius:14px;border:1px dashed var(--line)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div>
            <span class="xsmall muted" style="display:block;text-transform:uppercase;font-weight:800">AI Estimated Price Range</span>
            <span id="sh-price-range-text" style="font-size:22px;font-weight:900;color:var(--success-600)">₹500 – ₹800</span>
          </div>
          <span class="badge badge-success" style="font-size:12px">Transparent Estimate</span>
        </div>
        <div id="sh-price-explanation-list" class="small muted" style="line-height:1.5"></div>
      </div>
    </div>`;
  }

  /**
   * 4. AI PROVIDER MATCH WIDGET ("Best Providers For You")
   */
  function renderProviderMatchWidget(providers = []) {
    if (!providers || providers.length === 0) {
      providers = (DATA.pros || []).slice(0, 3).map((p, idx) => ({
        ...p,
        matchPercentage: 96 - idx * 3,
        matchBadge: `${96 - idx * 3}% Match — Recommended Provider`,
        distanceKm: (1.2 + idx * 0.8).toFixed(1),
      }));
    }

    return `
    <div class="sh-ai-section" style="margin-bottom:28px">
      <div style="margin-bottom:14px">
        <h3 style="font-size:18px;font-weight:900;color:var(--ink);display:flex;align-items:center;gap:8px">
          <span>👨‍🔧 Best Providers For You</span>
          <span class="badge badge-primary" style="font-size:11px">AI Ranked</span>
        </h3>
        <p class="small muted">Ranked by proximity, availability, ratings, skills, and pricing match</p>
      </div>

      <div class="grid g3" style="gap:16px">
        ${providers.map(p => `
          <div class="card" style="padding:16px;border:1px solid var(--line);border-radius:16px;background:var(--card)">
            <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80&fit=crop" style="width:48px;height:48px;border-radius:50%;object-fit:cover" alt="${esc(p.name)}">
              <div>
                <h4 style="font-size:15px;font-weight:800;color:var(--ink);margin:0">${esc(p.name)}</h4>
                <div class="small muted">${esc(p.cat || 'Service Pro')} • ${p.expYears || p.exp || 4} yrs exp</div>
              </div>
            </div>

            <div style="background:var(--primary-50);color:var(--primary-700);font-size:12px;font-weight:800;padding:6px 10px;border-radius:8px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
              <span>🎯 ${p.matchPercentage}% Match</span>
              <span>📍 ${p.distanceKm || 1.5} km away</span>
            </div>

            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-2);margin-bottom:12px">
              <span>★ <b>${p.rating || 4.9}</b> (${p.jobsCompleted || 120}+ jobs)</span>
              <span>Rate: <b>${money(p.rate || 499)}/hr</b></span>
            </div>

            <button type="button" class="btn btn-outline btn-sm btn-block" onclick="location.hash='#/book/s1'">Book Provider</button>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  /**
   * 5. AI REVIEW ANALYSIS WIDGET
   */
  function renderReviewAnalysisWidget() {
    return `
    <div class="sh-ai-card" style="background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px;margin-bottom:30px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div>
          <h3 style="font-size:17px;font-weight:900;color:var(--ink);margin:0">📝 AI Review Sentiment Analysis</h3>
          <p class="small muted" style="margin:0">Automated sentiment summary based on verified customer feedback</p>
        </div>
        <span class="badge badge-success">94% Positive Feedback</span>
      </div>

      <div class="grid g2" style="gap:16px">
        <div>
          <div style="font-size:12px;font-weight:800;color:var(--ink-2);margin-bottom:8px">Sentiment Breakdown</div>
          <div style="display:flex;flex-direction:column;gap:6px;font-size:12px">
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:2px"><span>Positive</span><b>92%</b></div>
              <div style="height:6px;background:var(--surface-2);border-radius:999px;overflow:hidden"><div style="width:92%;height:100%;background:var(--success)"></div></div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:2px"><span>Neutral</span><b>5%</b></div>
              <div style="height:6px;background:var(--surface-2);border-radius:999px;overflow:hidden"><div style="width:5%;height:100%;background:var(--warn)"></div></div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:2px"><span>Negative</span><b>3%</b></div>
              <div style="height:6px;background:var(--surface-2);border-radius:999px;overflow:hidden"><div style="width:3%;height:100%;background:var(--danger)"></div></div>
            </div>
          </div>
        </div>

        <div style="background:var(--surface-2);border-radius:12px;padding:12px;border:1px solid var(--line)">
          <div style="font-size:12px;font-weight:800;color:var(--primary);margin-bottom:4px">💡 AI Key Summary</div>
          <p class="small muted" style="margin:0;line-height:1.4">Customers consistently praise the provider's technical skills, polite behavior, and on-time arrival. Over 92% of reviews report 5-star service satisfaction.</p>
        </div>
      </div>
    </div>`;
  }

  /**
   * 6. AI BOOKING ASSISTANT WIDGET
   */
  function renderBookingAssistantWidget() {
    return `
    <div class="sh-ai-box" style="background:var(--card);border:1.5px solid var(--primary-200);border-radius:20px;padding:24px;margin-bottom:30px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <span class="e-ic" style="width:44px;height:44px;border-radius:14px;background:var(--primary-50);color:var(--primary-600);display:grid;place-items:center">${icon('sparkles', 22)}</span>
        <div>
          <h3 style="font-size:18px;font-weight:900;color:var(--ink);margin:0">🤖 AI Guided Booking Assistant</h3>
          <p class="small muted" style="margin:0">Let AI step-by-step help you assemble and confirm your booking</p>
        </div>
      </div>

      <div class="grid g2" style="gap:14px;margin-bottom:16px">
        <div>
          <label class="label">Required Service</label>
          <input type="text" id="sh-assistant-service" class="input" value="AC Deep Cleaning" placeholder="e.g. AC Repair">
        </div>
        <div>
          <label class="label">Location / Landmark</label>
          <input type="text" id="sh-assistant-location" class="input" value="Bandra West, Mumbai" placeholder="e.g. Bandra West">
        </div>
        <div>
          <label class="label">Preferred Date</label>
          <input type="date" id="sh-assistant-date" class="input" value="2026-08-15">
        </div>
        <div>
          <label class="label">Preferred Time</label>
          <select id="sh-assistant-time" class="input">
            <option value="10:00 AM">10:00 AM</option>
            <option value="02:00 PM">02:00 PM</option>
            <option value="05:00 PM">05:00 PM</option>
          </select>
        </div>
      </div>

      <button type="button" id="sh-assistant-generate-btn" class="btn btn-primary btn-block">Generate Booking Summary</button>

      <!-- Booking Summary Output -->
      <div id="sh-assistant-summary-box" style="display:none;margin-top:18px;padding:16px;background:var(--surface-2);border-radius:14px;border:1px dashed var(--line)">
        <h4 style="font-size:15px;font-weight:800;color:var(--ink);margin-bottom:10px">📋 AI Booking Summary</h4>
        <div id="sh-assistant-summary-details" class="small muted" style="margin-bottom:14px;line-height:1.6"></div>
        <div style="display:flex;gap:10px">
          <button type="button" class="btn btn-outline btn-sm" id="sh-assistant-edit-btn">Edit Details</button>
          <button type="button" class="btn btn-primary btn-sm" id="sh-assistant-confirm-btn">Confirm Booking</button>
        </div>
      </div>
    </div>`;
  }

  /**
   * 7. AI COMPLAINT CLASSIFIER WIDGET
   */
  function renderComplaintClassifierWidget() {
    return `
    <div class="sh-ai-card" style="background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px;margin-bottom:30px">
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:14px">
        <span class="e-ic" style="width:40px;height:40px;border-radius:12px;background:var(--danger-50);color:var(--danger-600);display:grid;place-items:center">${icon('alertTriangle', 20)}</span>
        <div>
          <h3 style="font-size:17px;font-weight:900;color:var(--ink);margin:0">⚠️ AI Complaint Auto-Classifier</h3>
          <p class="small muted" style="margin:0">Automatic categorization, priority assignment & suggested resolution</p>
        </div>
      </div>

      <div class="field">
        <label class="label">Customer Complaint Text</label>
        <textarea id="sh-complaint-input" class="textarea" style="min-height:70px" placeholder="e.g. Provider arrived 3 hours late and overcharged by ₹300..."></textarea>
      </div>

      <button type="button" id="sh-complaint-classify-btn" class="btn btn-soft btn-block" style="font-weight:700">Classify Complaint</button>

      <div id="sh-complaint-result-box" style="display:none;margin-top:16px;padding:14px;background:var(--surface-2);border-radius:12px;border:1px dashed var(--line)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:13px;font-weight:800;color:var(--ink)" id="sh-complaint-cat-tag">Category: Late Arrival</span>
          <span class="badge badge-danger" id="sh-complaint-priority-tag">Priority: HIGH</span>
        </div>
        <div style="font-size:12px;color:var(--ink-2);margin-bottom:6px" id="sh-complaint-dept-tag">Department: Operations</div>
        <div style="font-size:12px;color:var(--success-600);background:var(--success-50);padding:6px 10px;border-radius:8px" id="sh-complaint-res-tag">
          Suggested Resolution: Issue apology credit voucher.
        </div>
      </div>
    </div>`;
  }

  /**
   * Event wiring helper for AI components
   */
  function wireEvents(root = document) {
    // Natural Language Search Wire
    const searchInput = root.querySelector('#sh-ai-search-input');
    const searchBtn = root.querySelector('#sh-ai-search-btn');
    const searchResults = root.querySelector('#sh-ai-search-results');
    const searchExtracted = root.querySelector('#sh-ai-search-extracted');

    if (searchBtn && searchInput) {
      const runSearch = async () => {
        const q = searchInput.value.trim();
        if (!q) return;
        searchBtn.disabled = true;
        searchBtn.innerText = 'Searching…';
        const res = await apiCall('search', { query: q });
        searchBtn.disabled = false;
        searchBtn.innerText = 'Search AI';

        if (res && res.services) {
          if (searchExtracted && res.extracted) {
            searchExtracted.innerHTML = Object.entries(res.extracted)
              .map(([k, v]) => `<span class="badge badge-primary">${esc(k.toUpperCase())}: ${esc(v)}</span>`)
              .join('');
          }
          if (searchResults) {
            searchResults.innerHTML = renderRecommendationSection(res.services, `AI Results for "${q}"`);
          }
        }
      };

      searchBtn.addEventListener('click', runSearch);
      searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });
    }

    // Price Calculator Wire
    const calcBtn = root.querySelector('#sh-price-calc-btn');
    const svcSelect = root.querySelector('#sh-price-svc-select');
    const complexitySelect = root.querySelector('#sh-price-complexity-select');
    const resultBox = root.querySelector('#sh-price-result-box');
    const priceText = root.querySelector('#sh-price-range-text');
    const explanationList = root.querySelector('#sh-price-explanation-list');

    if (calcBtn) {
      calcBtn.addEventListener('click', async () => {
        calcBtn.disabled = true;
        calcBtn.innerText = 'Calculating…';
        const res = await apiCall('price', {
          serviceId: svcSelect?.value || 's1',
          complexity: complexitySelect?.value || 'medium',
        });
        calcBtn.disabled = false;
        calcBtn.innerText = 'Calculate Price Estimate';

        if (res && res.formattedRange) {
          if (resultBox) resultBox.style.display = 'block';
          if (priceText) priceText.innerText = res.formattedRange;
          if (explanationList && res.explanation) {
            explanationList.innerHTML = res.explanation.map(x => `<div>• ${esc(x)}</div>`).join('');
          }
        }
      });
    }

    // Guided Booking Assistant Wire
    const assistantBtn = root.querySelector('#sh-assistant-generate-btn');
    const summaryBox = root.querySelector('#sh-assistant-summary-box');
    const summaryDetails = root.querySelector('#sh-assistant-summary-details');

    if (assistantBtn) {
      assistantBtn.addEventListener('click', async () => {
        const payload = {
          serviceId: 's1',
          category: root.querySelector('#sh-assistant-service')?.value || 'AC Cleaning',
          location: root.querySelector('#sh-assistant-location')?.value || 'Mumbai',
          date: root.querySelector('#sh-assistant-date')?.value || '2026-08-15',
          time: root.querySelector('#sh-assistant-time')?.value || '10:00 AM',
        };
        const res = await apiCall('booking-assistant', { step: 1, payload });
        if (res && res.summary) {
          if (summaryBox) summaryBox.style.display = 'block';
          if (summaryDetails) {
            summaryDetails.innerHTML = `
              <div><b>Service:</b> ${esc(res.summary.category)}</div>
              <div><b>Location:</b> ${esc(res.summary.location)}</div>
              <div><b>Date & Time:</b> ${esc(res.summary.date)} at ${esc(res.summary.time)}</div>
              <div><b>Estimated Price:</b> ${esc(res.summary.estimatedPrice)}</div>
            `;
          }
        }
      });
    }

    // Complaint Classifier Wire
    const classifyBtn = root.querySelector('#sh-complaint-classify-btn');
    const complaintInput = root.querySelector('#sh-complaint-input');
    const complaintResultBox = root.querySelector('#sh-complaint-result-box');

    if (classifyBtn && complaintInput) {
      classifyBtn.addEventListener('click', async () => {
        const text = complaintInput.value.trim();
        if (!text) return;
        classifyBtn.disabled = true;
        const res = await apiCall('complaint-classification', { complaintText: text });
        classifyBtn.disabled = false;

        if (res && res.classification) {
          if (complaintResultBox) complaintResultBox.style.display = 'block';
          const catEl = root.querySelector('#sh-complaint-cat-tag');
          const prioEl = root.querySelector('#sh-complaint-priority-tag');
          const deptEl = root.querySelector('#sh-complaint-dept-tag');
          const resEl = root.querySelector('#sh-complaint-res-tag');

          if (catEl) catEl.innerText = `Category: ${res.classification.category}`;
          if (prioEl) prioEl.innerText = `Priority: ${res.classification.priority.toUpperCase()}`;
          if (deptEl) deptEl.innerText = `Department: ${res.classification.department}`;
          if (resEl) resEl.innerText = `Suggested Resolution: ${res.classification.suggestedResolution}`;
        }
      });
    }
  }

  return {
    apiCall,
    renderRecommendationSection,
    renderSearchWidget,
    renderPriceEstimatorWidget,
    renderProviderMatchWidget,
    renderReviewAnalysisWidget,
    renderBookingAssistantWidget,
    renderComplaintClassifierWidget,
    wireEvents,
  };
})();
