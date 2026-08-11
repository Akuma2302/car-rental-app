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
| `BUSINESS_NAME` | Shown in the WhatsApp message | `JarGo` |
| `OPEN_HOUR` / `CLOSE_HOUR` | Daily operating hours (24h) | `7` / `22` |
| `CORS_ORIGIN` | Customer frontend's origin | `http://localhost:5173` |
| `ADMIN_CORS_ORIGIN` | Admin app's origin | `http://localhost:5174` |
| `FRONTEND_URL` | Customer frontend's URL — used to build the "resume your booking" link sent via WhatsApp | `http://localhost:5173` |
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
| POST | `/api/bookings` | Create a booking (always starts `pending`) → `{ booking, whatsappUrl }` |
| GET | `/api/bookings/:bookingId` | Look up a booking's current status (used by the resume flow) |
| POST | `/api/bookings/:bookingId/cancel` | Customer self-cancel — only works while still `pending` |
| POST | `/api/auth/login` | Admin login → `{ token, username }` |
| GET | `/api/health` | Health check |

**Admin-only** (require `Authorization: Bearer <token>` from login):
- `POST /api/admin/bookings/:bookingId/receipt` — upload the receipt the
  admin received from the customer over WhatsApp (multipart, field
  `receipt`) → flips the booking to `booked`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/cars` | Every car, including disabled/maintenance ones |
| GET | `/api/admin/bookings` | Every booking ever made, with car name joined in |
| GET | `/api/admin/dashboard` | Fleet overview, today's schedule, and performance KPIs |
| POST | `/api/admin/cars` | Create a car |
| PUT | `/api/admin/cars/:carId` | Update a car |
| DELETE | `/api/admin/cars/:carId` | Delete a car (cascades to its bookings/images) |
| PUT | `/api/admin/cars/:carId/condition` | Set condition — `in_service`/`maintenance`/`broken` (auto enables/disables the car) |
| PUT | `/api/admin/cars/:carId/active` | Manually enable/disable a car — blocked while condition isn't `in_service` |
| POST | `/api/admin/cars/:carId/images` | Upload 1–8 images (multipart, field name `images`) |
| DELETE | `/api/admin/cars/:carId/images/:imageId` | Delete one image |
| PUT | `/api/admin/cars/:carId/images/:imageId/cover` | Make an image the cover photo |
| PUT | `/api/admin/bookings/:bookingId/cancel` | Cancel a booking — frees its time range immediately |

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

## Car availability, condition, and cancellation

**Enable/disable + condition.** Every car has `isActive` (shown on the
public site or not) and `condition` (`in_service` / `maintenance` /
`broken`). The rule lives in `src/services/carService.js`:
- Setting condition to `maintenance` or `broken` automatically sets
  `isActive` to false — a car marked broken shouldn't be one manual step
  away from still being bookable.
- Setting condition back to `in_service` automatically sets `isActive`
  back to true, so it isn't left "back in service" but still hidden.
- The direct enable/disable toggle (`PUT /api/admin/cars/:carId/active`)
  only works while condition is `in_service` — you can't manually
  re-enable a car the business marked unsafe; clear its condition first.

`GET /api/cars` (public) only returns active cars. `GET /api/admin/cars`
(admin) returns everything, including disabled ones — otherwise a car
would vanish from the admin's own management screen the moment it needed
maintenance, which would make it unmanageable.

**Cancelling a booking** (`PUT /api/admin/bookings/:bookingId/cancel`,
admin-only) sets its status to `cancelled`. This isn't just a label change
— the database's exclusion constraint (`bookings_no_overlap_v2`) has a
`WHERE status <> 'cancelled'` clause, so a cancelled booking's time range
is immediately, atomically available to be booked by someone else again.
Cancelled bookings are also excluded from every revenue calculation, same
as pending ones.

## Recovering a pending booking

If a customer closes the tab before their booking is confirmed, nothing is
lost — the booking stays `pending` and there are two ways back to it:
- The WhatsApp message includes a link
  (`{FRONTEND_URL}/?booking={id}`) straight back to that booking's screen.
- The frontend also remembers the booking locally (`localStorage`), so
  simply returning to the site later shows a small banner offering to
  resume it — this works even without the link, as long as it's the same
  browser.

Both paths use `GET /api/bookings/:bookingId` to check the booking's
current status (in case it was already confirmed or cancelled elsewhere)
before deciding what to show. From that screen the customer can cancel
outright via `POST /api/bookings/:bookingId/cancel` — deliberately only
permitted while still `pending`; once payment is confirmed, cancelling
needs a human via the admin app, not a public endpoint. There's nothing
left for the customer to upload — the receipt goes to the admin over
WhatsApp, and the admin uploads it on the system.

There's a third path too, for the most common trip-up: if someone tries to
book the *same* car again while their own earlier booking on it is still
pending, they'd otherwise just hit a confusing overlap error. The frontend
recognizes this locally (same car ID as the one already remembered) and
offers a "Confirm booking" shortcut straight to their existing pending
booking instead of a dead-end error.

## Payment confirmation flow

A booking is never immediately "final." It starts `pending` the instant a
customer confirms via WhatsApp — that step only reserves the time range and
opens WhatsApp with the details, it doesn't mean payment happened. The
customer then sends their payment receipt to the business over WhatsApp,
and the **admin** uploads that receipt through
`POST /api/admin/bookings/:bookingId/receipt`, which is what actually
flips the booking to `booked`.

This endpoint requires admin login (`requireAdmin`) — the customer no
longer confirms their own booking. The endpoint rejects with 404/409 if the
booking doesn't exist or was already confirmed, so it can't be replayed or
misused. Receipts upload to the same Supabase Storage bucket as car images,
under a separate `receipts/` path.

If a booking is still `pending` about 4 hours after it was made, an AI
Agent notifies the admin over Telegram to confirm or cancel it, and
auto-cancels it if the admin doesn't respond — see the AI Agent section
below (once added) for setup.

**Worth knowing:** a `pending` booking still holds its time range for as
long as it stays pending, and there's still no *automatic* expiry — but the
customer can now free it themselves via the resume flow's cancel option (or
the admin can, via the Bookings tab), so a stuck slot no longer requires
someone editing the database directly to clear. If genuine no-shows (nobody
ever comes back to confirm or cancel) start tying up the calendar, an
automatic expiry/cleanup job for old unpaid pending bookings would be the
next step.

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
- The dashboard's KPIs (utilization, ADR, RevPAC) use a fixed rolling
  30-day window, and "today's schedule" uses server-local day boundaries —
  both inherit the same timezone caveat noted above for `OPEN_HOUR`/
  `CLOSE_HOUR`.

## AI Agent (Telegram)

If a booking sits `pending` for `AGENT_PENDING_HOURS` (default 4) without
the admin uploading a receipt, the agent messages the admin on Telegram
with **Confirm** / **Cancel** buttons. Tapping Confirm just leaves a note
that the receipt still needs uploading in the dashboard; tapping Cancel
cancels the booking immediately and frees the car's time range.

**One-time setup:**

1. **Create the bot.** Message [@BotFather](https://t.me/BotFather) on
   Telegram → `/newbot` → follow the prompts → copy the token it gives you
   into `TELEGRAM_BOT_TOKEN`.
2. **Get your chat ID.** Message
   [@userinfobot](https://t.me/userinfobot) → it replies with your numeric
   id → put that in `TELEGRAM_ADMIN_CHAT_ID`. (Then message your own new
   bot at least once — Telegram won't deliver messages to a chat that's
   never been opened.)
3. **Set the remaining env vars:** `TELEGRAM_WEBHOOK_SECRET` (any long
   random string, same way as `JWT_SECRET`) and `AGENT_SWEEP_SECRET`
   (another random string). Deploy the backend with all four set.
4. **Register the webhook** — run this once, pointing at your deployed
   backend:
   ```bash
   node scripts/registerTelegramWebhook.js https://your-backend.onrender.com
   ```
   Re-run it any time the backend's URL or `TELEGRAM_WEBHOOK_SECRET`
   changes.
5. **Schedule the sweep.** Render's free tier sleeps an idle service, so
   an in-process timer isn't reliable — instead, use a free external
   pinger like [cron-job.org](https://cron-job.org) to call this every
   ~15 minutes:
   ```
   POST https://your-backend.onrender.com/api/agent/sweep
   Header: X-Agent-Secret: <your AGENT_SWEEP_SECRET>
   ```

**Endpoints involved:**

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/agent/sweep` | Triggers a sweep for stale-pending bookings (needs `X-Agent-Secret` header) |
| POST | `/api/telegram/webhook` | Receives button taps from Telegram (needs a valid `secret_token`, set automatically by the registration script) |

A booking is only ever notified once (`agent_notified_at` guards this), and
a tap is only ever actioned once (`agent_decision` guards this) — retries
from either Telegram or the cron pinger are safe.
