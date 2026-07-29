/**
 * Booking — backed by the `bookings` table (see src/config/migrate.js for
 * the schema). Row creation and id/timestamp generation now happen in
 * src/repositories/bookingRepository.js, which talks to Postgres directly.
 *
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} carId
 * @property {string} date            - "YYYY-MM-DD"
 * @property {string} time            - "HH:00" (24h)
 * @property {string} customerName
 * @property {string} customerPhone
 * @property {string} createdAt
 */

module.exports = {};
