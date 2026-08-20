# Car Rental — Frontend (React + Vite)

The car rental landing page: hero, a filterable fleet listing with photos
and tiered pricing, a booking modal for full date+time range rentals with
live pricing, USP section, location/map, and footer. Talks to the
`backend/` API for everything — no fake/simulated data.

## Folder structure

```
frontend/
├── public/               # served as-is (favicon)
├── src/
│   ├── assets/           # imported/build-processed static files (see its README)
│   ├── components/       # reusable UI: Button, CarCard, ImageCarousel, FiltersBar, icons, page sections
│   ├── layout/            # Header, Footer
│   ├── pages/             # Home.jsx — assembles the whole page
│   ├── features/booking/  # the booking modal + its date/time range fields
│   ├── hooks/              # useCars, useBookedRanges, usePriceQuote
│   ├── context/            # BookingContext — which car's modal is open
│   ├── redux/              # not used yet — see its README for why
│   ├── services/           # fetch calls to the backend API
│   ├── utils/               # site content config, date/range helpers
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .eslintrc.json
├── package.json
└── vite.config.js
```

## Setup

```bash
cd frontend
npm install
npm run dev
```

Opens on **http://localhost:5173**. The backend must also be running (see
`backend/README.md`) or the car list will show a "couldn't reach the booking
server" message instead of cars.

`npm run build` produces a static `dist/` folder you can deploy anywhere
(Netlify, Vercel, S3, your own host's `public_html` — anywhere that serves
static files).

## The one file you'll edit most: `src/utils/siteConfig.js`

Business name, phone number, hours, address, social links, and the Google
Maps embed all live in this one file:

```js
export const siteConfig = {
  businessName: 'JAGO',
  phoneDisplay: '017-250 7341',
  phoneHref: 'tel:+60172507341',
  whatsappNumber: '60172507341',
  hours: 'Daily, 7:00am – 10:00pm',
  address: { line1: '...', line2: '...', line3: '...' },
  social: { facebook: '#', instagram: '#', tiktok: '#' },
  mapEmbedSrc: 'https://www.google.com/maps?q=...&output=embed',
};
```

Get your own map embed link: Google Maps → search your address → **Share →
Embed a map** → copy the `src="..."` URL.

**Important:** the WhatsApp number that actually builds the booking message
is set separately, in `backend/.env` (`WHATSAPP_NUMBER`) — the value here in
`siteConfig.js` is only for display (the "Call us" button, footer, nav bar).
Keep both in sync.

## Adding, removing, or repricing cars

Cars, their photos, and pricing aren't hardcoded in the frontend — manage
them through the admin app's Cars tab. `backend/data/cars.json` only seeds
the database the very first time it's empty; editing it afterward has no
effect.

## Why ESLint is pinned to v8, not the latest

This project intentionally uses the classic `.eslintrc.json` config format
(ESLint 8.x) rather than the newer flat-config `eslint.config.js` (default
since ESLint 9). Both work fine; this is simply a deliberate choice to match
a specific requested project structure. If you'd rather use the newer flat
config, `npm install eslint@latest` and replace `.eslintrc.json` with an
`eslint.config.js`.

## What's using Context, and what isn't using Redux

The only cross-component state right now is "which car's booking modal is
open," handled by `src/context/BookingContext.jsx`. `src/redux/` is kept as
a placeholder — see the README inside it for when it'd actually be worth
reaching for.
