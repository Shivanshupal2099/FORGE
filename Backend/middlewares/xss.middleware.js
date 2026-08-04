const xss = require('xss');

/**
 * XSS Protection Middleware
 * Sanitizes request body, query, and params to prevent XSS attacks
 */
const xssProtection = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => sanitize(item));
    }

    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === 'string') {
          // Sanitize string values
          sanitized[key] = xss(obj[key], {
            whiteList: {
              // Allow safe HTML tags for rich text content
              a: ['href', 'title', 'target'],
              b: [],
              i: [],
              em: [],
              strong: [],
              p: [],
              br: [],
              ul: [],
              ol: [],
              li: [],
            },
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script']
          });
        } else if (typeof obj[key] === 'object') {
          sanitized[key] = sanitize(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
    return sanitized;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitize(req.body);
  }

  // Sanitize request query
  if (req.query) {
    req.query = sanitize(req.query);
  }

  // Sanitize request params
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

module.exports = xssProtection;
