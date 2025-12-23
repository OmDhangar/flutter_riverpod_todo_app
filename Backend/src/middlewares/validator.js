const { ZodError } = require('zod');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../config/logger');

/**
 * Middleware factory for Zod schema validation
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      let dataToValidate;

      // Determine which part of the request to validate
      switch (source) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }

      // Validate using Zod schema
      const validated = schema.parse(dataToValidate);

      // Replace request data with validated and transformed data
      switch (source) {
        case 'body':
          req.body = validated;
          break;
        case 'query':
          req.query = validated;
          break;
        case 'params':
          req.params = validated;
          break;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors for user-friendly response
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Validation error', {
          source,
          errors: formattedErrors,
          path: req.path
        });

        return ResponseHandler.validationError(res, formattedErrors);
      }

      // If it's not a Zod error, pass to error handler
      next(error);
    }
  };
};

module.exports = validate;