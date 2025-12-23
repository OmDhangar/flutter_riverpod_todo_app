const { AuthenticationError } = require('./errorHandler');
const logger = require('../config/logger');
const dotenv = require('dotenv');


dotenv.config();


/**
 * API Key authentication middleware
 */
const authenticate = (req, res, next) => {
  try {
    // Get API key from header
    const apiKey = req.get('X-API-Key') || req.get('Authorization')?.replace('Bearer ', '');

    // Check if API key is provided
    if (!apiKey) {
      logger.warn('Authentication failed: No API key provided', {
        ip: req.ip,
        path: req.path
      });
      
      throw new AuthenticationError('API key is required. Please provide X-API-Key header.');
    }

    // Validate API key
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
      logger.error('Server configuration error: API_KEY not set in environment');
      throw new Error('Server configuration error');
    }

    if (apiKey !== validApiKey) {
      logger.warn('Authentication failed: Invalid API key', {
        ip: req.ip,
        path: req.path
      });
      
      throw new AuthenticationError('Invalid API key');
    }

    // Authentication successful
    logger.debug('Authentication successful', {
      ip: req.ip,
      path: req.path
    });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no key provided
 */
const optionalAuth = (req, res, next) => {
  const apiKey = req.get('X-API-Key') || req.get('Authorization')?.replace('Bearer ', '');
  
  if (apiKey) {
    const validApiKey = process.env.API_KEY;
    
    if (apiKey === validApiKey) {
      req.authenticated = true;
    }
  }
  
  next();
};

module.exports = {
  authenticate,
  optionalAuth
};