# Car Rental Landing Page

A car rental booking site split into a `frontend/` (React + Vite) and a
`backend/` (Node.js + Express), following a standard clean/scalable project
structure for each. Real availability, real double-booking prevention, and a
booking flow that hands off to WhatsApp — no simulated/fake data anywhere.

```
car-rental-app/
├── frontend/    → React + Vite. See frontend/README.md
└── backend/     → Node.js + Express API. See backend/README.md
```

## Quick start

You need **two terminals** — the frontend and backend run as separate
processes and talk to each other over HTTP.

**Terminal 1 — backend:**
```bash
cd backend
npm install
npm run dev
```
Runs on http://localhost:4000

**Terminal 2 — frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173 — open this one in your browser.

Start the backend first. If you open the frontend before the backend is
running, the car listing shows a clear "couldn't reach the booking server"
message instead of failing silently — start the backend and refresh.

## How a booking actually flows

1. Frontend loads → fetches the real car list from `GET /api/cars`.
2. Customer clicks a car → picks a date → frontend fetches
   `GET /api/cars/:id/availability?date=...` → backend checks its own
   booking records and returns which hours are actually still open.
3. Customer picks an open slot, fills in name + phone, hits confirm →
   frontend sends `POST /api/bookings`.
4. Backend re-checks the slot is still free (handles two people racing for
   the same slot), saves the booking, and returns a `wa.me` link with the
   whole booking pre-filled as text.
5. Frontend opens that link — customer's WhatsApp opens with the message
   ready, they hit send, your business number receives it.

No paid WhatsApp Business API, no Meta approval process — just a
click-to-chat link, which is why the customer's own final tap is what
delivers the message.

## What to edit for your business

| What | Where |
|---|---|
| Business name, phone (display), hours, address, social links, map | `frontend/src/utils/siteConfig.js` |
| The WhatsApp number bookings actually get sent to | `backend/.env` → `WHATSAPP_NUMBER` |
| Cars, prices, seats, transmission | `backend/data/cars.json` |
| Operating hours used for slot generation | `backend/.env` → `OPEN_HOUR` / `CLOSE_HOUR` |

## Deploying

- **Frontend:** `npm run build` inside `frontend/` produces a static
  `dist/` folder — deploy it to Netlify, Vercel, or any static host.
- **Backend:** deploy `backend/` to any Node host (Railway, Render, a VPS,
  etc.) and set the same environment variables from `.env` in that host's
  dashboard.
- Once both are deployed, update `API_BASE_URL` in
  `frontend/src/services/api.js` to your backend's real URL, and
  `CORS_ORIGIN` in the backend's `.env` to your frontend's real URL.

## Both READMEs go deeper

- `frontend/README.md` — folder-by-folder structure, why Context and not
  Redux, why ESLint is pinned to v8.
- `backend/README.md` — every endpoint, environment variables, and the
  storage layer's known limitations at scale.
