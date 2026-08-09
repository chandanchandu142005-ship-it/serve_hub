# Servehub — run instructions

## Frontend (SPA, npm project)

- The demo build is a single self-contained file: **`frontend/servehub.html`**
  (open directly in a browser; also served by the preview).
- Frontend has its own npm project: `cd frontend && npm install`, then
  `npm run dev` → serves `frontend/` on :5500 (root script: `npm run dev:web`).
- To rebuild it from source:
  ```bash
  node scripts/bundle.js
  ```
  This inlines `frontend/css/styles.css` and all `frontend/js/*.js` into
  `frontend/servehub.html`. Source files live in `frontend/`.

## Backend (Express + MongoDB/Mongoose API)

- Requirements: Node >= 18 (verified on Node 24), MongoDB optional.
- Setup:
  ```bash
  cd backend
  npm install
  cp .env.example .env   # optional — defaults work without MongoDB
  npm start              # → http://localhost:4000 (PORT env override respected)
  ```
- **Models:** all entities have Mongoose schemas in `backend/src/models/`
  (User, Professional, Service, Category, Coupon, Booking, Review,
  Notification, Address, WalletTransaction, SupportTicket, MembershipPlan,
  GiftCard, Referral, City, Counter).
- **Database:** the API connects to MongoDB at `MONGODB_URI` (default
  `mongodb://127.0.0.1:27017`, db `servehub`) — a raw-driver liveness probe,
  then Mongoose for the data layer — and seeds collections on first run. If
  MongoDB is unreachable it auto-falls back to a JSON file store at
  `backend/data/store.json` — no database server needed.
- Demo accounts bootstrapped on first start:
  - Admin: `admin@servehub.com` / `admin123`
  - Customer: `demo@servehub.com` / `demo123` (seeded with addresses,
    notifications, wallet txns, referrals, tickets, reviews — idempotent
    seed, ids 50xxx / user 9000)
- Health check: `GET /api/health` → `{ "ok": true, "db": "mongo" | "file" }`.
- Project map: `docs/PROJECT-STRUCTURE.md`.

## Opening on your phone (same Wi-Fi)

- The frontend auto-detects the backend host (`window.SH_API` in
  `frontend/js/store.js`): on the laptop it uses `localhost:4000`, on a
  phone it uses the laptop's LAN IP + `:4000`. Override with
  `window.SERVEHUB_API` before the scripts load if needed.
- On the phone, open `http://<laptop-LAN-IP>:5501/servehub` (dev server on
  5501) or `http://<laptop-LAN-IP>:5500` (dev:web). The API listens on
  `0.0.0.0:4000` and Node.js has an inbound firewall rule, so login works
  from the phone as long as both devices are on the same network.

## Real OTP delivery (email / SMS / WhatsApp)

- Default is demo mode: OTPs are printed to the server console and returned
  in the API response. To send REAL emails fill `SMTP_*` in `backend/.env`
  (Gmail app password, port 587) and set `OTP_BYPASS=false`; for SMS/WhatsApp
  fill `TWILIO_*` / `WHATSAPP_*`. See `backend/.env.example`.
- Test delivery: `cd backend && npm run mail:test` (Ethereal fallback proves
  the pipeline; re-run after configuring SMTP to verify real delivery).

## Install Servehub as an app (PWA — phone + laptop)

Servehub is a Progressive Web App: it can be **installed on any phone or
laptop** like a native app (home-screen icon, full-screen window, works
offline). Files: `frontend/manifest.webmanifest`, `frontend/sw.js`
(service worker), `frontend/icons/*.png` (regenerated with
`node scripts/make-icons.js`). Install CTA lives in the header, footer,
mobile menu and the landing “Get the app” section; the install modal is
device-aware (iPhone/Android/computer steps).

- **Laptop (anywhere):** open the site in Chrome/Edge → click the install
  icon in the address bar (or ⋮ menu → Install). Works on `localhost`.
- **Phone — same Wi-Fi:** open `http://<laptop-LAN-IP>:5501/servehub` in
  Chrome/Edge/Safari. iOS Safari: Share → “Add to Home Screen”. Android
  Chrome: ⋮ → “Add to Home screen” / “Install app”.
- **Important (secure context):** the browser's one-tap install prompt and
  the service worker only activate on **HTTPS or localhost**. From a phone
  over plain `http://<LAN-IP>` use the manual Add-to-Home-Screen path above
  (iOS works; Android Chrome still adds the shortcut). For the full
  one-tap install from a phone, expose the site over HTTPS — e.g. Cloudflare
  quick tunnel (`cloudflared tunnel --url http://localhost:5501`) or serve
  with SSL (`npx serve . --ssl -l 5501`). Note the API must then also be
  HTTPS (or use `window.SERVEHUB_API` to point at an HTTPS backend).
- The service worker caches only the app shell on the same origin — it never
  caches API calls (API lives on `:4000`, a different origin).

## Android app (APK download)

Servehub can be installed on Android as a real APK. The UI (landing “Get
it on Android” badge → “Download Android APK”) serves the APK at
`/servehub.apk` when it has been built, otherwise shows the build guide.

- **Easiest (no tools):** deploy the site to a public HTTPS URL and package
  it on https://www.pwabuilder.com → Android → download the signed APK.
- **Local one-command build:** install Java 17+ and the Android SDK once,
  then `npm run build:apk -- http://localhost:5501/servehub` (defaults to
  that URL). The script preflights java/sdk, fills `android/twa-manifest.json`
  from your URL, runs Bubblewrap (TWA, `fallbackType: customtabs` so it works
  for LAN/localhost too), and copies the APK to `frontend/servehub.apk`.
- Full guide: `android/README.md`. Rebuild icons anytime:
  `node scripts/make-icons.js`.

## VS Code workflow

- Open the project root (`serve-hub-chan`) as the workspace folder.
- Recommended extensions: MongoDB for VS Code, Live Server, Prettier
  (`.vscode/extensions.json`).
- `F5` → "Debug API" runs the backend with breakpoints (`.vscode/launch.json`).
- Right-click `frontend/servehub.html` → "Open with Live Server" for the SPA.
- Root scripts: `npm run install:all`, `npm run build`, `npm run start:api`.
