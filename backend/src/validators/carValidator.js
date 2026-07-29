const ID_RE = /^[a-z0-9-]+$/;

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
  if (!body.transmission || typeof body.transmission !== 'string') {
    errors.push('transmission is required');
  }
  if (!Number.isInteger(body.pricePerDay) || body.pricePerDay <= 0) {
    errors.push('pricePerDay must be a positive whole number');
  }
  if (!['amber', 'jade', 'dusk'].includes(body.accent)) {
    errors.push('accent must be one of: amber, jade, dusk');
  }

  return errors;
}

module.exports = { validateCarPayload };
