const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const adminRepository = require('../repositories/adminRepository');

const TOKEN_TTL = '12h';

const authService = {
  /**
   * @returns {{token: string, username: string}}
   */
  async login(username, password) {
    const admin = await adminRepository.findByUsername(username);

    // Same generic error whether the username doesn't exist or the password
    // is wrong — don't help an attacker enumerate valid usernames.
    const invalidCredentials = () => {
      const err = new Error('Invalid username or password');
      err.status = 401;
      return err;
    };

    if (!admin) throw invalidCredentials();

    const passwordMatches = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatches) throw invalidCredentials();

    if (!env.jwtSecret) {
      const err = new Error('Server is missing JWT_SECRET configuration');
      err.status = 500;
      throw err;
    }

    const token = jwt.sign({ sub: admin.username, role: 'admin' }, env.jwtSecret, {
      expiresIn: TOKEN_TTL,
    });

    return { token, username: admin.username };
  },
};

module.exports = authService;
