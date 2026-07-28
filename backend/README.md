# Car Rental — Backend (Node.js / Express)

REST API that powers the car rental landing page: car listings, per-car
time-slot availability, and booking creation (with a WhatsApp confirmation
link built server-side).

## Folder structure

```
backend/
├── src/
│   ├── config/          # env loading — the only place that reads process.env
│   ├── controllers/     # HTTP layer — parses req, calls a service, sends res
│   ├── routes/          # URL → controller wiring
│   ├── services/        # business logic (availability math, booking rules)
│   ├── middlewares/     # error handler, 404 handler
│   ├── models/          # shape/schema documentation (no ORM in use)
│   ├── repositories/    # data access — currently JSON-file backed
│   ├── utils/           # asyncHandler, WhatsApp link builder
│   ├── validators/      # request payload validation
│   ├── app.js           # Express app: middleware + routes (no listen())
│   └── server.js        # entry point — imports app.js and starts listening
├── data/
│   ├── cars.json        # edit directly to add/remove/reprice cars
│   └── bookings.json    # grows as bookings come in
├── .env / .env.example
└── package.json
```

## Setup

```bash
cd backend
npm install
npm run dev
```

The API starts on **http://localhost:4000** (change with `PORT` in `.env`).
`npm run dev` uses nodemon (auto-restarts on file changes); `npm start` runs
it once, for production.

## Environment variables (`.env`)

| Key | Meaning | Default |
|---|---|---|
| `PORT` | API port | `4000` |
| `WHATSAPP_NUMBER` | Your WhatsApp number, country code first, digits only | `60172507341` |
| `BUSINESS_NAME` | Shown in the WhatsApp message | `JalanGo` |
| `OPEN_HOUR` / `CLOSE_HOUR` | Daily operating hours (24h) | `7` / `22` |
| `CORS_ORIGIN` | Frontend origin allowed to call this API | `http://localhost:5173` |

A working `.env` is already included so the API runs immediately. `.env` is
git-ignored — if you push this to your own repo, only `.env.example` (no real
secrets) gets committed.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/cars` | List all cars |
| GET | `/api/cars/:carId` | Get one car |
| GET | `/api/cars/:carId/availability?date=YYYY-MM-DD` | Open/booked time slots for that car and day |
| POST | `/api/bookings` | Create a booking → returns the booking + a ready-to-open WhatsApp link |
| GET | `/api/health` | Health check |

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
`409` if that exact slot was booked a moment earlier by someone else.

## Data

Cars live in `data/cars.json` — edit this file by hand to add, remove, or
reprice cars (no restart needed, it's read fresh on every request). Bookings
append to `data/bookings.json` automatically.

## Known limitations (by design, for a small-business launch)

- File-based storage is simple and dependency-free, but isn't built for high
  concurrent write volume. If bookings get busy, swap the repository layer
  (`src/repositories/`) for a real database client — services and
  controllers won't need to change.
- The slot-taken check happens at request time, not inside a database
  transaction, so two people booking the exact same slot in the same instant
  is a rare but real edge case.
- Operating-hour math runs on the server's clock. Fine for a single-location
  business in one timezone; worth revisiting if that ever changes.
