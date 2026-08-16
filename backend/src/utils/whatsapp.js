const env = require('../config/env');

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
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
function buildWhatsappLink({
  car,
  startAt,
  endAt,
  totalPrice,
  customerName,
  customerPhone,
  customerIc,
  customerAddress,
  customerPostcode,
  customerCity,
  customerState,
  bookingId,
}) {
  const message = [
    `New Booking Request - ${env.businessName}`,
    `Status: PENDING (payment not yet confirmed)`,
    `Car: ${car.name}`,
    `Pick-up: ${formatDateTime(startAt)}`,
    `Return: ${formatDateTime(endAt)}`,
    `Total: RM${totalPrice}`,
    `Name: ${customerName}`,
    `Phone: ${customerPhone}`,
    `IC: ${customerIc}`,
    `Address: ${customerAddress}, ${customerPostcode} ${customerCity}, ${customerState}`,
    '',
    "We'll connect with you shortly to confirm — stay tuned!",
  ].join('\n');

  return `https://wa.me/${env.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

module.exports = { buildWhatsappLink };
