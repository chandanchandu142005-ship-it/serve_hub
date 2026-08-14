/* ==================================================================
   SERVEHUB AI HUB & PERSONALIZED DASHBOARD PAGE (#/ai-hub)
   Host page for all 10 AI Features & Personalized Customer Dashboard
   ================================================================== */
window.AIHub = (() => {
  const { icon, esc, money } = U;
  const { 
    renderRecommendationSection,
    renderSearchWidget,
    renderPriceEstimatorWidget,
    renderProviderMatchWidget,
    renderReviewAnalysisWidget,
    renderBookingAssistantWidget,
    renderComplaintClassifierWidget,
    wireEvents,
    apiCall
  } = window.AIComponents || {};

  let activeTab = 'recommendations';

  function render() {
    const user = Store.currentUser() || { name: 'Customer' };

    return `
    <div class="container" style="padding-top:24px;padding-bottom:60px">
      <!-- AI Hub Banner Header -->
      <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED,#EC4899);border-radius:24px;padding:32px;color:#fff;margin-bottom:28px;position:relative;overflow:hidden;box-shadow:0 10px 30px rgba(79,70,229,0.3)">
        <div style="position:relative;z-index:2;max-width:650px">
          <span style="background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);color:#fff;font-size:12px;font-weight:800;padding:4px 12px;border-radius:999px;display:inline-block;margin-bottom:12px">
            ✨ ServeHub AI Intelligence Hub
          </span>
          <h1 style="font-size:30px;font-weight:900;margin:0 0 10px;line-height:1.2">Welcome to your AI Dashboard, ${esc(user.name)}</h1>
          <p style="font-size:15px;opacity:0.92;margin:0 0 20px;line-height:1.5">
            Discover personalized service recommendations, natural language search, provider match scoring, transparent price estimation, and AI booking support.
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:10px">
            <a href="#/ai-hub" onclick="window.AIHub.setTab('search')" class="btn" style="background:#fff;color:#4F46E5;font-weight:800">🔍 Try AI Search</a>
            <a href="#/ai-hub" onclick="window.AIHub.setTab('price')" class="btn" style="background:rgba(255,255,255,0.2);color:#fff;font-weight:700">💰 Price Estimator</a>
            <a href="#/ai-hub" onclick="window.AIHub.setTab('assistant')" class="btn" style="background:rgba(255,255,255,0.2);color:#fff;font-weight:700">🤖 AI Booking Assistant</a>
          </div>
        </div>
      </div>

      <!-- Feature Selection Navigation Tabs -->
      <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:24px" class="no-scrollbar">
        <button class="f-chip ${activeTab === 'recommendations' ? 'on' : ''}" onclick="window.AIHub.setTab('recommendations')">⭐ Recommended For You</button>
        <button class="f-chip ${activeTab === 'search' ? 'on' : ''}" onclick="window.AIHub.setTab('search')">🔍 Natural Search</button>
        <button class="f-chip ${activeTab === 'providers' ? 'on' : ''}" onclick="window.AIHub.setTab('providers')">👨‍🔧 Provider Matching</button>
        <button class="f-chip ${activeTab === 'price' ? 'on' : ''}" onclick="window.AIHub.setTab('price')">💰 Price Suggestion</button>
        <button class="f-chip ${activeTab === 'assistant' ? 'on' : ''}" onclick="window.AIHub.setTab('assistant')">🤖 Booking Assistant</button>
        <button class="f-chip ${activeTab === 'reviews' ? 'on' : ''}" onclick="window.AIHub.setTab('reviews')">📝 Review Insights</button>
        <button class="f-chip ${activeTab === 'complaints' ? 'on' : ''}" onclick="window.AIHub.setTab('complaints')">⚠️ Complaint Classifier</button>
      </div>

      <!-- Main Dynamic Content Container -->
      <div id="sh-ai-tab-content">
        ${renderTabContent(activeTab)}
      </div>

      <!-- 10. Personalized Recommendations Hub Sections -->
      <div style="margin-top:40px;border-top:1px dashed var(--line);padding-top:30px">
        <h2 style="font-size:22px;font-weight:900;color:var(--ink);margin-bottom:20px">🎯 Your Personal AI Hub Overview</h2>

        <div id="sh-ai-personalized-sections">
          ${renderRecommendationSection(DATA.services.slice(0, 4), 'Recommended Services')}
          ${renderRecommendationSection(DATA.services.slice(2, 6), 'Frequently Booked Near You')}
          ${renderRecommendationSection(DATA.services.slice(1, 5), 'You May Also Need')}
        </div>
      </div>
    </div>`;
  }

  function renderTabContent(tab) {
    if (tab === 'search') return renderSearchWidget ? renderSearchWidget() : '';
    if (tab === 'price') return renderPriceEstimatorWidget ? renderPriceEstimatorWidget() : '';
    if (tab === 'providers') return renderProviderMatchWidget ? renderProviderMatchWidget() : '';
    if (tab === 'reviews') return renderReviewAnalysisWidget ? renderReviewAnalysisWidget() : '';
    if (tab === 'assistant') return renderBookingAssistantWidget ? renderBookingAssistantWidget() : '';
    if (tab === 'complaints') return renderComplaintClassifierWidget ? renderComplaintClassifierWidget() : '';
    
    // Default recommendations tab
    return renderRecommendationSection ? renderRecommendationSection(DATA.services.slice(0, 6), 'Top Recommended Services For You') : '';
  }

  function setTab(tab) {
    activeTab = tab;
    const content = document.getElementById('sh-ai-tab-content');
    if (content) {
      content.innerHTML = renderTabContent(tab);
      if (wireEvents) wireEvents(document);
    }
  }

  function init(root = document) {
    if (wireEvents) wireEvents(root);
  }

  return {
    render,
    init,
    setTab,
  };
})();
