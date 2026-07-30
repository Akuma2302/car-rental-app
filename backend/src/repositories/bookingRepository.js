const crypto = require('crypto');
const pool = require('../config/db');

function toBookingDto(row) {
  return {
    id: row.id,
    carId: row.car_id,
    startAt: row.start_at,
    endAt: row.end_at,
    totalPrice: row.total_price,
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
       ORDER BY b.start_at DESC`
    );
    return rows.map((row) => ({ ...toBookingDto(row), carName: row.car_name }));
  },

  /**
   * Booked ranges for a car within a window — used by the customer site to
   * show which dates/times are already taken. Returns start/end only, no
   * customer PII (this is a public endpoint).
   */
  async findRangesForCar(carId, fromDate, toDate) {
    const { rows } = await pool.query(
      `SELECT start_at, end_at FROM bookings
       WHERE car_id = $1 AND start_at < $3 AND end_at > $2
       ORDER BY start_at ASC`,
      [carId, fromDate, toDate]
    );
    return rows.map((r) => ({ startAt: r.start_at, endAt: r.end_at }));
  },

  /** Bookings currently in progress (right now falls within their range) — for the admin dashboard. */
  async findActiveNow() {
    const { rows } = await pool.query(
      `SELECT b.*, c.name AS car_name
       FROM bookings b
       JOIN cars c ON c.id = b.car_id
       WHERE now() BETWEEN b.start_at AND b.end_at
       ORDER BY b.end_at ASC`
    );
    return rows.map((row) => ({ ...toBookingDto(row), carName: row.car_name }));
  },

  /**
   * Inserts the booking directly and relies on the bookings_no_overlap
   * EXCLUDE constraint to guarantee atomically that no two bookings for the
   * same car can ever have overlapping ranges — even under concurrent
   * requests. Throws a Postgres error (code 23P01) if the range conflicts;
   * the service layer translates that into a 409.
   */
  async create({ carId, startAt, endAt, totalPrice, customerName, customerPhone }) {
    const id = crypto.randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO bookings (id, car_id, start_at, end_at, total_price, customer_name, customer_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, carId, startAt, endAt, totalPrice, customerName, customerPhone]
    );
    return toBookingDto(rows[0]);
  },
};

module.exports = bookingRepository;
