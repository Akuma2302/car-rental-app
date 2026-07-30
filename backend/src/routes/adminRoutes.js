const express = require('express');
const requireAdmin = require('../middlewares/requireAdmin');
const upload = require('../middlewares/upload');
const {
  listBookings,
  getDashboardOverview,
  createCar,
  updateCar,
  deleteCar,
  uploadCarImages,
  deleteCarImage,
  setCoverImage,
} = require('../controllers/adminController');

const router = express.Router();

// Every route below requires a valid admin session.
router.use(requireAdmin);

router.get('/bookings', listBookings);
router.get('/dashboard', getDashboardOverview);

router.post('/cars', createCar);
router.put('/cars/:carId', updateCar);
router.delete('/cars/:carId', deleteCar);

router.post('/cars/:carId/images', upload.array('images', 8), uploadCarImages);
router.delete('/cars/:carId/images/:imageId', deleteCarImage);
router.put('/cars/:carId/images/:imageId/cover', setCoverImage);

module.exports = router;
