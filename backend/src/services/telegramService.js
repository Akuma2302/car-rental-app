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

/** Converts a local Malaysian number (e.g. "012-345 6789") into the
 * digits-only, country-code-prefixed form wa.me links expect. */
function toWhatsappDigits(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('0') ? `60${digits.slice(1)}` : digits;
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
      `⏳ *New booking — needs a decision*`,
      '',
      `Car: ${booking.carName}`,
      `Customer: ${booking.customerName} ([${booking.customerPhone}](https://wa.me/${toWhatsappDigits(booking.customerPhone)}))`,
      `IC: ${booking.customerIc}`,
      `Address: ${booking.customerAddress}, ${booking.customerPostcode} ${booking.customerCity}, ${booking.customerState}`,
      `Pick-up: ${formatDateTime(booking.startAt)}`,
      `Return: ${formatDateTime(booking.endAt)}`,
      `Total: RM${booking.totalPrice}`,
      `Booked: ${formatDateTime(booking.createdAt)}`,
      '',
      `Confirm once you've received payment, or cancel if you haven't.`,
    ].join('\n');

    return callTelegram('sendMessage', {
      chat_id: env.telegramAdminChatId,
      // Only forum-enabled supergroups with Topics turned on use this —
      // omitted entirely for a private chat or a plain (non-forum) group,
      // since Telegram rejects the call if you pass a thread id that
      // doesn't apply to the target chat.
      ...(env.telegramTopicId ? { message_thread_id: env.telegramTopicId } : {}),
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

  /** Plain follow-up message (not editing an existing one) — used for the
   * "send the receipt photo now" prompt and the upload result. */
  async sendMessage(chatId, text, extra = {}) {
    return callTelegram('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      ...extra,
    });
  },

  /**
   * Downloads a photo the admin sent in Telegram, for forwarding straight
   * into the same receipt-upload pipeline the admin dashboard's file input
   * uses. Telegram sends photos as several resolutions (photo[]); the
   * caller passes the highest-res file_id.
   */
  async downloadPhoto(fileId) {
    const fileInfo = await callTelegram('getFile', { file_id: fileId });
    const res = await fetch(`${TELEGRAM_API}/file/bot${env.telegramBotToken}/${fileInfo.file_path}`);
    if (!res.ok) {
      const err = new Error(`Failed to download photo from Telegram (${res.status})`);
      err.status = 502;
      throw err;
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  },
};

module.exports = telegramService;
