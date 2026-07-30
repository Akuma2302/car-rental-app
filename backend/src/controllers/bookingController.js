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

const confirmPayment = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'A receipt image is required' });
  }
  const booking = await bookingService.confirmPayment(req.params.bookingId, req.file);
  res.json(booking);
});

module.exports = { createBooking, confirmPayment };
