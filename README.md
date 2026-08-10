# Car Rental Platform

Three pieces: a customer-facing booking site, an internal admin dashboard,
and the API + database both of them talk to.

```
car-rental-app/
├── frontend/    → React + Vite. Customer-facing site. See frontend/README.md
├── admin/       → React + Vite. Login-protected admin dashboard. See admin/README.md
└── backend/     → Node.js + Express + Postgres API. See backend/README.md
```

Real availability, a database-level guarantee against double-booking (even
across overlapping multi-day rentals), filterable fleet browsing with
photos, tiered hourly/half-day/daily pricing, admin login with hashed
passwords, and a booking flow that hands off to WhatsApp — no simulated
data, no fake admin auth.

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

1. Customer site loads → fetches the real car list from `GET /api/cars`,
   with photos and specs. Filter by transmission, fuel type, seats,
   category, or price.
2. Customer clicks a car → picks a pick-up date/time and a return
   date/time (any duration — hours, a day, or a week) → the page fetches
   already-booked ranges for that car so obvious conflicts are flagged
   before submitting, and a live price quote as the dates change.
3. Customer fills in name + phone, confirms → `POST /api/bookings`. The
   database's own range-overlap constraint guarantees the car can't be
   double-booked for that period, even if two people submit at once. The
   booking is created with status **pending** — this reserves the slot and
   opens WhatsApp, but isn't final yet.
4. Backend computes the final price server-side (hourly/half-day/daily
   tier, based on duration), saves the booking, and returns a `wa.me` link
   with everything pre-filled; the customer's browser opens it, they hit
   send, and arranges payment with the business over WhatsApp.
5. The customer sends their payment receipt to the business over WhatsApp
   (not through the site). The admin uploads that receipt in the admin
   dashboard's Bookings tab → this flips the booking to status **booked**.
   This step is what actually confirms the booking, not the WhatsApp
   message itself.
6. **The booking is visible in the admin dashboard the whole time** — as
   soon as it's created (marked "Pending"), and updates once the admin
   uploads the receipt (marked "Booked", with a link to view the receipt).
7. If a booking sits **pending for about 4 hours**, an AI Agent notifies
   the admin (via Telegram) to confirm or cancel it — if the admin doesn't
   respond, it's cancelled automatically so the slot frees up. See
   `backend/README.md` for the agent setup.
8. The customer isn't left stuck either — if they close the tab before
   finishing on WhatsApp, the message includes a link straight back to
   that booking, and the site also remembers it locally so a banner offers
   to resume it on their next visit, from where they can cancel it
   themselves if they change their mind.

## What to edit for your business

| What | Where |
|---|---|
| Business name, phone (display), hours, address, social links, map | `frontend/src/utils/siteConfig.js` |
| The WhatsApp number bookings actually get sent to | `backend/.env` → `WHATSAPP_NUMBER` |
| Cars, prices (hourly/half-day/daily), specs, photos | Admin app → Cars tab (not `cars.json` — that's a one-time seed only) |
| Pricing-tier cutoffs (what counts as "half-day" vs "full day") | `backend/.env` → `HALF_DAY_THRESHOLD_HOURS` / `FULL_DAY_THRESHOLD_HOURS` |
| Counter hours shown in the pickup/return time picker | `frontend/src/utils/siteConfig.js` (display-only — see backend README's "Known limitations") |
| Admin login | `backend/.env` → `ADMIN_USERNAME` / `ADMIN_PASSWORD` (first run only) |
| Vehicle image storage | Supabase Storage — see `backend/SUPABASE_SETUP.md` |

## Deploying

See `DEPLOYMENT.md` — now covers the database and both frontends (customer
site + admin dashboard need two separate deployments).
