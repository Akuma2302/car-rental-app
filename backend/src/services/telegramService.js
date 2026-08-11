const env = require('../config/env');

const TELEGRAM_API = 'https://api.telegram.org';

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function callTelegram(method, payload) {
  if (!env.telegramBotToken) {
    const err = new Error('TELEGRAM_BOT_TOKEN is not configured');
    err.status = 500;
    throw err;
  }

  const res = await fetch(`${TELEGRAM_API}/bot${env.telegramBotToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!data.ok) {
    const err = new Error(`Telegram API error (${method}): ${data.description || 'unknown error'}`);
    err.status = 502;
    throw err;
  }
  return data.result;
}

const telegramService = {
  /**
   * Sends the admin the "still pending" alert with inline Confirm/Cancel
   * buttons. callback_data encodes the action and booking id so the
   * webhook handler (telegramController.js) knows what was tapped, without
   * needing any server-side session state.
   */
  async sendPendingBookingAlert(booking) {
    const text = [
      `⏳ *Pending booking needs a decision*`,
      '',
      `Car: ${booking.carName}`,
      `Customer: ${booking.customerName} (${booking.customerPhone})`,
      `Pick-up: ${formatDateTime(booking.startAt)}`,
      `Return: ${formatDateTime(booking.endAt)}`,
      `Total: RM${booking.totalPrice}`,
      '',
      `This has been pending for ${env.agentPendingHours}+ hours — has the customer paid?`,
    ].join('\n');

    return callTelegram('sendMessage', {
      chat_id: env.telegramAdminChatId,
      text,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Confirmed — I have the receipt', callback_data: `agent:confirm:${booking.id}` },
            { text: '❌ Cancel booking', callback_data: `agent:cancel:${booking.id}` },
          ],
        ],
      },
    });
  },

  /** Rewrites the alert once actioned and strips the buttons, so a second
   * tap (or a delayed retry) has nothing left to press. */
  async editMessage(chatId, messageId, text) {
    return callTelegram('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [] },
    });
  },

  /** Clears the loading spinner Telegram shows on the tapped button, with
   * a short toast — this is required by the Bot API within ~a few seconds
   * of every callback_query, regardless of what the tap did. */
  async answerCallback(callbackQueryId, text) {
    return callTelegram('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    });
  },
};

module.exports = telegramService;
