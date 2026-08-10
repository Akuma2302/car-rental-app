const express = require('express');
const { createBooking, getBookingStatus, cancelOwnBooking } = require('../controllers/bookingController');

const router = express.Router();

router.post('/', createBooking);
router.get('/:bookingId', getBookingStatus);
router.post('/:bookingId/cancel', cancelOwnBooking);

module.exports = router;
