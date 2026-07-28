// Central error handler — anything thrown in a controller/service, or passed
// to next(err), lands here instead of leaking a raw stack trace to the client.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({ message: err.message || 'Internal server error' });
}

module.exports = errorHandler;
