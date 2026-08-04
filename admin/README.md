# Car Rental — Admin App (React + Vite)

An internal, login-protected dashboard for viewing bookings and managing the
car fleet. Separate from `frontend/` (the public site) on purpose — it talks
to the same `backend/` API, just through admin-only, authenticated routes.

## Setup

```bash
cd admin
npm install
npm run dev
```

Opens on **http://localhost:5174** (the customer site runs on 5173, so both
can run side by side). Requires the backend running with at least one admin
account — see "First login" below.

## First login

The backend creates one admin account automatically on its very first
startup, from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `backend/.env`. Log in
with those values. There's currently no "create additional admin users" UI —
for a single small-business owner that's normally enough; if you need more
than one admin login, insert a row into the `admin_users` table directly
(password must be a bcrypt hash).

## What it does

- **Dashboard tab:** fleet status breakdown (rented, available, in
  maintenance, reserved/upcoming), this week's activity (bookings, awaiting
  payment, confirmed revenue), performance KPIs over the last 30 days
  (utilization rate, average daily rate, RevPAC, average idle time between
  bookings), today's pick-ups and drop-offs, overdue returns, currently-out
  rentals, and a status chip per car.
- **Bookings tab:** every booking ever made, sorted by when it was booked
  (newest first) by default, with pick-up/return date-times, duration,
  status (Pending/Booked/Cancelled), and total price. Search by customer
  name, phone, or car; filter by status, specific car, rental duration
  (under 1 day / 1–3 days / 3–7 days / 7+ days), booked-on date range, and
  pick-up date range — mix and match, "Clear filters" resets them all. A
  "View" link opens the uploaded payment receipt. A "Cancel" button frees
  the booking's date range immediately and excludes it from revenue.
- **Cars tab:** add, edit, or delete cars — including transmission, fuel
  type, category, seats, and three pricing tiers (hourly/half-day/daily).
  Upload up to 8 photos per car (JPEG/PNG/WebP, 8MB each) and pick which one
  is the cover photo; more than one photo automatically becomes a carousel
  on the public site. Each car also has a **Listed/Hidden** toggle and a
  **condition** dropdown (In service/Maintenance/Broken) — marking a car
  Maintenance or Broken automatically hides it from the public site and
  locks the toggle until it's back In service. Changes show up on the
  public site immediately (both apps read from the same tables). Photo
  uploads need Supabase Storage configured on the backend first — see
  `backend/SUPABASE_SETUP.md`.

## How auth works

Login (`POST /api/auth/login`) returns a JWT, stored in the browser's
`localStorage` so refreshing the page doesn't log you out. Every admin
request sends it as `Authorization: Bearer <token>`. Tokens expire after 12
hours — after that, or if the token is otherwise invalid, the app logs you
out automatically on the next request.

This is intentionally simple (one shared admin login, `localStorage` token)
rather than a full multi-user permission system — appropriate for a single
business owner checking their own bookings, not something exposing this to
many separate staff accounts with different access levels.

## Deploying

Same shape as `frontend/`: `npm run build` → static `dist/` folder → deploy
to Netlify/Vercel, with `VITE_API_URL` set to your deployed backend's URL.
Use a **different** site/project than the customer frontend (two separate
deployments), and set `ADMIN_CORS_ORIGIN` on the backend to this app's real
URL once deployed.

Consider putting this on a non-obvious subdomain (e.g.
`admin.yourbusiness.com` rather than something guessable) since it's meant
for you, not the public — the login screen is the real protection, but
there's no reason to advertise it either.
