const TIME_RE = /^([01]\d|2[0-3]):00$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @param {object} body - raw req.body for POST /api/bookings
 * @returns {string[]} list of validation error messages (empty = valid)
 */
function validateBookingPayload(body) {
  const errors = [];

  if (!body.carId || typeof body.carId !== 'string') {
    errors.push('carId is required');
  }
  if (!body.date || !DATE_RE.test(body.date)) {
    errors.push('date must be in YYYY-MM-DD format');
  }
  if (!body.time || !TIME_RE.test(body.time)) {
    errors.push('time must be in HH:00 format');
  }
  if (!body.customerName || !body.customerName.trim()) {
    errors.push('customerName is required');
  }
  if (!body.customerPhone || !body.customerPhone.trim()) {
    errors.push('customerPhone is required');
  }

  return errors;
}

module.exports = { validateBookingPayload };
