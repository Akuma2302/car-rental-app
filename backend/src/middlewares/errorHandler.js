const multer = require('multer');

// Central error handler — anything thrown in a controller/service, or passed
// to next(err), lands here instead of leaking a raw stack trace to the client.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Each image must be 8MB or smaller'
        : err.code === 'LIMIT_FILE_COUNT'
          ? 'A car can have at most 8 images at once'
          : `Upload error: ${err.message}`;
    return res.status(400).json({ message });
  }

  const status = err.status || 500;
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({ message: err.message || 'Internal server error' });
}

module.exports = errorHandler;
