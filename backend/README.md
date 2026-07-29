# Car Rental — Backend (Node.js / Express / Postgres)

REST API powering both the customer-facing site and the admin app: car
listings, real per-car time-slot availability, booking creation (with a
WhatsApp confirmation link built server-side), admin login, and admin
booking/car management. Backed by a real Postgres database — no file-based
storage, no simulated data.

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
Supabase, or Neon. Copy its connection string.

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

## Endpoints

**Public:**

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/cars` | List all cars |
| GET | `/api/cars/:carId` | Get one car |
| GET | `/api/cars/:carId/availability?date=YYYY-MM-DD` | Open/booked time slots |
| POST | `/api/bookings` | Create a booking → `{ booking, whatsappUrl }` |
| POST | `/api/auth/login` | Admin login → `{ token, username }` |
| GET | `/api/health` | Health check |

**Admin-only** (require `Authorization: Bearer <token>` from login):

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/bookings` | Every booking ever made, with car name joined in |
| POST | `/api/admin/cars` | Create a car |
| PUT | `/api/admin/cars/:carId` | Update a car |
| DELETE | `/api/admin/cars/:carId` | Delete a car |

`POST /api/bookings` body:
```json
{
  "carId": "myvi",
  "date": "2026-08-01",
  "time": "10:00",
  "customerName": "Aiman Hakim",
  "customerPhone": "012-345 6789"
}
```
Returns `201` with `{ booking, whatsappUrl }`, `400` for invalid input, or
`409` if that exact slot was booked a moment earlier — enforced by a real
Postgres `UNIQUE(car_id, date, time)` constraint, not just an application
check, so this holds true even under concurrent requests.

## Data

Cars and bookings live in Postgres now — `data/cars.json` is only read once,
to seed the table when it's empty. After that, add/edit/remove cars through
the admin app; editing the JSON file has no effect anymore.

## Security notes

- Passwords are hashed with bcrypt before being stored — never stored or
  returned in plain text.
- Admin sessions are JWTs valid for 12 hours; `requireAdmin` middleware
  checks every admin route.
- CORS only allows the two configured origins (`CORS_ORIGIN`,
  `ADMIN_CORS_ORIGIN`) — everything else is rejected with a 403.
