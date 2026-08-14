/* ------------------------------------------------------------------
   SMS + WhatsApp OTP delivery.
   - SMS       → Twilio Messages API        (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM)
   - WhatsApp  → Meta WhatsApp Cloud API    (WHATSAPP_TOKEN / WHATSAPP_PHONE_ID)
                 or Twilio WhatsApp          (TWILIO_* + TWILIO_WHATSAPP_FROM)

   No provider configured → demo mode: the message is printed to the server
   console and the OTP is returned in the API response (OTP_BYPASS).
   ------------------------------------------------------------------ */
const b64 = s => Buffer.from(s, 'utf8').toString('base64');
const PROVIDER_TIMEOUT_MS = 10000;

/* fetch with a timeout so a hung provider can't hang an OTP request forever */
async function fetchT(url, opts = {}) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
}

const TWILIO_SID = (process.env.TWILIO_ACCOUNT_SID || '').trim();
const TWILIO_TOKEN = (process.env.TWILIO_AUTH_TOKEN || '').trim();
const TWILIO_FROM = (process.env.TWILIO_FROM || '').trim();
const TWILIO_WA_FROM = (process.env.TWILIO_WHATSAPP_FROM || '').trim();
const WA_TOKEN = (process.env.WHATSAPP_TOKEN || '').trim();
const WA_PHONE_ID = (process.env.WHATSAPP_PHONE_ID || '').trim();

const twilioConfigured = () => !!(TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM);
const metaConfigured = () => !!(WA_TOKEN && WA_PHONE_ID);
const twilioWhatsAppConfigured = () => !!(TWILIO_SID && TWILIO_TOKEN && TWILIO_WA_FROM);

const waNum = n => (String(n).startsWith('whatsapp:') ? String(n) : 'whatsapp:' + String(n));

async function twilioSend({ from, to, body }) {
  const res = await fetchT(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + b64(TWILIO_SID + ':' + TWILIO_TOKEN),
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Twilio: ' + (data.message || 'HTTP ' + res.status));
  return { provider: 'twilio', sid: data.sid };
}

async function metaWhatsAppSend({ to, body }) {
  const res = await fetchT(`https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + WA_TOKEN },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('WhatsApp: ' + ((data.error && data.error.message) || 'HTTP ' + res.status));
  return { provider: 'meta-whatsapp', id: data.messages && data.messages[0] && data.messages[0].id };
}

/* Send an SMS with a real provider, or log it in demo mode. */
async function sendSms(to, text) {
  if (!twilioConfigured()) {
    console.log(`[sms:demo] TO=${to} · ${text}`);
    return { delivered: false, demo: true };
  }
  const r = await twilioSend({ from: TWILIO_FROM, to, body: text });
  return { delivered: true, ...r };
}

/* Send a WhatsApp message (Meta Cloud API preferred, Twilio WhatsApp fallback). */
async function sendWhatsApp(to, text) {
  if (metaConfigured()) {
    const r = await metaWhatsAppSend({ to: String(to).replace(/^whatsapp:/, ''), body: text });
    return { delivered: true, ...r };
  }
  if (twilioWhatsAppConfigured()) {
    const r = await twilioSend({ from: waNum(TWILIO_WA_FROM), to: waNum(to), body: text });
    return { delivered: true, provider: 'twilio-whatsapp', ...r };
  }
  console.log(`[wa:demo] TO=${to} · ${text}`);
  return { delivered: false, demo: true };
}

module.exports = { sendSms, sendWhatsApp };
