/**
 * Car — no ORM here (data/cars.json is the source of truth), so this file
 * documents the shape every car record follows and is what repositories/
 * and services/ code against.
 *
 * @typedef {Object} Car
 * @property {string} id             - unique slug, e.g. "myvi"
 * @property {string} name           - display name, e.g. "Perodua Myvi"
 * @property {string} tagline        - short marketing line
 * @property {number} seats
 * @property {string} transmission   - "Automatic" | "Manual"
 * @property {number} pricePerDay    - in your local currency, whole number
 * @property {string} accent         - "amber" | "jade" | "dusk" (frontend theming hint)
 */

module.exports = {};
