const express = require('express');
const upload = require('../middlewares/upload');
const { createBooking, confirmPayment } = require('../controllers/bookingController');

const router = express.Router();

router.post('/', createBooking);
router.post('/:bookingId/confirm-payment', upload.single('receipt'), confirmPayment);

module.exports = router;
