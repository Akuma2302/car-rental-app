/**
 * Booking
 *
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} carId
 * @property {string} date            - "YYYY-MM-DD"
 * @property {string} time            - "HH:00" (24h)
 * @property {string} customerName
 * @property {string} customerPhone
 * @property {string} createdAt       - ISO timestamp, set automatically
 */

/**
 * @param {Omit<Booking, 'createdAt'>} fields
 * @returns {Booking}
 */
function createBooking({ id, carId, date, time, customerName, customerPhone }) {
  return {
    id,
    carId,
    date,
    time,
    customerName,
    customerPhone,
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createBooking };
