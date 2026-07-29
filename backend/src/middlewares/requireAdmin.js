const jwt = require('jsonwebtoken');
const env = require('../config/env');

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing or malformed Authorization header' });
  }

  try {
    req.admin = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session — please log in again' });
  }
}

module.exports = requireAdmin;
