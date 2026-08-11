const env = require('../config/env');

/**
 * Guards POST /api/telegram/webhook. Telegram sends this header on every
 * webhook call once a secret_token was set via setWebhook (see
 * scripts/registerTelegramWebhook.js) — checking it stops a random request
 * to this public URL from spoofing a button tap.
 */
function requireTelegramSecret(req, res, next) {
  if (!env.telegramWebhookSecret) {
    return res.status(503).json({ message: 'TELEGRAM_WEBHOOK_SECRET is not configured on the server' });
  }
  const provided = req.headers['x-telegram-bot-api-secret-token'];
  if (provided !== env.telegramWebhookSecret) {
    return res.status(401).json({ message: 'Invalid webhook secret' });
  }
  return next();
}

module.exports = requireTelegramSecret;
