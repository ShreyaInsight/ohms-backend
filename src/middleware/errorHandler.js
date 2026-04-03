const { HttpError } = require("../utils/httpError");

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? "Internal server error" : err.message;

  return res.status(status).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
