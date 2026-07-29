# Car Rental Platform

Three pieces: a customer-facing booking site, an internal admin dashboard,
and the API + database both of them talk to.

```
car-rental-app/
├── frontend/    → React + Vite. Customer-facing site. See frontend/README.md
├── admin/       → React + Vite. Login-protected admin dashboard. See admin/README.md
└── backend/     → Node.js + Express + Postgres API. See backend/README.md
```

Real availability, a database-level guarantee against double-booking, admin
login with hashed passwords, and a booking flow that hands off to WhatsApp —
no simulated data, no fake admin auth.

## Quick start

Three terminals.

**Terminal 1 — backend** (needs a Postgres database first — see
`backend/README.md`):
```bash
cd backend
cp .env.example .env   # then fill in DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD
npm install
npm run dev
```
Runs on http://localhost:4000 — also creates your database tables and first
admin login automatically on first start.

**Terminal 2 — customer site:**
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173 — open this one to see the booking flow.

**Terminal 3 — admin dashboard:**
```bash
cd admin
npm install
npm run dev
```
Runs on http://localhost:5174 — log in with the `ADMIN_USERNAME` /
`ADMIN_PASSWORD` you set in `backend/.env`.

Start the backend first — both frontends show a clear error message instead
of failing silently if they can't reach it.

## How a booking actually flows

1. Customer site loads → fetches the real car list from `GET /api/cars`.
2. Customer clicks a car → picks a date → fetches
   `GET /api/cars/:id/availability?date=...` → backend checks the database
   and returns which hours are genuinely still open.
3. Customer picks a slot, fills in name + phone, confirms →
   `POST /api/bookings`. The database's own unique constraint guarantees
   the slot can't be double-booked, even if two people click at once.
4. Backend saves the booking and returns a `wa.me` link with the booking
   pre-filled as text; the customer's browser opens it, they hit send.
5. **The booking is now visible in the admin dashboard** — Bookings tab,
   searchable by customer name, phone, or car — the moment it's created.

## What to edit for your business

| What | Where |
|---|---|
| Business name, phone (display), hours, address, social links, map | `frontend/src/utils/siteConfig.js` |
| The WhatsApp number bookings actually get sent to | `backend/.env` → `WHATSAPP_NUMBER` |
| Cars, prices, seats, transmission | Admin app → Cars tab (not `cars.json` — that's a one-time seed only) |
| Operating hours used for slot generation | `backend/.env` → `OPEN_HOUR` / `CLOSE_HOUR` |
| Admin login | `backend/.env` → `ADMIN_USERNAME` / `ADMIN_PASSWORD` (first run only) |

## Deploying

See `DEPLOYMENT.md` — now covers the database and both frontends (customer
site + admin dashboard need two separate deployments).
