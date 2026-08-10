const bookingService = require('../services/bookingService');
const carService = require('../services/carService');
const imageService = require('../services/imageService');
const statsService = require('../services/statsService');
const { validateCarPayload, validateConditionPayload, validateActivePayload } = require('../validators/carValidator');
const asyncHandler = require('../utils/asyncHandler');

const listBookings = asyncHandler(async (req, res) => {
  res.json(await bookingService.listAll());
});

/** Admin car listing — every car, including disabled/maintenance ones, so
 * they stay manageable rather than disappearing once taken off the public
 * site. Contrast with the public GET /api/cars, which only shows active
 * cars. */
const listAllCarsForAdmin = asyncHandler(async (req, res) => {
  res.json(await carService.listCars());
});

/** Fleet-wide overview for the admin Dashboard tab. */
const getDashboardOverview = asyncHandler(async (req, res) => {
  const [cars, activeNow, allBookings, fleetStatus, todaySchedule, kpis] = await Promise.all([
    carService.listCars(),
    bookingService.getActiveNow(),
    bookingService.listAll(),
    statsService.getFleetStatus(),
    statsService.getTodaySchedule(),
    statsService.getKpis(),
  ]);

  const activeCarIds = new Set(activeNow.map((b) => b.carId));
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const bookingsThisWeek = allBookings.filter((b) => new Date(b.createdAt).getTime() >= oneWeekAgo);
  // Only count confirmed (paid), non-cancelled bookings as revenue.
  const revenueThisWeek = bookingsThisWeek
    .filter((b) => b.status === 'booked')
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const pendingBookings = allBookings.filter((b) => b.status === 'pending');

  res.json({
    totalCars: cars.length,
    carsOnRentNow: activeCarIds.size,
    carsAvailableNow: cars.length - activeCarIds.size,
    totalBookings: allBookings.length,
    bookingsThisWeek: bookingsThisWeek.length,
    revenueThisWeek,
    pendingPayments: pendingBookings.length,
    activeRentals: activeNow,
    fleet: cars.map((car) => ({
      id: car.id,
      name: car.name,
      category: car.category,
      onRentNow: activeCarIds.has(car.id),
      isActive: car.isActive,
      condition: car.condition,
    })),
    fleetStatus,
    todaySchedule,
    kpis,
  });
});

const createCar = asyncHandler(async (req, res) => {
  const errors = validateCarPayload(req.body);
  if (errors.length) return res.status(400).json({ message: 'Invalid car', errors });

  const existing = await carService.getCar(req.body.id);
  if (existing) return res.status(409).json({ message: `A car with id "${req.body.id}" already exists` });

  const car = await carService.createCar(req.body);
  res.status(201).json(car);
});

const updateCar = asyncHandler(async (req, res) => {
  const errors = validateCarPayload(req.body, { isUpdate: true });
  if (errors.length) return res.status(400).json({ message: 'Invalid car', errors });

  const car = await carService.updateCar(req.params.carId, req.body);
  res.json(car);
});

const deleteCar = asyncHandler(async (req, res) => {
  await carService.deleteCar(req.params.carId);
  res.status(204).end();
});

const setCarCondition = asyncHandler(async (req, res) => {
  const errors = validateConditionPayload(req.body);
  if (errors.length) return res.status(400).json({ message: 'Invalid request', errors });

  const car = await carService.setCondition(req.params.carId, req.body.condition);
  res.json(car);
});

const setCarActive = asyncHandler(async (req, res) => {
  const errors = validateActivePayload(req.body);
  if (errors.length) return res.status(400).json({ message: 'Invalid request', errors });

  const car = await carService.setActive(req.params.carId, req.body.isActive);
  res.json(car);
});

const uploadCarImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No image files were uploaded' });
  }
  const images = await imageService.uploadImages(req.params.carId, req.files);
  res.status(201).json(images);
});

const deleteCarImage = asyncHandler(async (req, res) => {
  await imageService.deleteImage(req.params.carId, req.params.imageId);
  res.status(204).end();
});

const setCoverImage = asyncHandler(async (req, res) => {
  const images = await imageService.setCoverImage(req.params.carId, req.params.imageId);
  res.json(images);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.bookingId);
  res.json(booking);
});

/**
 * Admin uploads the payment receipt they received over WhatsApp — this is
 * what actually flips a booking from "pending" to "booked" now (the
 * customer no longer uploads it themselves). Reuses the same
 * bookingService.confirmPayment used by the old customer-facing flow.
 */
const uploadBookingReceipt = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'A receipt image is required' });
  }
  const booking = await bookingService.confirmPayment(req.params.bookingId, req.file);
  res.json(booking);
});

module.exports = {
  listBookings,
  listAllCarsForAdmin,
  getDashboardOverview,
  createCar,
  updateCar,
  deleteCar,
  setCarCondition,
  setCarActive,
  uploadCarImages,
  deleteCarImage,
  setCoverImage,
  cancelBooking,
  uploadBookingReceipt,
};
