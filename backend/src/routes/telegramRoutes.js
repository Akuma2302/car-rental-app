const express = require('express');
const requireTelegramSecret = require('../middlewares/requireTelegramSecret');
const { handleWebhook } = require('../controllers/telegramController');

const router = express.Router();

router.post('/webhook', requireTelegramSecret, handleWebhook);

module.exports = router;
