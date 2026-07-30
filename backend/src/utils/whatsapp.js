const env = require('../config/env');

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Builds a wa.me click-to-chat link with the booking pre-filled as text.
 * This is the zero-cost, no-API-approval way to get a booking "sent" to
 * WhatsApp: the customer's own tap-to-send delivers the message.
 */
function buildWhatsappLink({ car, startAt, endAt, totalPrice, customerName, customerPhone }) {
  const message = [
    `New Booking Request - ${env.businessName}`,
    `Car: ${car.name}`,
    `Pick-up: ${formatDateTime(startAt)}`,
    `Return: ${formatDateTime(endAt)}`,
    `Total: RM${totalPrice}`,
    `Name: ${customerName}`,
    `Phone: ${customerPhone}`,
    '',
    '(Sent via website booking form)',
  ].join('\n');

  return `https://wa.me/${env.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

module.exports = { buildWhatsappLink };
