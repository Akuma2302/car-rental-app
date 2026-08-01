const carService = require('../services/carService');
const bookingService = require('../services/bookingService');
const { validateAvailabilityQuery } = require('../validators/bookingValidator');
const asyncHandler = require('../utils/asyncHandler');

const getCars = asyncHandler(async (req, res) => {
  res.json(await carService.listActiveCars());
});

const getCarById = asyncHandler(async (req, res) => {
  const car = await carService.getCar(req.params.carId);
  if (!car) return res.status(404).json({ message: 'Car not found' });
  res.json(car);
});

/** Booked date/time ranges for a car — used to grey out taken dates on the
 * customer-facing date-range picker. No customer PII in the response. */
const getCarBookedRanges = asyncHandler(async (req, res) => {
  const { carId } = req.params;
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ message: 'from and to query params are required (ISO dates)' });
  }
  if (!(await carService.getCar(carId))) {
    return res.status(404).json({ message: 'Car not found' });
  }

  res.json(await bookingService.getBookedRanges(carId, from, to));
});

/** Live price + duration quote for a proposed booking, before the customer commits. */
const getPriceQuote = asyncHandler(async (req, res) => {
  const { carId } = req.params;
  const errors = validateAvailabilityQuery(req.query);
  if (errors.length) return res.status(400).json({ message: 'Invalid request', errors });

  const quote = await bookingService.previewPrice(carId, req.query.startAt, req.query.endAt);
  res.json(quote);
});

module.exports = { getCars, getCarById, getCarBookedRanges, getPriceQuote };
