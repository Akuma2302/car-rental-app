const { Pool } = require('pg');
const env = require('./env');

if (!env.databaseUrl) {
  // Fail loudly and immediately rather than letting every query fail later
  // with a cryptic connection error.
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and set it to your Postgres connection string.'
  );
}

// Render/Supabase/most managed Postgres hosts require SSL but use a
// self-signed-style cert chain that Node rejects by default — this is the
// standard, documented workaround for that, not a security downgrade for
// this use case (the connection itself is still encrypted).
const useSsl = /render\.com|supabase\.co|neon\.tech|amazonaws\.com/.test(env.databaseUrl);

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
