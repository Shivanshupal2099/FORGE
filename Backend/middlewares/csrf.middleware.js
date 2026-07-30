const crypto = require('crypto');

/**
 * CSRF Protection Middleware
 * 
 * This middleware provides CSRF protection for cookie-based authentication.
 * Currently not active as the app uses Bearer token authentication.
 * Enable this middleware when implementing cookie-based auth.
 * 
 * Usage:
 * 1. Add to server.js: app.use(csrfProtection);
 * 2. Include CSRF token in responses for state-changing requests
 * 3. Validate CSRF token on POST/PUT/DELETE/PATCH requests
 */

const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const csrfProtection = (req, res, next) => {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Skip CSRF for API routes that use Bearer token authentication
    // Only apply CSRF to routes that will use cookie-based auth
    if (req.path.startsWith('/api/')) {
        return next();
    }

    const csrfToken = req.headers['x-csrf-token'];
    const sessionCSRFToken = req.session?.csrfToken;

    if (!csrfToken || !sessionCSRFToken || csrfToken !== sessionCSRFToken) {
        return res.status(403).json({
            success: false,
            message: 'CSRF token validation failed'
        });
    }

    next();
};

/**
 * Middleware to generate and attach CSRF token to response
 * Call this on routes that need CSRF token (e.g., login page)
 */
const attachCSRFToken = (req, res, next) => {
    if (!req.session) {
        return next();
    }
    
    if (!req.session.csrfToken) {
        req.session.csrfToken = generateCSRFToken();
    }
    
    res.locals.csrfToken = req.session.csrfToken;
    next();
};

module.exports = {
    csrfProtection,
    attachCSRFToken,
    generateCSRFToken
};
