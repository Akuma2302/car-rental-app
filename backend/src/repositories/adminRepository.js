const pool = require('../config/db');

const adminRepository = {
  async findByUsername(username) {
    const { rows } = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
    return rows[0] || null;
  },
};

module.exports = adminRepository;
