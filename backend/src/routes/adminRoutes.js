const express = require('express');
const requireAdmin = require('../middlewares/requireAdmin');
const upload = require('../middlewares/upload');
const {
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
} = require('../controllers/adminController');

const router = express.Router();

// Every route below requires a valid admin session.
router.use(requireAdmin);

router.get('/bookings', listBookings);
router.put('/bookings/:bookingId/cancel', cancelBooking);
router.post('/bookings/:bookingId/receipt', upload.single('receipt'), uploadBookingReceipt);

router.get('/dashboard', getDashboardOverview);

router.get('/cars', listAllCarsForAdmin);
router.post('/cars', createCar);
router.put('/cars/:carId', updateCar);
router.delete('/cars/:carId', deleteCar);
router.put('/cars/:carId/condition', setCarCondition);
router.put('/cars/:carId/active', setCarActive);

router.post('/cars/:carId/images', upload.array('images', 8), uploadCarImages);
router.delete('/cars/:carId/images/:imageId', deleteCarImage);
router.put('/cars/:carId/images/:imageId/cover', setCoverImage);

module.exports = router;
