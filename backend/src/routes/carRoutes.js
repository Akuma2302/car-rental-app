const express = require('express');
const { getCars, getCarById, getCarBookedRanges, getPriceQuote } = require('../controllers/carController');

const router = express.Router();

router.get('/', getCars);
router.get('/:carId/booked-ranges', getCarBookedRanges);
router.get('/:carId/price-quote', getPriceQuote);
router.get('/:carId', getCarById);

module.exports = router;
