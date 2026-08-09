# Servehub — Project Structure

Everything is split into **two main folders** — `frontend/` and `backend/` — plus a
few root-level helpers. Open the whole folder in VS Code and this map tells you
exactly where each piece lives.

```
serve hub/
│
├── frontend/                     ← 🖥️ THE WEBSITE (SPA — laptop + mobile)
│   ├── index.html                ← entry page (loads css/ + js/)
│   ├── css/styles.css            ← design system (tokens, glass, cards, responsive)
│   ├── js/
│   │   ├── data.js               ← catalogue (categories, services, pros, coupons, plans)
│   │   ├── store.js              ← state + localStorage persistence
│   │   ├── ui.js                 ← icons, helpers, modal/toast/avatar utilities
│   │   ├── app.js                ← router, global actions, page shell
│   │   ├── chatbot.js            ← responsive AI chatbot (Nova)
│   │   └── pages/                ← one file per area
│   │       ├── public.js         ← landing, categories, service detail, static pages
│   │       ├── auth.js           ← login, register, OTP (email/SMS/WhatsApp), forgot
│   │       ├── booking.js        ← multi-step booking flow, track, invoice, modals
│   │       ├── customer.js       ← customer dashboard (14 sections) + live API sync
│   │       ├── professional.js   ← pro dashboard (jobs, income, analytics)
│   │       └── admin.js          ← admin panel (24 sections, live data tabs)
│   ├── manifest.webmanifest      ← PWA manifest (installable app)
│   ├── sw.js                     ← service worker (offline shell)
│   ├── icons/                    ← generated app icons (make-icons.js)
│   ├── package.json              ← npm run dev → :5501 • npm run build
│   ├── servehub.apk              ← ⚡ built Android APK (created by npm run build:apk, served at /servehub.apk)
│   └── servehub.html             ← 🔨 BUILD ARTIFACT (whole app in one file)
│
├── backend/                      ← ⚙️ THE API (Express + MongoDB)
│   ├── server.js                 ← app bootstrap, admin bootstrap, error handling
│   ├── .env / .env.example       ← ports, Mongo URI, SMTP/Twilio/WhatsApp keys
│   ├── package.json              ← npm start → :4000
│   ├── README.md                 ← full API map, DB docs, OTP setup
│   └── src/
│       ├── config/db.js          ← Mongo probe + Mongoose connect + mode switch
│       ├── db/seed-data.js       ← canonical seed data (catalogue + demo account)
│       ├── middleware/           ← auth (JWT), role guards, async wrapper
│       ├── models/               ← ⭐ Mongoose schemas — one per entity
│       │   ├── User, Professional, Service, Category, Coupon, Booking
│       │   ├── Review, Notification, Address, WalletTransaction, SupportTicket
│       │   ├── MembershipPlan, GiftCard, Referral, City, Counter  (+ index.js)
│       ├── repo/
│       │   ├── index.js          ← dispatcher: routes call repo.<fn> blindly
│       │   ├── mongo.js          ← MongoDB implementation (uses the models)
│       │   └── file.js           ← JSON-file fallback (same interface)
│       ├── routes/               ← Express routers (all wired in index.js)
│       │   ├── index.js          ← registers auth/services/pros/bookings/payments/customer/admin
│       │   ├── auth.js           ← register, login (password + email OTP), verify
│       │   ├── services.js       ← categories, services, reviews (public)
│       │   ├── professionals.js  ← pro list, apply, onboarding, income
│       │   ├── bookings.js       ← create, lifecycle status, rate, invoices
│       │   ├── payments.js       ← mock pay, refunds, coupons
│       │   ├── customer.js       ← my reviews, addresses, tickets, notifications
│       │   └── admin.js          ← manage customers/pros/services/coupons/plans/tickets/reviews/gift cards
│       └── services/             ← mailer.js (SMTP), notifier.js (email/SMS/WhatsApp OTP)
│
├── android/                      ← 📱 Android app packaging
│   ├── twa-manifest.json         ← Bubblewrap config (replace the example domain with your URL)
│   └── README.md                 ← build the APK: PWABuilder online OR npm run build:apk locally
├── scripts/
│   ├── bundle.js                 ← rebuilds frontend/servehub.html from source
│   ├── make-icons.js             ← regenerates frontend/icons/*.png (no deps)
│   └── build-apk.js              ← one-command APK builder (preflight → Bubblewrap → servehub.apk)
├── docs/                         ← this file + any other project notes
├── .vscode/                      ← extensions, launch (F5 debug), tasks
└── package.json                  ← root shortcuts: install:all, build, start:api, dev:api, dev:web, check, build:apk
```

## Data flow (easy analysis)

```
Browser (frontend/) ── fetch /api/... ──▶ Express routes (backend/src/routes/)
                                              │
                                              ▼
                                    repo dispatcher (repo/index.js)
                                              │
                          ┌───────────────────┴───────────────────┐
                          ▼                                       ▼
                    mongo.js  ──▶  models/  ──▶  MongoDB          file.js ──▶ data/store.json
                                 (Mongoose schemas)                (offline fallback)
```

- **Routes never touch the DB directly** — they call `repo.<fn>()`, which is a
  Proxy that picks the live backend (Mongo when connected, JSON file otherwise).
- **Seed** (`seed()` in `repo/mongo.js` / `repo/file.js`) populates the
  catalogue **and** a demo account with per-user data so every dashboard section
  has content out of the box.

## Demo accounts

| Role     | Email                 | Password   | Sees                                                                 |
| -------- | --------------------- | ---------- | -------------------------------------------------------------------- |
| Admin    | `admin@servehub.com`  | `admin123` | 24-section admin panel                                               |
| Customer | `demo@servehub.com`   | `demo123`  | 3 addresses, 6 notifications, 1 ticket, 2 reviews, wallet, referrals |
| Customer | _(register your own)_ | —          | OTP via email / SMS / WhatsApp                                       |

## Ports

| Service      | URL                              | How to run          |
| ------------ | -------------------------------- | ------------------- |
| Frontend dev | http://localhost:5501            | `npm run dev:web`   |
| API + Mongo  | http://localhost:4000            | `npm run start:api` |
| Health check | http://localhost:4000/api/health | —                   |
