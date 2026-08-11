const crypto = require('crypto');
const pool = require('../config/db');

function toBookingDto(row) {
  return {
    id: row.id,
    carId: row.car_id,
    startAt: row.start_at,
    endAt: row.end_at,
    totalPrice: row.total_price,
    status: row.status,
    receiptUrl: row.receipt_url,
    paymentConfirmedAt: row.payment_confirmed_at,
    cancelledAt: row.cancelled_at,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    createdAt: row.created_at,
    agentNotifiedAt: row.agent_notified_at,
    agentDecision: row.agent_decision,
    telegramMessageId: row.telegram_message_id,
  };
}

const bookingRepository = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT b.*, c.name AS car_name
       FROM bookings b
       JOIN cars c ON c.id = b.car_id
       ORDER BY b.created_at DESC`
    );
    return rows.map((row) => ({ ...toBookingDto(row), carName: row.car_name }));
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    return rows[0] ? toBookingDto(rows[0]) : null;
  },

  /**
   * Booked ranges for a car within a window — used by the customer site to
   * show which dates/times are already taken. Cancelled bookings are
   * excluded since they no longer hold their slot. No customer PII (this
   * is a public endpoint).
   */
  async findRangesForCar(carId, fromDate, toDate) {
    const { rows } = await pool.query(
      `SELECT start_at, end_at FROM bookings
       WHERE car_id = $1 AND status <> 'cancelled' AND start_at < $3 AND end_at > $2
       ORDER BY start_at ASC`,
      [carId, fromDate, toDate]
    );
    return rows.map((r) => ({ startAt: r.start_at, endAt: r.end_at }));
  },

  /** Non-cancelled bookings currently in progress (right now falls within their range) — for the admin dashboard. */
  async findActiveNow() {
    const { rows } = await pool.query(
      `SELECT b.*, c.name AS car_name
       FROM bookings b
       JOIN cars c ON c.id = b.car_id
       WHERE b.status <> 'cancelled' AND now() BETWEEN b.start_at AND b.end_at
       ORDER BY b.end_at ASC`
    );
    return rows.map((row) => ({ ...toBookingDto(row), carName: row.car_name }));
  },

  /**
   * Inserts the booking directly and relies on the bookings_no_overlap_v2
   * EXCLUDE constraint to guarantee atomically that no two active (not
   * cancelled) bookings for the same car can ever overlap — even under
   * concurrent requests. Throws a Postgres error (code 23P01) if the range
   * conflicts; the service layer translates that into a 409. Always
   * created "pending" — see confirmPayment below.
   */
  async create({ carId, startAt, endAt, totalPrice, customerName, customerPhone }) {
    const id = crypto.randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO bookings (id, car_id, start_at, end_at, total_price, customer_name, customer_phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [id, carId, startAt, endAt, totalPrice, customerName, customerPhone]
    );
    return toBookingDto(rows[0]);
  },

  async confirmPayment(id, { receiptUrl, receiptStoragePath }) {
    const { rows } = await pool.query(
      `UPDATE bookings
       SET status = 'booked', receipt_url = $2, receipt_storage_path = $3, payment_confirmed_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, receiptUrl, receiptStoragePath]
    );
    return rows[0] ? toBookingDto(rows[0]) : null;
  },

  /** Cancelling frees the car's time range immediately (the exclusion
   * constraint only applies to non-cancelled rows) and is excluded from
   * revenue everywhere it's calculated. */
  async cancel(id) {
    const { rows } = await pool.query(
      `UPDATE bookings SET status = 'cancelled', cancelled_at = now() WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0] ? toBookingDto(rows[0]) : null;
  },

  /**
   * AI Agent: bookings that have sat "pending" for at least `hours` and
   * haven't been notified about yet. Scoped to status = 'pending' and
   * agent_notified_at IS NULL so a booking is only ever pinged once, even
   * if the sweep runs again before the admin replies.
   */
  async findStalePending(hours) {
    const { rows } = await pool.query(
      `SELECT b.*, c.name AS car_name
       FROM bookings b
       JOIN cars c ON c.id = b.car_id
       WHERE b.status = 'pending'
         AND b.agent_notified_at IS NULL
         AND b.created_at <= now() - make_interval(hours => $1)
       ORDER BY b.created_at ASC`,
      [hours]
    );
    return rows.map((row) => ({ ...toBookingDto(row), carName: row.car_name }));
  },

  /** Marks a booking as having been pinged to the admin, and records which
   * Telegram message so the agent can edit it once the admin replies. */
  async markAgentNotified(id, telegramMessageId) {
    const { rows } = await pool.query(
      `UPDATE bookings SET agent_notified_at = now(), telegram_message_id = $2 WHERE id = $1 RETURNING *`,
      [id, telegramMessageId]
    );
    return rows[0] ? toBookingDto(rows[0]) : null;
  },

  /** Records what the admin tapped in Telegram ('confirmed' or
   * 'cancelled') — see bookings_agent_decision_check in migrate.js. */
  async setAgentDecision(id, decision) {
    const { rows } = await pool.query(`UPDATE bookings SET agent_decision = $2 WHERE id = $1 RETURNING *`, [
      id,
      decision,
    ]);
    return rows[0] ? toBookingDto(rows[0]) : null;
  },
};

module.exports = bookingRepository;
