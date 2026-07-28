const express = require('express');
const { getCars, getCarById, getCarAvailability } = require('../controllers/carController');

const router = express.Router();

router.get('/', getCars);
router.get('/:carId/availability', getCarAvailability);
router.get('/:carId', getCarById);

module.exports = router;
