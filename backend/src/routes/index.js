const express = require('express');
const carRoutes = require('./carRoutes');
const bookingRoutes = require('./bookingRoutes');

const router = express.Router();

router.use('/cars', carRoutes);
router.use('/bookings', bookingRoutes);

router.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = router;
