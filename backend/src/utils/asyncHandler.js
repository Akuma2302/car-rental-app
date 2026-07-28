// Wraps an async route handler so a rejected promise reaches Express's error
// middleware via next(err) instead of crashing the process unhandled.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
