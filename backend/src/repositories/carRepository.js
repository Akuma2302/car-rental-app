const pool = require('../config/db');

function toCarDto(row) {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    seats: row.seats,
    transmission: row.transmission,
    pricePerDay: row.price_per_day,
    accent: row.accent,
  };
}

const carRepository = {
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM cars ORDER BY created_at ASC');
    return rows.map(toCarDto);
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
    return rows[0] ? toCarDto(rows[0]) : null;
  },

  async create({ id, name, tagline, seats, transmission, pricePerDay, accent }) {
    const { rows } = await pool.query(
      `INSERT INTO cars (id, name, tagline, seats, transmission, price_per_day, accent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, name, tagline, seats, transmission, pricePerDay, accent]
    );
    return toCarDto(rows[0]);
  },

  async update(id, { name, tagline, seats, transmission, pricePerDay, accent }) {
    const { rows } = await pool.query(
      `UPDATE cars
       SET name = $2, tagline = $3, seats = $4, transmission = $5, price_per_day = $6, accent = $7
       WHERE id = $1
       RETURNING *`,
      [id, name, tagline, seats, transmission, pricePerDay, accent]
    );
    return rows[0] ? toCarDto(rows[0]) : null;
  },

  async remove(id) {
    const { rowCount } = await pool.query('DELETE FROM cars WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = carRepository;
