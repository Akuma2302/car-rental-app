/**
 * Booking — backed by the `bookings` table (see src/config/migrate.js).
 * A booking is a time RANGE (startAt -> endAt), not a fixed slot — the
 * database's own EXCLUDE constraint guarantees no two bookings for the same
 * car can ever overlap, atomically, even under concurrent requests.
 *
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} carId
 * @property {string} startAt          - ISO timestamp
 * @property {string} endAt            - ISO timestamp
 * @property {number} totalPrice       - computed once at booking time (see services/pricingService.js)
 * @property {string} customerName
 * @property {string} customerPhone
 * @property {string} createdAt
 */

module.exports = {};
