const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function validateBookingPayload(body) {
  const errors = [];

  if (!body.carId || typeof body.carId !== 'string') errors.push('carId is required');
  if (!body.startAt || !ISO_RE.test(body.startAt)) errors.push('startAt must be an ISO date-time string');
  if (!body.endAt || !ISO_RE.test(body.endAt)) errors.push('endAt must be an ISO date-time string');
  if (body.startAt && body.endAt && new Date(body.endAt) <= new Date(body.startAt)) {
    errors.push('endAt must be after startAt');
  }
  if (!body.customerName || !body.customerName.trim()) errors.push('customerName is required');
  if (!body.customerPhone || !body.customerPhone.trim()) errors.push('customerPhone is required');

  return errors;
}

function validateAvailabilityQuery(query) {
  const errors = [];
  if (!query.startAt || !ISO_RE.test(query.startAt)) errors.push('startAt query param must be an ISO date-time string');
  if (!query.endAt || !ISO_RE.test(query.endAt)) errors.push('endAt query param must be an ISO date-time string');
  return errors;
}

module.exports = { validateBookingPayload, validateAvailabilityQuery };
