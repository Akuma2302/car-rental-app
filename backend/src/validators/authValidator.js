function validateLoginPayload(body) {
  const errors = [];

  if (!body.username || typeof body.username !== 'string' || !body.username.trim()) {
    errors.push('username is required');
  }
  if (!body.password || typeof body.password !== 'string' || !body.password.trim()) {
    errors.push('password is required');
  }

  return errors;
}

module.exports = { validateLoginPayload };
