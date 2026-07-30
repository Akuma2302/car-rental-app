/**
 * Car — no ORM here (Postgres is queried directly via src/repositories),
 * this file documents the shape every car record follows.
 *
 * @typedef {Object} Car
 * @property {string} id             - unique slug, e.g. "myvi"
 * @property {string} name           - display name, e.g. "Perodua Myvi"
 * @property {string} tagline        - short marketing line
 * @property {number} seats          - typically 5 or 7
 * @property {string} transmission   - "Automatic" | "Manual"
 * @property {string} fuelType       - "Petrol" | "Diesel" | "Hybrid" | "EV"
 * @property {string} category       - "SUV" | "Sedan" | "Luxury"
 * @property {number} pricePerHour
 * @property {number} pricePerHalfDay
 * @property {number} pricePerDay
 * @property {string} accent         - "amber" | "jade" | "dusk" (frontend theming hint)
 * @property {{id:number, url:string, sortOrder:number}[]} [images] - only present when fetched with images joined in
 */

module.exports = {};
