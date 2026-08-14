/* ==================================================================
   SERVEHUB CHAT PAGE (#/chat)
   Full responsive split-view Chat & Real-Time Communication Hub
   ================================================================== */
window.ChatPage = (() => {
  const { icon, esc, money, openModal, closeModal, modalShell, toast } = U;
  const { chatApi, renderConversationItem, renderMessageBubble } = window.ChatComponents || {};

  let conversations = [];
  let activeConvId = null;
  let messages = [];
  let currentPartner = null;
  let isBlocked = false;
  let isPartnerTyping = false;
  let pollInterval = null;
  let imagePreviewBase64 = null;

  async function loadData() {
    const user = Store.currentUser();
    if (!user) return;

    const res = await chatApi('/conversations');
    if (res && res.conversations) {
      conversations = res.conversations;
      if (!activeConvId && conversations.length > 0) {
        activeConvId = conversations[0].id;
      }
    }

    if (activeConvId) {
      await loadMessages(activeConvId);
    }
  }

  async function loadMessages(convId) {
    activeConvId = convId;
    const res = await chatApi(`/conversations/${convId}/messages`);
    if (res && res.messages) {
      messages = res.messages;
      isBlocked = res.isBlocked || false;
      isPartnerTyping = res.isPartnerTyping || false;

      const conv = conversations.find(c => String(c.id) === String(convId));
      if (conv) {
        currentPartner = {
          id: conv.partnerId,
          name: conv.partnerName,
          presence: res.partnerPresence || conv.partnerPresence,
        };
        conv.unreadCount = 0;
      }
    }
  }

  function render() {
    const user = Store.currentUser() || { name: 'User' };
    const currentConv = conversations.find(c => String(c.id) === String(activeConvId));

    return `
    <div class="container" style="padding-top:16px;padding-bottom:40px">
      <!-- Chat Split-View Layout Container -->
      <div style="display:grid;grid-template-columns:320px 1fr;gap:0;border:1px solid var(--line);border-radius:20px;background:var(--card);overflow:hidden;min-height:600px;box-shadow:var(--sh-md)">
        
        <!-- Left Sidebar: Conversations & Search -->
        <div style="border-right:1px solid var(--line);display:flex;flex-direction:column;background:var(--surface-2)">
          <div style="padding:16px;border-bottom:1px solid var(--line)">
            <h3 style="font-size:18px;font-weight:900;color:var(--ink);margin:0 0 12px">💬 Messages</h3>
            <div style="position:relative">
              <input type="text" id="sh-chat-search-input" class="input" placeholder="Search messages or names..." style="padding-left:36px;height:40px;font-size:13.5px;border-radius:10px">
              <span style="position:absolute;left:12px;top:11px;color:var(--ink-3)">${icon('search', 16)}</span>
            </div>
          </div>

          <div id="sh-chat-conv-list" style="flex:1;overflow-y:auto">
            ${conversations.length > 0 ? conversations.map(c => renderConversationItem(c, activeConvId)).join('') : `
              <div class="center" style="padding:40px 16px;color:var(--ink-3)">
                <div style="font-size:32px;margin-bottom:8px">💬</div>
                <div style="font-size:14px;font-weight:700">No conversations yet</div>
                <div class="small muted" style="margin-top:4px">Start chatting with local professionals from their profile or booking details page.</div>
              </div>
            `}
          </div>
        </div>

        <!-- Right Main Pane: Active Conversation Thread -->
        <div style="display:flex;flex-direction:column;background:var(--card)" id="sh-chat-main-pane">
          ${activeConvId && currentPartner ? renderActiveChatPane(user) : `
            <div class="center" style="margin:auto;padding:40px;color:var(--ink-3)">
              <div style="font-size:48px;margin-bottom:12px">💬</div>
              <h3 style="font-size:18px;font-weight:800;color:var(--ink)">Select a conversation to start messaging</h3>
              <p class="small muted">Communicating directly with your provider ensures smooth service coordination.</p>
            </div>
          `}
        </div>

      </div>
    </div>`;
  }

  function renderActiveChatPane(user) {
    const presence = currentPartner.presence || {};
    const isOnline = presence.status === 'online';

    return `
    <!-- Active Header -->
    <div style="padding:14px 20px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;background:var(--surface-2)">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="avatar" style="width:40px;height:40px;border-radius:50%;background:var(--primary-50);color:var(--primary-600);font-weight:800;display:grid;place-items:center">
          ${esc(currentPartner.name.charAt(0))}
        </div>
        <div>
          <h4 style="font-size:15px;font-weight:800;color:var(--ink);margin:0">${esc(currentPartner.name)}</h4>
          <div style="font-size:11.5px;color:${isOnline ? 'var(--success-600)' : 'var(--ink-3)'};font-weight:600">
            ${isPartnerTyping ? '✍️ Typing…' : esc(presence.text || 'Offline')}
          </div>
        </div>
      </div>

      <!-- Action Buttons (Block & Report Menu) -->
      <div style="display:flex;gap:8px">
        <button type="button" class="btn btn-outline btn-sm" id="sh-chat-btn-report" title="Report user">⚠️ Report</button>
        <button type="button" class="btn ${isBlocked ? 'btn-success' : 'btn-outline'} btn-sm" id="sh-chat-btn-block">
          ${isBlocked ? 'Unblock' : '🚫 Block'}
        </button>
      </div>
    </div>

    <!-- Message Thread Scroll Area -->
    <div id="sh-chat-messages-scroll" style="flex:1;padding:20px;overflow-y:auto;background:var(--card)">
      ${messages.map(m => renderMessageBubble(m, user.id)).join('')}
    </div>

    <!-- Image Attachment Preview Bar -->
    <div id="sh-chat-img-preview-bar" style="display:none;padding:10px 20px;background:var(--surface-2);border-top:1px solid var(--line);align-items:center;gap:12px">
      <img id="sh-chat-img-preview-thumb" src="" style="width:50px;height:50px;border-radius:8px;object-fit:cover">
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700;color:var(--ink)">Image attachment ready</div>
        <div class="xsmall muted">Click Send to transmit image to provider</div>
      </div>
      <button type="button" class="icon-btn" id="sh-chat-img-cancel">${icon('x', 16)}</button>
    </div>

    <!-- Message Input Bar -->
    <div style="padding:14px 20px;border-top:1px solid var(--line);background:var(--surface-2)">
      ${isBlocked ? `
        <div class="small center" style="color:var(--danger-600);font-weight:700">🚫 Messaging disabled: This conversation is blocked.</div>
      ` : `
        <div style="display:flex;gap:10px;align-items:center">
          <label class="icon-btn" style="cursor:pointer" title="Attach image">
            ${icon('camera', 20)}
            <input type="file" id="sh-chat-file-input" accept="image/jpeg,image/png,image/webp" style="display:none">
          </label>
          <input type="text" id="sh-chat-msg-input" class="input" placeholder="Type a message..." style="height:44px;font-size:14px;border-radius:12px">
          <button type="button" id="sh-chat-send-btn" class="btn btn-primary" style="height:44px;padding:0 18px;border-radius:12px">${icon('send', 16)}</button>
        </div>
      `}
    </div>`;
  }

  function init(root = document) {
    stopPolling();
    loadData().then(() => {
      renderDOM();
      startPolling();
    });
  }

  function renderDOM() {
    const appEl = document.getElementById('outlet') || document.getElementById('app');
    if (appEl && location.hash.startsWith('#/chat')) {
      appEl.innerHTML = render();
      bindEvents(document);
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    const scrollBox = document.getElementById('sh-chat-messages-scroll');
    if (scrollBox) {
      scrollBox.scrollTop = scrollBox.scrollHeight;
    }
  }

  function startPolling() {
    pollInterval = setInterval(async () => {
      if (!location.hash.startsWith('#/chat') || !activeConvId) return;
      await loadMessages(activeConvId);
      const scrollBox = document.getElementById('sh-chat-messages-scroll');
      const isAtBottom = scrollBox ? (scrollBox.scrollHeight - scrollBox.scrollTop <= scrollBox.clientHeight + 100) : false;
      
      const mainPane = document.getElementById('sh-chat-main-pane');
      if (mainPane) {
        const user = Store.currentUser() || { id: 1 };
        mainPane.innerHTML = renderActiveChatPane(user);
        bindEvents(document);
        if (isAtBottom) scrollToBottom();
      }
    }, 3500);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  function bindEvents(root = document) {
    // Conversation List clicks
    root.querySelectorAll('[data-conv-id]').forEach(el => {
      el.addEventListener('click', async () => {
        const id = el.dataset.convId;
        await loadMessages(id);
        renderDOM();
      });
    });

    // Send Message Button & Enter key
    const sendBtn = root.querySelector('#sh-chat-send-btn');
    const msgInput = root.querySelector('#sh-chat-msg-input');
    const fileInput = root.querySelector('#sh-chat-file-input');

    const doSend = async () => {
      const text = msgInput ? msgInput.value.trim() : '';
      if (!text && !imagePreviewBase64) return;

      if (sendBtn) sendBtn.disabled = true;

      const payload = {
        conversationId: activeConvId,
        receiverId: currentPartner.id,
        text,
        imageUrl: imagePreviewBase64 || '',
        messageType: imagePreviewBase64 ? 'image' : 'text',
      };

      const res = await chatApi('/messages', 'POST', payload);
      if (sendBtn) sendBtn.disabled = false;

      if (res && res.success) {
        if (msgInput) msgInput.value = '';
        imagePreviewBase64 = null;
        const previewBar = root.querySelector('#sh-chat-img-preview-bar');
        if (previewBar) previewBar.style.display = 'none';

        await loadMessages(activeConvId);
        renderDOM();
      } else {
        toast((res && res.error) || 'Could not send message', 'warn');
      }
    };

    if (sendBtn) sendBtn.addEventListener('click', doSend);
    if (msgInput) msgInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });

    // Image Upload
    if (fileInput) {
      fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          toast('Image size exceeds 5 MB limit', 'warn');
          return;
        }

        const reader = new FileReader();
        reader.onload = ev => {
          imagePreviewBase64 = ev.target.result;
          const previewBar = root.querySelector('#sh-chat-img-preview-bar');
          const previewThumb = root.querySelector('#sh-chat-img-preview-thumb');
          if (previewBar) previewBar.style.display = 'flex';
          if (previewThumb) previewThumb.src = imagePreviewBase64;
        };
        reader.readAsDataURL(file);
      });
    }

    // Cancel Image
    const cancelImgBtn = root.querySelector('#sh-chat-img-cancel');
    if (cancelImgBtn) {
      cancelImgBtn.addEventListener('click', () => {
        imagePreviewBase64 = null;
        const previewBar = root.querySelector('#sh-chat-img-preview-bar');
        if (previewBar) previewBar.style.display = 'none';
      });
    }

    // Block Button
    const blockBtn = root.querySelector('#sh-chat-btn-block');
    if (blockBtn) {
      blockBtn.addEventListener('click', async () => {
        if (isBlocked) {
          await chatApi(`/block/${currentPartner.id}`, 'DELETE');
          toast('User unblocked', 'success');
        } else {
          await chatApi(`/block/${currentPartner.id}`, 'POST');
          toast('User blocked', 'info');
        }
        await loadMessages(activeConvId);
        renderDOM();
      });
    }

    // Report Button
    const reportBtn = root.querySelector('#sh-chat-btn-report');
    if (reportBtn) {
      reportBtn.addEventListener('click', () => {
        openModal(modalShell('Report User', `
          <div class="field"><label class="label">Reason for Report</label>
            <select id="sh-rep-reason" class="input">
              <option value="Spam / Unsolicited Messages">Spam / Unsolicited Messages</option>
              <option value="Harassment / Abusive Behavior">Harassment / Abusive Behavior</option>
              <option value="Fraud / Overcharging Attempt">Fraud / Overcharging Attempt</option>
              <option value="Inappropriate Content">Inappropriate Content</option>
            </select>
          </div>
          <div class="field"><label class="label">Additional Description</label>
            <textarea id="sh-rep-desc" class="textarea" placeholder="Explain what happened..."></textarea>
          </div>
        `, `<button class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-danger" id="sh-btn-submit-report">Submit Report</button>`));

        const submitRepBtn = document.getElementById('sh-btn-submit-report');
        if (submitRepBtn) {
          submitRepBtn.addEventListener('click', async () => {
            const reason = document.getElementById('sh-rep-reason')?.value || 'General Report';
            const description = document.getElementById('sh-rep-desc')?.value || '';
            const r = await chatApi('/report', 'POST', {
              reportedUserId: currentPartner.id,
              conversationId: activeConvId,
              reason,
              description,
            });
            closeModal();
            if (r && r.success) {
              toast('Report submitted to safety team for review', 'success');
            }
          });
        }
      });
    }
  }

  // Global direct chat trigger helper
  async function openDirectChat(partnerId, bookingId = '') {
    const user = Store.currentUser();
    if (!user) {
      toast('Please sign in to chat', 'info');
      location.hash = '#/login';
      return;
    }

    const res = await chatApi('/conversations', 'POST', { partnerId, bookingId });
    if (res && res.conversation) {
      activeConvId = res.conversation.id;
      location.hash = '#/chat';
    }
  }

  return {
    render,
    init,
    openDirectChat,
  };
})();
