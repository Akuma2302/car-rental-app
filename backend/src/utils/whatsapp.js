const env = require('../config/env');

/**
 * Builds a wa.me click-to-chat link with the booking pre-filled as text.
 * This is the zero-cost, no-API-approval way to get a booking "sent" to
 * WhatsApp: the customer's own tap-to-send delivers the message.
 */
function buildWhatsappLink({ car, date, time, customerName, customerPhone }) {
  const niceDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const message = [
    `New Booking Request - ${env.businessName}`,
    `Car: ${car.name}`,
    `Date: ${niceDate}`,
    `Time: ${time}`,
    `Name: ${customerName}`,
    `Phone: ${customerPhone}`,
    '',
    '(Sent via website booking form)',
  ].join('\n');

  return `https://wa.me/${env.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

module.exports = { buildWhatsappLink };
