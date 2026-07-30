/**
 * CarImage — one row per uploaded vehicle photo, ordered by sortOrder
 * (0 = cover image, used first in any carousel).
 *
 * @typedef {Object} CarImage
 * @property {number} id
 * @property {string} carId
 * @property {string} url            - public URL, safe to use directly in <img>
 * @property {string} storagePath    - bucket-relative path, needed to delete from Supabase Storage
 * @property {number} sortOrder
 */

module.exports = {};
