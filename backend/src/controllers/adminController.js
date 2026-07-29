const bookingRepository = require('../repositories/bookingRepository');
const carService = require('../services/carService');
const { validateCarPayload } = require('../validators/carValidator');
const asyncHandler = require('../utils/asyncHandler');

const listBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingRepository.findAll();
  res.json(bookings);
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

module.exports = { listBookings, createCar, updateCar, deleteCar };
