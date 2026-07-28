const xss = require('xss');

/**
 * Sanitize user input to prevent XSS attacks
 */
function sanitizeInput(data) {
  if (typeof data === 'string') {
    return xss(data, {
      whiteList: {}, // Allow no HTML tags by default
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(data[key]);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Sanitize MongoDB query to prevent NoSQL injection
 */
function sanitizeMongoQuery(query) {
  const forbiddenKeys = ['$where', '$ne', '$in', '$nin', '$exists', '$regex', '$expr'];
  
  function clean(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(clean);
    }
    
    const cleaned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key.startsWith('$') && !forbiddenKeys.includes(key)) {
          cleaned[key] = clean(obj[key]);
        } else if (!key.startsWith('$')) {
          cleaned[key] = clean(obj[key]);
        }
      }
    }
    return cleaned;
  }
  
  return clean(query);
}

/**
 * Validate and sanitize email
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return '';
  return email.toLowerCase().trim();
}

/**
 * Validate and sanitize MongoDB ObjectId
 */
function sanitizeObjectId(id) {
  if (!id || typeof id !== 'string') return null;
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) return null;
  return id;
}

module.exports = {
  sanitizeInput,
  sanitizeMongoQuery,
  sanitizeEmail,
  sanitizeObjectId
};
