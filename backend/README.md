# Car Rental — Backend (Node.js / Express / Postgres)

REST API powering both the customer-facing site and the admin app: filterable
car listings with images, full date+time range booking with tiered pricing,
a fleet-wide admin dashboard, and image uploads via Supabase Storage. Backed
by a real Postgres database — no file-based storage, no simulated data.

## Folder structure

```
backend/
├── src/
│   ├── config/          # env loading, Postgres pool, schema + seed migration
│   ├── controllers/     # HTTP layer — parses req, calls a service, sends res
│   ├── routes/          # URL → controller wiring (public + admin-only)
│   ├── services/        # business logic (availability math, booking rules, auth)
│   ├── middlewares/     # error handler, 404 handler, requireAdmin (JWT check)
│   ├── models/          # shape/schema documentation
│   ├── repositories/    # data access — Postgres queries live here
│   ├── utils/           # asyncHandler, WhatsApp link builder
│   ├── validators/      # request payload validation
│   ├── app.js           # Express app: middleware + routes (no listen())
│   └── server.js        # entry point — runs migrations, then starts listening
├── data/
│   └── cars.json        # ONLY used to seed the cars table the very first
│                         # time it's empty — after that, manage cars via the
│                         # admin app, editing this file has no further effect
├── .env / .env.example
└── package.json
```

## Setup

**1. Get a Postgres database.** Free options: Render (New → PostgreSQL),
Supabase, or Neon. Copy its connection string. Using Supabase specifically?
See `SUPABASE_SETUP.md` in this folder — one connection-string detail trips
people up (which one to copy) and it's worth doing right the first time.

**2. Configure:**
```bash
cd backend
cp .env.example .env
```
Fill in `.env`:
- `DATABASE_URL` — your Postgres connection string
- `JWT_SECRET` — any long random string, e.g.
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — your admin login (used once, to
  create the first account — see below)

**3. Run:**
```bash
npm install
npm run dev
```

On first startup, the server automatically creates the `cars`, `bookings`,
and `admin_users` tables, seeds cars from `data/cars.json`, and creates one
admin account from `ADMIN_USERNAME`/`ADMIN_PASSWORD`. Subsequent restarts
skip all of this (tables already exist, admin account already exists).

The API starts on **http://localhost:4000** (change with `PORT`).

## Environment variables (`.env`)

| Key | Meaning | Default |
|---|---|---|
| `PORT` | API port | `4000` |
| `DATABASE_URL` | Postgres connection string | *(required, no default)* |
| `JWT_SECRET` | Signs admin login sessions | *(required, no default)* |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Bootstraps the first admin account | `admin` / *(required first run)* |
| `WHATSAPP_NUMBER` | Your WhatsApp number, country code first, digits only | `60172507341` |
| `BUSINESS_NAME` | Shown in the WhatsApp message | `JalanGo` |
| `OPEN_HOUR` / `CLOSE_HOUR` | Daily operating hours (24h) | `7` / `22` |
| `CORS_ORIGIN` | Customer frontend's origin | `http://localhost:5173` |
| `ADMIN_CORS_ORIGIN` | Admin app's origin | `http://localhost:5174` |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | For vehicle image uploads — see `SUPABASE_SETUP.md` | *(required for image uploads only)* |
| `STORAGE_BUCKET` | Supabase Storage bucket name for images | `car-images` |
| `HALF_DAY_THRESHOLD_HOURS` / `FULL_DAY_THRESHOLD_HOURS` | Pricing tier cutoffs, in hours | `12` / `24` |

## Endpoints

**Public:**

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/cars` | List all cars, with images |
| GET | `/api/cars/:carId` | Get one car |
| GET | `/api/cars/:carId/booked-ranges?from=...&to=...` | Already-booked date/time ranges (no customer info) |
| GET | `/api/cars/:carId/price-quote?startAt=...&endAt=...` | Live price + duration for a proposed booking |
| POST | `/api/bookings` | Create a booking → `{ booking, whatsappUrl }` |
| POST | `/api/auth/login` | Admin login → `{ token, username }` |
| GET | `/api/health` | Health check |

**Admin-only** (require `Authorization: Bearer <token>` from login):

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/bookings` | Every booking ever made, with car name joined in |
| GET | `/api/admin/dashboard` | Fleet overview — counts, currently-active rentals, this-week revenue |
| POST | `/api/admin/cars` | Create a car |
| PUT | `/api/admin/cars/:carId` | Update a car |
| DELETE | `/api/admin/cars/:carId` | Delete a car (cascades to its bookings/images) |
| POST | `/api/admin/cars/:carId/images` | Upload 1–8 images (multipart, field name `images`) |
| DELETE | `/api/admin/cars/:carId/images/:imageId` | Delete one image |
| PUT | `/api/admin/cars/:carId/images/:imageId/cover` | Make an image the cover photo |

`POST /api/bookings` body:
```json
{
  "carId": "myvi",
  "startAt": "2026-08-01T09:00:00.000Z",
  "endAt": "2026-08-03T09:00:00.000Z",
  "customerName": "Aiman Hakim",
  "customerPhone": "012-345 6789"
}
```
Returns `201` with `{ booking, whatsappUrl }` (the booking includes a
server-computed `totalPrice`), `400` for invalid input, or `409` if that
range overlaps an existing booking — enforced by a real Postgres `EXCLUDE`
constraint over the date range, not just an application check, so this
holds true even under concurrent requests and for arbitrary-length rentals
(hours to weeks), not just fixed slots.

## Pricing

Three tiers per car (`pricePerHour`, `pricePerHalfDay`, `pricePerDay`).
`src/services/pricingService.js` picks one based on the requested duration:
under `HALF_DAY_THRESHOLD_HOURS` (default 12) charges hourly × hours
rounded up; under `FULL_DAY_THRESHOLD_HOURS` (default 24) charges a flat
half-day rate; at or above charges the daily rate × number of days rounded
up. Both thresholds are configurable in `.env`.

## Data

Cars and bookings live in Postgres — `data/cars.json` is only read once, to
seed the table when it's empty. After that, add/edit/remove cars through
the admin app; editing the JSON file has no effect anymore. Vehicle photos
live in Supabase Storage, referenced by URL in the `car_images` table.

Every migration in `src/config/migrate.js` is safe to run against an
already-deployed database with older data — it upgrades in place (adding
columns, backfilling reasonable defaults for anything new) rather than
assuming a fresh install. This runs automatically on every server start.

## Security notes

- Passwords are hashed with bcrypt before being stored — never stored or
  returned in plain text.
- Admin sessions are JWTs valid for 12 hours; `requireAdmin` middleware
  checks every admin route.
- CORS only allows the two configured origins (`CORS_ORIGIN`,
  `ADMIN_CORS_ORIGIN`) — everything else is rejected with a 403.

## Known limitations (by design, for a small-business launch)

- `OPEN_HOUR`/`CLOSE_HOUR` are **not enforced server-side**. The frontend's
  pickup/return time picker only offers hours within that range, but the
  API itself will accept a booking at any hour if sent directly. Correctly
  enforcing this server-side would need the business's actual timezone
  configured — comparing a UTC timestamp's raw hour against "7am" is wrong
  once the server and the business aren't in the same timezone, which is
  the normal case here (Render's servers aren't in Malaysia). Left out
  rather than shipped subtly incorrect; a reasonable next addition once
  timezone handling is added.
- The same `OPEN_HOUR`/`CLOSE_HOUR` values also live in
  `frontend/src/utils/siteConfig.js` as a separate setting — the two must
  be kept in sync by hand.
- Deleting a car cascades to delete its bookings and image records (not
  just orphan them) — intentional for a small fleet, but worth knowing
  before deleting a car with booking history you want to keep.
