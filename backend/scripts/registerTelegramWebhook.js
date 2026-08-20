// One-time setup: tells Telegram where to send button taps. Run this once
// after deploying the backend (and again any time its public URL or
// TELEGRAM_WEBHOOK_SECRET changes):
//
//   node scripts/registerTelegramWebhook.js https://your-backend.onrender.com
//
// Needs TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET already set in
// backend/.env (or in the environment, if run against a deployed backend
// from your machine with those exported locally).
require('dotenv').config({ quiet: true });

const backendUrl = process.argv[2];
if (!backendUrl) {
  console.error('Usage: node scripts/registerTelegramWebhook.js https://your-backend-url');
  process.exit(1);
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
if (!token || !secret) {
  console.error('Set TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET in .env first, then re-run this.');
  process.exit(1);
}

async function main() {
  const webhookUrl = `${backendUrl.replace(/\/$/, '')}/api/telegram/webhook`;

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl, secret_token: secret }),
  });
  const data = await res.json();

  if (!data.ok) {
    console.error('Failed to set webhook:', data.description);
    process.exit(1);
  }
  console.log(`Webhook registered: ${webhookUrl}`);

  const commandsRes = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commands: [
        { command: 'fleetstatus', description: 'Available / Rented / Maintenance breakdown' },
        { command: 'today', description: "Today's pickups and returns" },
      ],
    }),
  });
  const commandsData = await commandsRes.json();
  if (!commandsData.ok) {
    console.error('Failed to register bot commands:', commandsData.description);
  } else {
    console.log('Bot commands registered: /fleetstatus, /today');
  }

  console.log('Send /start to your bot, or check with:');
  console.log(`  curl https://api.telegram.org/bot${token}/getWebhookInfo`);
}

main();
