# Servehub API — backend

Express + **MongoDB (Mongoose)** REST API for the Servehub marketplace — with
**typed data models** for every entity and a **JSON file-store fallback** so the
whole stack still runs even if MongoDB isn't reachable (the API switches to
MongoDB automatically the moment it is).

## Quick start (VS Code)

1. Open the project folder in VS Code: **File → Open Folder** → select the
   `serve-hub-chan` folder (the one containing `backend/` and `frontend/`).
2. Install the recommended extensions when prompted (MongoDB for VS Code,
   Live Server, Prettier) — or search each in the Extensions panel.
3. Open the integrated terminal (**Ctrl+`**):

```bash
cd backend
npm install
cp .env.example .env     # optional — works with defaults too
npm start                # → http://localhost:4000
```

Or press **F5** with the *"Debug API (backend/server.js)"* configuration for
breakpoint debugging.

Verify: `curl http://localhost:4000/api/health`

```json
{ "ok": true, "service": "servehub-api", "db": "mongo" }
```

`db` reports `mongo` (connected) or `file` (fallback store).

## Data models (Mongoose)

All entities have typed schemas in **`src/models/`** — one file per model,
aggregated in `src/models/index.js`:

| Model | Purpose |
|-------|---------|
| `User` | customers / pros / admins — auth, wallet, reward points |
| `Professional` | KYC, uploaded documents, certificates, bank details, approval status |
| `Service` | catalogue item — pricing, duration, inclusions |
| `Category` | service buckets with icon/gradient/price |
| `Coupon` | promo codes (percent/flat, min amount, cap, validity) |
| `Booking` | full lifecycle `confirmed → … → rated` |
| `Review` | post-service ratings, images/videos, helpful votes |
| `Notification` | in-app/push/SMS/email notifications |
| `Address` | customer saved addresses with GPS |
| `WalletTransaction` | cashback / referral / refund / withdrawal ledger |
| `SupportTicket` | help-center tickets with message threads |
| `MembershipPlan` | Free / Plus / Pro subscription tiers |
| `GiftCard` | gift cards redeemed into wallet |
| `Referral` | referrer → referee reward tracking |
| `City` | serviceable cities + areas |
| `Counter` | auto-increment numeric ids |

## Database connection (MongoDB)

The connection lives in [`src/config/db.js`](src/config/db.js) — a fast liveness
probe with the official `mongodb` driver, then Mongoose connects to
`MONGODB_URI` (default `mongodb://127.0.0.1:27017`) into database `MONGODB_DB`
(default `servehub`). On first run the API seeds the catalogue
(services, professionals, coupons) **plus** a demo customer
(`demo@servehub.com` / `demo123`) with realistic per-user data — addresses,
notifications, wallet transactions, referrals, tickets and reviews — so every
dashboard section has content out of the box. All seeds are idempotent (fill
gaps only) and live in [`src/db/seed-data.js`](src/db/seed-data.js).

- **File fallback** — if MongoDB is unreachable, the API transparently switches
  to a JSON file store at `backend/data/store.json`.

Documents carry a numeric `id` field (bookings use `SH…` strings) alongside
Mongo's `_id`, so JWT payloads and booking references stay stable.

The repository layer ([`src/repo/index.js`](src/repo/index.js)) forwards every
data call to whichever backend is live — [`src/repo/mongo.js`](src/repo/mongo.js)
is the Mongoose-backed implementation, [`src/repo/file.js`](src/repo/file.js) is
the offline twin with the same interface.

### Send real OTPs by SMS & WhatsApp

1. Open **`backend/.env`** (already created from `.env.example`).
2. **SMS via Twilio** — from console.twilio.com → Account Info:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxx
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_FROM=+15005550006      # your SMS-enabled Twilio number (E.164)
   ```
3. **WhatsApp via Meta Cloud API** (preferred) — developers.facebook.com →
   WhatsApp app → API Setup:
   ```
   WHATSAPP_TOKEN=EAAG...permanent-token
   WHATSAPP_PHONE_ID=1234567890  # your business phone number ID
   ```
   No Meta credentials? Add a WhatsApp-enabled Twilio number
   (`TWILIO_WHATSAPP_FROM=whatsapp:+14155238886`) and Twilio delivers it.
4. Restart the API, then prove delivery:
   ```bash
   npm run notify:test sms +919876543210
   npm run notify:test whatsapp +919876543210
   npm run notify:test all +919876543210
   ```
   → real SMS / WhatsApp messages with an OTP. Without credentials it prints
   the demo message to the console instead.
5. **Register flow:** the signup OTP step now has an **SMS / WhatsApp toggle**
   that re-sends the code through the chosen channel and verifies it via the
   API (`/otp/request` + `/otp/verify`).

Rate limiting: one code per phone number every 15s, max 5 wrong attempts per
code, 10-minute expiry. In production set `OTP_BYPASS=false` so codes are
never returned in API responses.

### Send real OTP emails to a real account

1. Open **`backend/.env`** (already created from `.env.example`).
2. **Gmail example** — use an app password, not your normal password:
   - Enable 2-Step Verification: myaccount.google.com → Security.
   - Create an app password: Security → 2-Step Verification → *App passwords*
     → generate one for *Mail* (16 characters).
   - Set in `backend/.env`:
     ```
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=you@gmail.com
     SMTP_PASS=your-16-char-app-password
     ```
3. Restart the API: `npm run start:api` (or `cd backend && npm start`).
4. Prove delivery: `npm run mail:test you@example.com` → a real email with an
   OTP is sent to that inbox. Without credentials the script uses a free
   Ethereal test SMTP and prints a preview URL instead.
5. **Login with it:** open the site → **Log in → Email OTP** tab → enter your
   email → the 6-digit code arrives in your inbox → enter it → you're logged
   in (a new email auto-creates an account).

Other providers: Outlook `smtp.office365.com:587`, Zoho
`smtp.zoho.com:587`, Yahoo `smtp.mail.yahoo.com:465`.

In production, set `OTP_BYPASS=false` in `.env` so the code is never returned
in the API response. Without SMTP the server runs in **demo mode**: the OTP
is printed to the console and returned in the response instead of being
emailed. The SPA also falls back to local demo mode if the API is unreachable.

### Get MongoDB running (3 options)

- **Local install (easiest):** install "MongoDB Community Server" from
  mongodb.com — it auto-starts as a Windows service on `127.0.0.1:27017`.
- **Docker:** `docker run -d -p 27017:27017 --name servehub-mongo mongo`
- **MongoDB Atlas (free cloud):** create a free cluster, copy the connection
  string into `backend/.env`:
  ```
  MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
  ```

Then set `MONGODB_URI` in `backend/.env` (leave empty to use the local default)
and restart `npm start`.

## Demo accounts

| Role | Email | Password | Seeded data |
|---|---|---|---|
| Admin | `admin@servehub.com` | `admin123` | bootstrapped on first start |
| Customer | `demo@servehub.com` | `demo123` | 3 addresses, 6 notifications, 5 wallet txns, 3 referrals, 1 ticket, 2 reviews (ids 50xxx, fixed user id 9000) |

Demo-customer rows use collision-proof ids (50xxx) and user id 9000; new
registrations continue from counter 9001+.

| Role      | Email                 | Password  | Notes |
|-----------|-----------------------|-----------|-------|
| Admin     | `admin@servehub.com`  | `admin123`| bootstrapped automatically on first start |
| Customer  | *(register yourself)* | —         | OTP via email / SMS / WhatsApp |
| Pro       | *(register with role "professional")* | — | KYC + approval flow |

## API map

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/health` | — | Liveness + active storage backend |
| POST | `/api/auth/register` | — | Create account → JWT |
| POST | `/api/auth/login` | — | Email + password → JWT |
| POST | `/api/auth/otp/request` | — | OTP by **SMS or WhatsApp** (`channel: sms\|whatsapp`) — Twilio / Meta API when configured, demo fallback |
| POST | `/api/auth/otp/verify` | — | Verify OTP (phone or email) |
| POST | `/api/auth/otp/email` | — | Email a 6-digit login OTP (SMTP, or demo/console) |
| POST | `/api/auth/otp/login` | — | Passwordless login with emailed OTP (auto-creates account) |
| POST | `/api/auth/forgot-password` | — | Demo reset code |
| GET  | `/api/auth/me` | ✅ | Current session |
| GET  | `/api/services/categories` | — | Categories with counts |
| GET  | `/api/services?category=` | — | Services (filter by category) |
| GET  | `/api/services/:id` | — | Service detail + related + pros |
| GET  | `/api/professionals?serviceId=&city=` | — | Active professionals |
| GET  | `/api/professionals/:id` | — | Professional detail |
| POST | `/api/professionals/apply` | ✅ pro | Submit application (→ pending) |
| POST | `/api/bookings` | ✅ | Create booking (server-side pricing + coupon) |
| GET  | `/api/bookings` | ✅ | My bookings (admin: all) |
| GET  | `/api/bookings/:id` | ✅ | Booking detail |
| POST | `/api/bookings/:id/status` | ✅ | Advance lifecycle one step |
| POST | `/api/bookings/:id/cancel` | ✅ | Cancel booking |
| POST | `/api/bookings/:id/rate` | ✅ | Rate a paid booking |
| POST | `/api/payments/intent` | ✅ | Mock gateway order |
| POST | `/api/payments/verify` | ✅ | Mark booking paid |
| GET  | `/api/payments/wallet` | ✅ | Wallet + reward points |
| GET  | `/api/admin/stats` | ✅ admin | Dashboard KPIs |
| GET  | `/api/admin/bookings` | ✅ admin | All bookings |
| GET  | `/api/admin/users` | ✅ admin | All users |
| GET  | `/api/admin/professionals` | ✅ admin | All pros (incl. pending) |
| PATCH| `/api/admin/professionals/:id/approve` | ✅ admin | Approve / reject application |
| GET  | `/api/admin/reviews` | ✅ admin | All reviews (filter `?status=`) |
| PATCH| `/api/admin/reviews/:id` | ✅ admin | Review moderation (publish / hide) |
| DELETE| `/api/admin/reviews/:id` | ✅ admin | Permanently remove review |
| GET  | `/api/admin/coupons` | ✅ admin | All coupons |
| POST | `/api/admin/coupons` | ✅ admin | Create coupon |
| PATCH| `/api/admin/coupons/:code` | ✅ admin | Update / toggle coupon |
| DELETE| `/api/admin/coupons/:code` | ✅ admin | Delete coupon |
| GET  | `/api/admin/giftcards` | ✅ admin | All gift cards |
| POST | `/api/admin/giftcards` | ✅ admin | Create gift card (`{ value }`) |
| PATCH| `/api/admin/giftcards/:id` | ✅ admin | Expire / reactivate gift card |
| DELETE| `/api/admin/giftcards/:id` | ✅ admin | Delete gift card |
| GET  | `/api/admin/plans` | ✅ admin | Membership plans |
| PATCH| `/api/admin/plans/:id` | ✅ admin | Edit plan (price / perks / featured) |
| GET  | `/api/admin/tickets` | ✅ admin | Support ticket inbox (filter `?status=`) |
| GET  | `/api/admin/tickets/:id` | ✅ admin | Ticket thread |
| POST | `/api/admin/tickets/:id/reply` | ✅ admin | Admin reply (→ in-progress) |
| PATCH| `/api/admin/tickets/:id` | ✅ admin | Update ticket status / priority |

### Customer (logged-in)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/reviews` | ✅ user | Submit a review for a completed booking (1 per booking) |
| GET  | `/api/reviews/mine` | ✅ user | My reviews |
| GET  | `/api/addresses` | ✅ user | My saved addresses |
| POST | `/api/addresses` | ✅ user | Add address (`isDefault` clears other defaults) |
| PATCH| `/api/addresses/:id` | ✅ user | Edit address / set default |
| DELETE| `/api/addresses/:id` | ✅ user | Remove address |
| GET  | `/api/tickets` | ✅ user | My support tickets |
| POST | `/api/tickets` | ✅ user | Create ticket `{ category, subject, text }` |
| GET  | `/api/tickets/:id` | ✅ user | My ticket thread |
| POST | `/api/tickets/:id/reply` | ✅ user | Reply to my ticket |
| GET  | `/api/notifications` | ✅ user | My notifications + unread count |
| POST | `/api/notifications/read-all` | ✅ user | Mark all read |
| PATCH| `/api/notifications/:id/read` | ✅ user | Mark one read |
| DELETE| `/api/notifications/:id` | ✅ user | Delete notification |

Admin replies to a ticket auto-create an in-app notification for the customer.

### Booking lifecycle

`confirmed → assigned → arriving → started → completed → paid → rated`
(+ `cancelled` / `rejected`). Advancing to `completed` credits 10 reward points
and 10% wallet cashback; rating 4★+ credits 15 points.

## Project structure

```
backend/
├── server.js              # Express app, routing, error handling
├── .env.example           # copy to .env
├── src/
│   ├── config/db.js       # MongoDB connection (driver probe + Mongoose) + mode switch
│   ├── db/
│   │   └── seed-data.js   # shared seed data (services/pros/coupons)
│   ├── models/            # ⭐ Mongoose models — one file per entity (User, Booking,
│   │                      #    Professional, Service, Category, Coupon, Review, …)
│   ├── repo/
│   │   ├── index.js       # dispatcher (mongo ↔ file)
│   │   ├── mongo.js       # MongoDB implementation (uses the models)
│   │   └── file.js        # JSON-store fallback
│   ├── middleware/
│   │   ├── auth.js        # JWT sign / verify / role guard
│   │   └── async.js       # async error wrapper
│   └── routes/            # auth, services, professionals, bookings, payments, admin
└── data/                  # created at runtime (file-store mode, gitignored)
```

## Production notes

- Replace the mock payment endpoints with Stripe / Razorpay server SDKs.
- OTP delivery already supports real SMTP email, Twilio SMS and WhatsApp
  (Meta Cloud API or Twilio) — fill the credentials in `backend/.env`.
- Move the JWT secret into a secrets manager; add HTTPS and stricter rate
  limiting.
