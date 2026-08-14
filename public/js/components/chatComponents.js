/* ==================================================================
   SERVEHUB CHAT UI COMPONENTS MODULE
   Reusable frontend UI components for the Chat & Communication Module
   ================================================================== */
window.ChatComponents = (() => {
  const { icon, esc, money } = U;

  /**
   * Helper: Call Chat API
   */
  async function chatApi(endpoint, method = 'GET', data = null) {
    try {
      const token = localStorage.getItem('sh_token') || Store.state.user?.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const opts = { method, headers };
      if (data) opts.body = JSON.stringify(data);

      const res = await fetch(`/api/chat${endpoint}`, opts);
      if (!res.ok) throw new Error(`Chat API Error: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.warn(`[Chat API Error: ${endpoint}]`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * 1. Render Sidebar Conversation Item
   */
  function renderConversationItem(c, activeConvId = null) {
    const isActive = String(c.id) === String(activeConvId);
    const unread = c.unreadCount || 0;
    const isOnline = c.partnerPresence?.status === 'online';

    return `
    <div class="sh-chat-item ${isActive ? 'active' : ''}" data-conv-id="${esc(c.id)}" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid var(--line);cursor:pointer;background:${isActive ? 'var(--surface-2)' : 'transparent'};transition:.2s">
      <div style="position:relative;flex:none">
        <div class="avatar" style="width:44px;height:44px;border-radius:50%;background:var(--primary-50);color:var(--primary-600);font-weight:800;display:grid;place-items:center;font-size:16px">
          ${esc((c.partnerName || 'U').charAt(0))}
        </div>
        <span style="position:absolute;bottom:2px;right:2px;width:11px;height:11px;border-radius:50%;background:${isOnline ? 'var(--success)' : 'var(--ink-4)'};border:2px solid var(--card)"></span>
      </div>

      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h4 style="font-size:14px;font-weight:800;color:var(--ink);margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.partnerName || 'Conversation')}</h4>
          <span style="font-size:11px;color:var(--ink-3)">${formatTime(c.lastMessageAt || c.updatedAt)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px">
          <p class="small muted" style="margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px">${esc(c.lastMessage || 'Tap to view conversation')}</p>
          ${unread > 0 ? `<span class="badge badge-primary" style="font-size:10px;padding:2px 6px;border-radius:999px">${unread}</span>` : ''}
        </div>
      </div>
    </div>`;
  }

  /**
   * 2. Render Message Bubble inside Chat Thread
   */
  function renderMessageBubble(m, currentUserId) {
    const isMe = String(m.senderId) === String(currentUserId);
    const statusIcon = m.status === 'read' ? '<span style="color:#60A5FA">✓✓</span>' : (m.status === 'delivered' ? '✓✓' : '✓');

    return `
    <div style="display:flex;flex-direction:column;align-items:${isMe ? 'flex-end' : 'flex-start'};margin-bottom:12px">
      <div style="max-width:75%;padding:10px 14px;border-radius:${isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px'};background:${isMe ? 'var(--primary)' : 'var(--surface-2)'};color:${isMe ? '#ffffff' : 'var(--ink)'};box-shadow:var(--sh-sm);position:relative">
        
        ${m.imageUrl ? `
          <div style="margin-bottom:6px;overflow:hidden;border-radius:10px">
            <img src="${esc(m.imageUrl)}" style="max-width:240px;max-height:180px;display:block;object-fit:cover;cursor:pointer" onclick="window.open('${esc(m.imageUrl)}')">
          </div>
        ` : ''}

        ${m.bookingDetails ? renderBookingChatCard(m.bookingDetails) : ''}

        ${m.text ? `<div style="font-size:14px;line-height:1.45;word-break:break-word">${esc(m.text)}</div>` : ''}

        <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px;font-size:10.5px;opacity:0.8;margin-top:4px">
          <span>${formatTime(m.createdAt)}</span>
          ${isMe ? `<span>${statusIcon}</span>` : ''}
        </div>
      </div>
    </div>`;
  }

  /**
   * 3. Render Booking Card Embed inside Chat
   */
  function renderBookingChatCard(b) {
    return `
    <div style="background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:12px;padding:12px;margin:6px 0;box-shadow:var(--sh-xs)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:11px;font-weight:800;color:var(--primary);text-transform:uppercase">📅 Booking Reference #${esc(b.id)}</span>
        <span class="badge badge-success" style="font-size:10.5px">${esc(b.status || 'Confirmed')}</span>
      </div>
      <div style="font-size:13.5px;font-weight:800;margin-bottom:4px">${esc(b.serviceName || 'Home Service')}</div>
      <div style="font-size:12px;color:var(--ink-2);margin-bottom:8px">📅 ${esc(b.date || 'Scheduled')} at ${esc(b.time || '10:00 AM')}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px dashed var(--line)">
        <span style="font-size:13px;font-weight:900">${money(b.total || 499)}</span>
        <a href="#/track/${esc(b.id)}" class="btn btn-primary btn-sm" style="font-size:11px;padding:4px 10px">View Booking</a>
      </div>
    </div>`;
  }

  /**
   * Helper: Format Date/Time
   */
  function formatTime(isoStr) {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }

  return {
    chatApi,
    renderConversationItem,
    renderMessageBubble,
    renderBookingChatCard,
    formatTime,
  };
})();
