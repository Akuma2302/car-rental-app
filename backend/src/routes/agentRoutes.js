const express = require('express');
const requireAgentSecret = require('../middlewares/requireAgentSecret');
const { runSweep } = require('../controllers/agentController');

const router = express.Router();

router.post('/sweep', requireAgentSecret, runSweep);

module.exports = router;
