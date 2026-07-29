const express = require('express');
const requireAdmin = require('../middlewares/requireAdmin');
const { listBookings, createCar, updateCar, deleteCar } = require('../controllers/adminController');

const router = express.Router();

// Every route below requires a valid admin session.
router.use(requireAdmin);

router.get('/bookings', listBookings);
router.post('/cars', createCar);
router.put('/cars/:carId', updateCar);
router.delete('/cars/:carId', deleteCar);

module.exports = router;
