const express = require('express');
const carRoutes = require('./carRoutes');
const bookingRoutes = require('./bookingRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const agentRoutes = require('./agentRoutes');
const telegramRoutes = require('./telegramRoutes');

const router = express.Router();

router.use('/cars', carRoutes);
router.use('/bookings', bookingRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/agent', agentRoutes);
router.use('/telegram', telegramRoutes);

router.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = router;
