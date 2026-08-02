const express = require('express');
const upload = require('../middlewares/upload');
const { createBooking, confirmPayment, getBookingStatus, cancelOwnBooking } = require('../controllers/bookingController');

const router = express.Router();

router.post('/', createBooking);
router.get('/:bookingId', getBookingStatus);
router.post('/:bookingId/confirm-payment', upload.single('receipt'), confirmPayment);
router.post('/:bookingId/cancel', cancelOwnBooking);

module.exports = router;
