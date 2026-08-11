const agentService = require('../services/agentService');
const asyncHandler = require('../utils/asyncHandler');

const runSweep = asyncHandler(async (req, res) => {
  const result = await agentService.runSweep();
  res.json(result);
});

module.exports = { runSweep };
