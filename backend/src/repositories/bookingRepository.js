const crypto = require('crypto');
const pool = require('../config/db');

function toBookingDto(row) {
  return {
    id: row.id,
    carId: row.car_id,
    date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : row.date,
    time: row.time,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    createdAt: row.created_at,
  };
}

const bookingRepository = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT b.*, c.name AS car_name
       FROM bookings b
       JOIN cars c ON c.id = b.car_id
       ORDER BY b.date DESC, b.time DESC`
    );
    return rows.map((row) => ({ ...toBookingDto(row), carName: row.car_name }));
  },

  async findByCarAndDate(carId, date) {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE car_id = $1 AND date = $2', [
      carId,
      date,
    ]);
    return rows.map(toBookingDto);
  },

  /**
   * Inserts the booking directly and relies on the (car_id, date, time)
   * UNIQUE constraint to guarantee atomically that no two bookings can ever
   * share a slot — even under concurrent requests, unlike a check-then-write
   * pattern in application code. Throws a Postgres error (code 23505) if the
   * slot is already taken; the service layer translates that into a 409.
   */
  async create({ carId, date, time, customerName, customerPhone }) {
    const id = crypto.randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO bookings (id, car_id, date, time, customer_name, customer_phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, carId, date, time, customerName, customerPhone]
    );
    return toBookingDto(rows[0]);
  },
};

module.exports = bookingRepository;
