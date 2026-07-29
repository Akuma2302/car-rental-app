// quiet: true suppresses dotenv's console "tips" (unrelated promo messages
// it prints on load by default) so server logs stay clean.
require('dotenv').config({ quiet: true });

// Central place every other file reads configuration from.
// Nothing outside config/ should touch process.env directly.
const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  whatsappNumber: process.env.WHATSAPP_NUMBER || '60172507341',
  businessName: process.env.BUSINESS_NAME || 'JalanGo',
  openHour: parseInt(process.env.OPEN_HOUR || '7', 10),
  closeHour: parseInt(process.env.CLOSE_HOUR || '22', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  adminCorsOrigin: process.env.ADMIN_CORS_ORIGIN || 'http://localhost:5174',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  // Bootstrap credentials — used once, to create the first admin account if
  // the admin_users table is empty. Change the password after first login.
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || '',
};

module.exports = env;
