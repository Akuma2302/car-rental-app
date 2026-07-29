const bookingService = require('../services/bookingService');
const { validateBookingPayload } = require('../validators/bookingValidator');
const asyncHandler = require('../utils/asyncHandler');

const createBooking = asyncHandler(async (req, res) => {
  const errors = validateBookingPayload(req.body);
  if (errors.length) {
    return res.status(400).json({ message: 'Invalid booking', errors });
  }

  const result = await bookingService.createBookingWithNotification(req.body);
  res.status(201).json(result);
});

module.exports = { createBooking };
