const bookingRepository = require('../repositories/bookingRepository');
const bookingService = require('./bookingService');
const telegramService = require('./telegramService');
const env = require('../config/env');

const agentService = {
  /**
   * Runs on a schedule via an external trigger hitting
   * POST /api/agent/sweep (see backend/README.md "AI Agent" section — a
   * free pinger like cron-job.org every ~15 minutes is the recommended
   * setup on Render's free tier, which sleeps an idle process).
   *
   * Finds bookings that have been "pending" for AGENT_PENDING_HOURS or
   * more and haven't been notified about yet, and pings the admin on
   * Telegram with a Confirm/Cancel choice for each one. Safe to call
   * repeatedly — findStalePending only returns bookings that haven't
   * already been notified.
   */
  async runSweep() {
    const staleBookings = await bookingRepository.findStalePending(env.agentPendingHours);
    const results = [];

    for (const booking of staleBookings) {
      try {
        const message = await telegramService.sendPendingBookingAlert(booking);
        await bookingRepository.markAgentNotified(booking.id, String(message.message_id));
        results.push({ bookingId: booking.id, notified: true });
      } catch (err) {
        // One failed notification (e.g. a transient Telegram API error)
        // shouldn't stop the rest of the sweep — it'll simply be retried
        // on the next run since agent_notified_at is only set on success.
        console.error(`Agent sweep: failed to notify for booking ${booking.id}:`, err.message);
        results.push({ bookingId: booking.id, notified: false, error: err.message });
      }
    }

    return { checked: staleBookings.length, results };
  },

  /**
   * Handles the admin's tap on a Confirm/Cancel button, from the Telegram
   * webhook. Idempotent — a booking that already has an agent_decision (or
   * is no longer 'pending', e.g. the admin acted from the dashboard
   * instead) is treated as already-handled rather than re-actioned.
   */
  async handleDecision({ bookingId, action, chatId, messageId, callbackQueryId }) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      await telegramService.answerCallback(callbackQueryId, 'Booking no longer exists.');
      return;
    }

    if (booking.agentDecision) {
      await telegramService.answerCallback(callbackQueryId, 'Already handled.');
      return;
    }

    if (booking.status !== 'pending') {
      await telegramService.answerCallback(callbackQueryId, `Already ${booking.status} — nothing to do.`);
      await telegramService.editMessage(
        chatId,
        messageId,
        `Booking for ${booking.customerName} is already *${booking.status}* — it was handled outside the agent.`
      );
      return;
    }

    if (action === 'confirm') {
      await bookingRepository.setAgentDecision(bookingId, 'confirmed');
      await telegramService.answerCallback(callbackQueryId, 'Marked as confirmed.');
      await telegramService.editMessage(
        chatId,
        messageId,
        `✅ Confirmed for ${booking.customerName} — send the receipt photo here in this chat and it'll be uploaded automatically.`
      );
      return;
    }

    if (action === 'cancel') {
      await bookingService.cancelBooking(bookingId);
      await bookingRepository.setAgentDecision(bookingId, 'cancelled');
      await telegramService.answerCallback(callbackQueryId, 'Booking cancelled.');
      await telegramService.editMessage(chatId, messageId, `❌ Cancelled the booking for ${booking.customerName}.`);
      return;
    }

    await telegramService.answerCallback(callbackQueryId, 'Unrecognized action.');
  },

  /**
   * Handles a photo the admin sends in the chat after tapping Confirm —
   * downloads it from Telegram and runs it through the exact same
   * receipt-upload pipeline as the admin dashboard's file input
   * (bookingService.confirmPayment), so it ends up in the same storage
   * bucket and flips the booking to 'booked' the same way either path
   * would.
   *
   * Matching to a booking: if the photo was sent as a reply to a specific
   * alert message, that booking is used directly (telegram_message_id).
   * Otherwise, falls back to the most recently Confirmed-but-unpaid
   * booking — correct in the common case of one booking in flight at a
   * time; sending as a reply is the reliable way to disambiguate if
   * several are pending receipts at once.
   */
  async handleReceiptPhoto({ chatId, fileId, replyToMessageId }) {
    const booking = replyToMessageId
      ? await bookingRepository.findByTelegramMessageId(replyToMessageId)
      : await bookingRepository.findMostRecentAwaitingReceipt();

    if (!booking) {
      await telegramService.sendMessage(
        chatId,
        "Couldn't find a booking waiting on a receipt — tap *Confirmed* on a booking's alert first, or upload it from the admin dashboard instead."
      );
      return;
    }

    try {
      const buffer = await telegramService.downloadPhoto(fileId);
      const file = { buffer, mimetype: 'image/jpeg', originalname: `telegram-${fileId}.jpg` };
      await bookingService.confirmPayment(booking.id, file);
      await telegramService.sendMessage(
        chatId,
        `📎 Receipt received and uploaded — booking for ${booking.customerName} is now *confirmed*.`
      );
    } catch (err) {
      console.error(`Failed to process Telegram receipt photo for booking ${booking.id}:`, err.message);
      await telegramService.sendMessage(chatId, `Couldn't upload that receipt: ${err.message}`);
    }
  },
};

module.exports = agentService;
