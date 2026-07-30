const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

let client = null;

/**
 * Lazily created — image upload routes need this, but the rest of the app
 * (Postgres, auth, bookings) doesn't, so a missing Storage config shouldn't
 * block the whole server from starting.
 */
function getStorageClient() {
  if (client) return client;

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    const err = new Error(
      'Image upload is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.'
    );
    err.status = 500;
    throw err;
  }

  client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
  return client;
}

module.exports = getStorageClient;
