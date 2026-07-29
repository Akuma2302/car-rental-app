const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const env = require('./env');

const SCHEMA_SQL = `
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

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (car_id, date, time)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

async function seedCarsIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM cars');
  if (rows[0].count > 0) return;

  const seedPath = path.join(__dirname, '..', '..', 'data', 'cars.json');
  if (!fs.existsSync(seedPath)) return;

  const cars = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  for (const car of cars) {
    await pool.query(
      `INSERT INTO cars (id, name, tagline, seats, transmission, price_per_day, accent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [car.id, car.name, car.tagline, car.seats, car.transmission, car.pricePerDay, car.accent]
    );
  }
  console.log(`Seeded ${cars.length} car(s) from data/cars.json`);
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
  await seedAdminIfEmpty();
}

module.exports = migrate;
