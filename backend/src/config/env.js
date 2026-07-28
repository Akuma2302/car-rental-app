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
};

module.exports = env;
