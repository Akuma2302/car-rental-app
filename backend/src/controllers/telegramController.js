const agentService = require('../services/agentService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Telegram retries webhook calls aggressively on anything other than a
 * fast 2xx, so this acknowledges immediately and does the actual work
 * afterwards, catching its own errors rather than letting Express's error
 * handler try to respond a second time.
 */
const handleWebhook = asyncHandler(async (req, res) => {
  res.status(200).json({ ok: true });

  try {
    const callback = req.body.callback_query;
    if (callback && callback.data) {
      const [prefix, action, bookingId] = callback.data.split(':');
      if (prefix !== 'agent') return;

      await agentService.handleDecision({
        bookingId,
        action,
        chatId: callback.message.chat.id,
        messageId: callback.message.message_id,
        callbackQueryId: callback.id,
      });
      return;
    }

    const message = req.body.message;
    if (message && Array.isArray(message.photo) && message.photo.length > 0) {
      // Telegram sends the same photo at several resolutions — the last
      // entry in the array is always the largest.
      const largest = message.photo[message.photo.length - 1];
      await agentService.handleReceiptPhoto({
        chatId: message.chat.id,
        fileId: largest.file_id,
        replyToMessageId: message.reply_to_message ? String(message.reply_to_message.message_id) : null,
      });
      return;
    }

    if (message && typeof message.text === 'string' && !message.text.startsWith('/')) {
      // handlePriceReply silently no-ops if this isn't actually a number
      // or nothing's waiting on one — not every message typed in the chat
      // is meant as a price update.
      await agentService.handlePriceReply({
        chatId: message.chat.id,
        text: message.text,
        replyToMessageId: message.reply_to_message ? String(message.reply_to_message.message_id) : null,
      });
    }
  } catch (err) {
    console.error('Telegram webhook handling failed:', err.message);
  }
});

module.exports = { handleWebhook };
