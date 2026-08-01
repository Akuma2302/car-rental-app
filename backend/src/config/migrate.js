const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const env = require('./env');

// Idempotent by design: every statement is safe to run against either a
// brand new database OR one that already has the older schema (e.g. an
// already-deployed instance being upgraded to this version). Nothing here
// assumes a fresh install.
const SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS cars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  seats INTEGER NOT NULL,
  transmission TEXT NOT NULL,
  price_per_day INTEGER NOT NULL,
  accent TEXT NOT NULL DEFAULT 'amber',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- New vehicle-detail columns (fleet filters/display feature).
ALTER TABLE cars ADD COLUMN IF NOT EXISTS fuel_type TEXT NOT NULL DEFAULT 'Petrol';
ALTER TABLE cars ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Sedan';
ALTER TABLE cars ADD COLUMN IF NOT EXISTS price_per_hour INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS price_per_half_day INTEGER NOT NULL DEFAULT 0;

-- Enable/disable + condition. A car in maintenance/broken condition is
-- automatically taken off the public site (is_active forced false) — see
-- services/carService.js, which is where that rule actually lives; the
-- database just stores the resulting values.
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'in_service';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cars_condition_check') THEN
    ALTER TABLE cars ADD CONSTRAINT cars_condition_check
      CHECK (condition IN ('in_service', 'maintenance', 'broken'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS car_images (
  id SERIAL PRIMARY KEY,
  car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings: base table, in case this is a fresh install.
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings: add the new range columns (nullable for now — backfilled below
-- if this is an upgrade from the old single-slot schema).
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price INTEGER NOT NULL DEFAULT 0;

-- Upgrade path: the old schema stored a single 1-hour slot as (date, time).
-- If those columns are still present, turn each existing row into an
-- equivalent 1-hour range, then drop the old columns and constraint.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'date'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'time'
  ) THEN
    UPDATE bookings
    SET start_at = (date::text || ' ' || time)::timestamptz,
        end_at = (date::text || ' ' || time)::timestamptz + interval '1 hour'
    WHERE start_at IS NULL;

    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_car_id_date_time_key;
    ALTER TABLE bookings DROP COLUMN IF EXISTS date;
    ALTER TABLE bookings DROP COLUMN IF EXISTS time;
  END IF;
END $$;

ALTER TABLE bookings ALTER COLUMN start_at SET NOT NULL;
ALTER TABLE bookings ALTER COLUMN end_at SET NOT NULL;

-- bookings_valid_range: a booking's end must be after its start.
-- (The overlap-prevention constraint itself is created further down as
-- bookings_no_overlap_v2, which needs the "cancelled bookings don't hold
-- their slot" WHERE clause — see that block for why it isn't created here.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_valid_range') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_valid_range CHECK (end_at > start_at);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment confirmation flow: a booking starts "pending" the moment the
-- customer confirms via WhatsApp, and only becomes "booked" once they
-- upload a payment receipt. Pre-existing bookings (made before this
-- feature existed) never went through that step — backfill them straight
-- to "booked" rather than retroactively flagging old, already-settled
-- bookings as needing payment.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
    UPDATE bookings SET status = 'booked';
  END IF;
END $$;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS receipt_storage_path TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Versioned constraint names (_v2) so this block only runs once, rather
-- than dropping and rebuilding the exclusion index on every server start.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_status_check_v2') THEN
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
    ALTER TABLE bookings ADD CONSTRAINT bookings_status_check_v2
      CHECK (status IN ('pending', 'booked', 'cancelled'));
  END IF;

  -- A cancelled booking no longer holds its time range — the exclusion
  -- constraint only applies to pending/booked rows, so cancelling a
  -- booking genuinely frees that slot for someone else, atomically.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_no_overlap_v2') THEN
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;
    ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap_v2
      EXCLUDE USING gist (car_id WITH =, tstzrange(start_at, end_at) WITH &&)
      WHERE (status <> 'cancelled');
  END IF;
END $$;
`;

async function seedCarsIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM cars');
  if (rows[0].count > 0) return;

  const seedPath = path.join(__dirname, '..', '..', 'data', 'cars.json');
  if (!fs.existsSync(seedPath)) return;

  const cars = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  for (const car of cars) {
    await pool.query(
      `INSERT INTO cars (id, name, tagline, seats, transmission, price_per_day, price_per_hour, price_per_half_day, fuel_type, category, accent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING`,
      [
        car.id,
        car.name,
        car.tagline,
        car.seats,
        car.transmission,
        car.pricePerDay,
        car.pricePerHour ?? Math.round(car.pricePerDay / 8),
        car.pricePerHalfDay ?? Math.round(car.pricePerDay * 0.6),
        car.fuelType || 'Petrol',
        car.category || 'Sedan',
        car.accent,
      ]
    );
  }
  console.log(`Seeded ${cars.length} car(s) from data/cars.json`);
}

/**
 * Existing cars from before this feature (upgraded databases) get the new
 * price_per_hour/price_per_half_day columns via ALTER TABLE ... DEFAULT 0.
 * A real car renting for RM0/hour would break the pricing calculation, so
 * backfill a reasonable estimate once — anything already set to a real
 * value (non-zero) is left untouched.
 */
async function backfillMissingTierPricing() {
  const { rowCount } = await pool.query(`
    UPDATE cars
    SET price_per_hour = GREATEST(1, ROUND(price_per_day / 8.0)),
        price_per_half_day = GREATEST(1, ROUND(price_per_day * 0.6))
    WHERE price_per_hour = 0 AND price_per_day > 0
  `);
  if (rowCount > 0) {
    console.log(
      `Backfilled hourly/half-day pricing for ${rowCount} existing car(s) — review these in the admin app.`
    );
  }
}

async function seedAdminIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM admin_users');
  if (rows[0].count > 0) return;

  if (!env.adminPassword) {
    console.warn(
      'No admin_users exist and ADMIN_PASSWORD is not set — skipping admin bootstrap. ' +
        'Set ADMIN_USERNAME and ADMIN_PASSWORD in .env, then restart the server.'
    );
    return;
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  await pool.query(
    `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO NOTHING`,
    [env.adminUsername, passwordHash]
  );
  console.log(`Created initial admin account "${env.adminUsername}" from .env`);
}

async function migrate() {
  await pool.query(SCHEMA_SQL);
  await seedCarsIfEmpty();
  await backfillMissingTierPricing();
  await seedAdminIfEmpty();
}

module.exports = migrate;
