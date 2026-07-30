const { errorResponse } = require('../utils/responseHandler');
const { AppError } = require('../utils/errors');

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging (without sensitive data)
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    user: req.user?._id
  });

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return errorResponse(res, new AppError(`Validation Error: ${errors.join(', ')}`, 400));
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return errorResponse(res, new AppError(`Duplicate field value: ${field}`, 409));
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, new AppError('Invalid ID format', 400));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, new AppError('Invalid token', 401));
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, new AppError('Token expired', 401));
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    return errorResponse(res, err);
  }

  // Handle unknown errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, new AppError(message, statusCode));
};

/**
 * Async error wrapper for route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler
};
