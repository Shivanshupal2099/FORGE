const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { RateLimitError } = require('../utils/errors');

/**
 * General rate limiter for API routes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 10000, // Production: 200 requests per 15 minutes
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
 * Strict rate limiter for authentication routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 20 : 10000, // Production: 20 auth attempts per 15 minutes (increased from 5)
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
  keyGenerator: (req) => req.user?._id || ipKeyGenerator(req.ip),
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
  max: 1000, // Limit each user to 1000 survey responses per hour (increased for development)
  skip: (req) => {
    // Skip rate limiting for development
    return process.env.NODE_ENV !== 'production';
  },
  keyGenerator: (req) => req.user?._id || ipKeyGenerator(req.ip),
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
