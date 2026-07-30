const ID_RE = /^[a-z0-9-]+$/;
const TRANSMISSIONS = ['Automatic', 'Manual'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'EV'];
const CATEGORIES = ['SUV', 'Sedan', 'Luxury'];
const ACCENTS = ['amber', 'jade', 'dusk'];

/**
 * @param {object} body
 * @param {boolean} isUpdate - id isn't required/validated on updates (comes from the URL)
 */
function validateCarPayload(body, { isUpdate = false } = {}) {
  const errors = [];

  if (!isUpdate) {
    if (!body.id || typeof body.id !== 'string' || !ID_RE.test(body.id)) {
      errors.push('id is required and must be lowercase letters, numbers, and hyphens only');
    }
  }
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('name is required');
  }
  if (!body.tagline || typeof body.tagline !== 'string' || !body.tagline.trim()) {
    errors.push('tagline is required');
  }
  if (!Number.isInteger(body.seats) || body.seats <= 0) {
    errors.push('seats must be a positive whole number');
  }
  if (!TRANSMISSIONS.includes(body.transmission)) {
    errors.push(`transmission must be one of: ${TRANSMISSIONS.join(', ')}`);
  }
  if (!FUEL_TYPES.includes(body.fuelType)) {
    errors.push(`fuelType must be one of: ${FUEL_TYPES.join(', ')}`);
  }
  if (!CATEGORIES.includes(body.category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  }
  if (!Number.isInteger(body.pricePerHour) || body.pricePerHour <= 0) {
    errors.push('pricePerHour must be a positive whole number');
  }
  if (!Number.isInteger(body.pricePerHalfDay) || body.pricePerHalfDay <= 0) {
    errors.push('pricePerHalfDay must be a positive whole number');
  }
  if (!Number.isInteger(body.pricePerDay) || body.pricePerDay <= 0) {
    errors.push('pricePerDay must be a positive whole number');
  }
  if (!ACCENTS.includes(body.accent)) {
    errors.push(`accent must be one of: ${ACCENTS.join(', ')}`);
  }

  return errors;
}

module.exports = { validateCarPayload };
