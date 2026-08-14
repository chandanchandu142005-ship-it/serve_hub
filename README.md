# Servehub 🛠️

A premium home-services marketplace — **frontend** and **backend** split into
two folders, ready to open in **VS Code** and run.

The main project folder is **`serve hub`** (you may see the folder name you
created on disk, e.g. `serve hub chan` — that is the same project; rename it to
`serve hub` anytime in Explorer, nothing in the code depends on the folder name).

## 🗂️ Where is everything?

> **Start here: [`docs/PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md)** — a
> full annotated map of every file (frontend + backend), the data flow, ports
> and demo accounts.

Quick overview:

```
serve hub/
├── frontend/            # SPA (vanilla JS + CSS, npm project with dev server)
│   ├── index.html       # entry
│   ├── css/styles.css   # design system
│   ├── js/              # data, store, ui, app + pages/ (public, auth, booking,
│   │                    # customer, professional, admin)
│   ├── package.json     # npm run dev → serve on :5501 (Live-Server style)
│   └── servehub.html    # 🔨 BUILD ARTIFACT — the whole app in one file
├── backend/             # Express + MongoDB (Mongoose) REST API — see backend/README.md
│   ├── server.js
│   └── src/
│       ├── models/      # ⭐ Mongoose models — all entities (User, Booking, Pro, …)
│       ├── config/      # db connection (driver probe + Mongoose, file fallback)
│       ├── repo/        # mongo (models) ↔ file (JSON) dispatcher
│       ├── middleware/  # JWT auth, role guards
│       ├── services/    # mailer + notifier (email/SMS/WhatsApp OTP)
│       └── routes/      # auth, services, professionals, bookings, payments, customer, admin
├── docs/                # PROJECT-STRUCTURE.md + project notes
├── scripts/bundle.js    # rebuilds frontend/servehub.html
├── .vscode/             # extensions, launch (F5 debug), tasks
└── package.json         # convenience scripts (install:all, build, dev:api, dev:web)
```

## Open in VS Code

1. **VS Code → File → Open Folder…** → select the `serve-hub-chan` folder.
2. Install the recommended extensions (MongoDB for VS Code, Live Server,
   Prettier) — VS Code prompts you automatically.
3. Open the integrated terminal (**Ctrl + `**).

### Install everything (frontend + backend)

```bash
npm run install:all     # installs BOTH backend and frontend deps
```

### Run the backend (API + MongoDB)

```bash
cd backend && npm start       # → http://localhost:4000
```

- **No MongoDB installed?** It still works — the API auto-falls back to a JSON
  file store (`backend/data/store.json`) until MongoDB is reachable.
- **With MongoDB:** install MongoDB Community Server (auto-starts as a Windows
  service), or set `MONGODB_URI` in `backend/.env` (copy from
  `backend/.env.example`) for Atlas.
- Demo accounts:
  - **Admin:** `admin@servehub.com` / `admin123` (24-section admin panel)
  - **Customer:** `demo@servehub.com` / `demo123` (seeded with addresses,
    notifications, tickets, reviews, wallet & referrals so every dashboard
    section has content)
- For breakpoint debugging: press **F5** (config `Debug API`).
- Full API map & DB docs: **[backend/README.md](backend/README.md)**.

### Run the frontend

Two options:

1. **Open the single-file build** — `frontend/servehub.html` (the whole app in
   one file). In VS Code, right-click → **"Open with Live Server"**.
2. **npm dev server** (Live-Server style, works on laptop + phone on the same
   Wi-Fi):
   ```bash
   cd frontend && npm start      # → http://localhost:5501 (serves frontend/)
   ```

Rebuild the single file after editing source:

```bash
npm run build           # node scripts/bundle.js → frontend/servehub.html
```

## Data models

Every entity in the marketplace has a typed Mongoose schema in
[`backend/src/models/`](backend/src/models/): `User`, `Professional` (KYC /
documents / bank details), `Service`, `Category`, `Coupon`, `Booking`,
`Review`, `Notification`, `Address`, `WalletTransaction`, `SupportTicket`,
`MembershipPlan`, `GiftCard`, `Referral`, `City` and `Counter` (auto-increment
ids). The MongoDB repository uses them directly; the offline JSON store mirrors
the same document shapes.

## Features

Landing & catalogue · search · multi-step booking flow · live tracking · chat /
calls · wallet & coupons · reward points · customer dashboard (14 sections) ·
professional dashboard (jobs, income, analytics) · admin panel (24 sections,
live monitor, approvals, analytics) · **email-OTP passwordless login** ·
**OTP by SMS & WhatsApp** (Twilio / Meta API with demo fallback) ·
**responsive AI chatbot (Nova)** · register → OTP → email verification ·
dark mode · fully responsive (laptop + mobile) · **installable app (PWA)** —
add Servehub to your phone home screen or laptop with one tap
(`frontend/manifest.webmanifest` + `frontend/sw.js` + generated icons in
`frontend/icons/`, offline-capable) · **Android APK download** — landing
“Get it on Android” → QR/APK modal; build the real APK with
`npm run build:apk` (Bubblewrap, see `android/README.md`) or package it
online with PWABuilder; the APK is served at `/servehub.apk`.

## Stack

- **Frontend:** HTML/CSS/JS SPA (bundle script for a single file)
- **Backend:** Node.js · Express · MongoDB (Mongoose models) · JWT · bcrypt · nodemailer
- **Storage:** MongoDB (`servehub` database), with JSON-file demo fallback
- **Payments / OTP:** mock payments, ready to wire to Stripe/Razorpay; real OTP
  delivery via SMTP email, Twilio SMS and WhatsApp (Meta Cloud API)
