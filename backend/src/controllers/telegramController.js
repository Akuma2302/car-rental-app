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
    if (!callback || !callback.data) return; // Not a button tap — ignore.

    const [prefix, action, bookingId] = callback.data.split(':');
    if (prefix !== 'agent') return;

    await agentService.handleDecision({
      bookingId,
      action,
      chatId: callback.message.chat.id,
      messageId: callback.message.message_id,
      callbackQueryId: callback.id,
    });
  } catch (err) {
    console.error('Telegram webhook handling failed:', err.message);
  }
});

module.exports = { handleWebhook };
