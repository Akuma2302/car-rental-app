const bookingService = require('../services/bookingService');
const carService = require('../services/carService');
const imageService = require('../services/imageService');
const { validateCarPayload } = require('../validators/carValidator');
const asyncHandler = require('../utils/asyncHandler');

const listBookings = asyncHandler(async (req, res) => {
  res.json(await bookingService.listAll());
});

/** Fleet-wide overview for the admin Dashboard tab. */
const getDashboardOverview = asyncHandler(async (req, res) => {
  const [cars, activeNow, allBookings] = await Promise.all([
    carService.listCars(),
    bookingService.getActiveNow(),
    bookingService.listAll(),
  ]);

  const activeCarIds = new Set(activeNow.map((b) => b.carId));
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const bookingsThisWeek = allBookings.filter((b) => new Date(b.createdAt).getTime() >= oneWeekAgo);
  // Only count confirmed (paid) bookings as revenue — a pending booking
  // hasn't actually been paid for yet.
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
    })),
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

module.exports = {
  listBookings,
  getDashboardOverview,
  createCar,
  updateCar,
  deleteCar,
  uploadCarImages,
  deleteCarImage,
  setCoverImage,
};
