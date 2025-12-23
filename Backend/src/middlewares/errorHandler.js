const logger = require('../config/logger');

/**
 * Custom error classes
 */
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error
  logger.error('Error occurred', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';

  // Handle specific error types
  
  // PostgreSQL errors
  if (err.code?.startsWith('23')) {
    statusCode = 400;
    code = 'DATABASE_CONSTRAINT_ERROR';
    
    if (err.code === '23505') {
      message = 'Duplicate entry found';
    } else if (err.code === '23503') {
      message = 'Foreign key constraint violation';
    } else if (err.code === '23502') {
      message = 'Required field is missing';
    } else {
      message = 'Database constraint violation';
    }
  }
  
  // PostgreSQL connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    statusCode = 503;
    code = 'DATABASE_CONNECTION_ERROR';
    message = 'Database connection failed';
  }

  // UUID validation errors
  if (err.message?.includes('invalid input syntax for type uuid')) {
    statusCode = 400;
    code = 'INVALID_ID_FORMAT';
    message = 'Invalid ID format';
  }

  // Construct error response
  const errorResponse = {
    success: false,
    error: {
      code,
      message
    }
  };

  // Add details for validation errors
  if (err.details) {
    errorResponse.error.details = err.details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  AuthenticationError
};