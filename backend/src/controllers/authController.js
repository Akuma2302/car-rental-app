const authService = require('../services/authService');
const { validateLoginPayload } = require('../validators/authValidator');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const errors = validateLoginPayload(req.body);
  if (errors.length) {
    return res.status(400).json({ message: 'Invalid login', errors });
  }

  const result = await authService.login(req.body.username, req.body.password);
  res.json(result);
});

module.exports = { login };
