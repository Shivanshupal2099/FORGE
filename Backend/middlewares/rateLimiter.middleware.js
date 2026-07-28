const rateLimit = require('express-rate-limit');
const { RateLimitError } = require('../utils/errors');

/**
 * General rate limiter for API routes - DISABLED for development
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Very high limit for development
  skip: (req) => {
    // Skip rate limiting for development
    return process.env.NODE_ENV !== 'production';
  },
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many requests, please try again later'));
  }
});

/**
 * Strict rate limiter for authentication routes - DISABLED for development
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Very high limit for development
  skip: (req) => {
    // Skip rate limiting for development
    return process.env.NODE_ENV !== 'production';
  },
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many authentication attempts, please try again later'));
  }
});

/**
 * Rate limiter for survey creation
 */
const surveyCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 survey creations per hour
  keyGenerator: (req) => req.user?._id || req.ip,
  message: 'Too many surveys created, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many surveys created, please try again later'));
  }
});

/**
 * Rate limiter for survey responses
 */
const surveyResponseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each user to 50 survey responses per hour
  keyGenerator: (req) => req.user?._id || req.ip,
  message: 'Too many survey responses, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many survey responses, please try again later'));
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  surveyCreationLimiter,
  surveyResponseLimiter
};
