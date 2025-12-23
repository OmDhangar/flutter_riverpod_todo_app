/**
 * Standardized response handler for consistent API responses
 */

class ResponseHandler {
  /**
   * Send success response
   */
  static success(res, data, message = null, statusCode = 200) {
    const response = {
      success: true,
      data
    };

    if (message) {
      response.message = message;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * Send error response
   */
  static error(res, error, statusCode = 500) {
    const response = {
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred'
      }
    };

    if (error.details) {
      response.error.details = error.details;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response (400)
   */
  static validationError(res, errors) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors
      }
    });
  }

  /**
   * Send not found response (404)
   */
  static notFound(res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message
      }
    });
  }

  /**
   * Send unauthorized response (401)
   */
  static unauthorized(res, message = 'Authentication required') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message
      }
    });
  }

  /**
   * Send forbidden response (403)
   */
  static forbidden(res, message = 'Access forbidden') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message
      }
    });
  }

  /**
   * Send paginated response
   */
  static paginated(res, data, pagination, message = null) {
    const response = {
      success: true,
      data: {
        ...data,
        pagination
      }
    };

    if (message) {
      response.message = message;
    }

    return res.status(200).json(response);
  }
}

module.exports = ResponseHandler;