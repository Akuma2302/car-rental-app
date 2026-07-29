const carService = require('../services/carService');
const bookingService = require('../services/bookingService');
const asyncHandler = require('../utils/asyncHandler');

const getCars = asyncHandler(async (req, res) => {
  res.json(await carService.listCars());
});

const getCarById = asyncHandler(async (req, res) => {
  const car = await carService.getCar(req.params.carId);
  if (!car) return res.status(404).json({ message: 'Car not found' });
  res.json(car);
});

const getCarAvailability = asyncHandler(async (req, res) => {
  const { carId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'date query param is required (YYYY-MM-DD)' });
  }
  if (!(await carService.getCar(carId))) {
    return res.status(404).json({ message: 'Car not found' });
  }

  res.json(await bookingService.getAvailability(carId, date));
});

module.exports = { getCars, getCarById, getCarAvailability };
