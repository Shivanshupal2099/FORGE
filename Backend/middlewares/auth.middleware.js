const jwt = require("jsonwebtoken");
const User = require("../models/Users.model");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log('Auth failed: No Bearer token in request from IP:', req.ip);
            return res.status(401).json({
                success: false,
                message: "Access token required"
            });
        }

        const token = authHeader.split(" ")[1];
        console.log('Auth attempt with token length:', token?.length, 'from IP:', req.ip);

        let user = null;
        let decoded = null;

        // Verify backend-issued JWT
        if (process.env.JWT_SECRET) {
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Check token expiration
                if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
                    console.log('Auth failed: Token expired for user:', decoded.email || decoded.uid);
                    return res.status(401).json({
                        success: false,
                        message: "Token has expired"
                    });
                }
                
                console.log('Backend JWT verified successfully for user:', decoded.email || decoded.uid);
                
                // Fetch full user from database to ensure we have the correct ObjectId
                if (decoded.email) {
                    user = await User.findOne({ email: decoded.email });
                } else if (decoded.uid) {
                    user = await User.findOne({ uid: decoded.uid });
                } else if (decoded._id) {
                    user = await User.findById(decoded._id);
                }
                
                if (user) {
                    req.user = user;
                    req.tokenType = 'backend';
                    return next();
                }
            } catch (jwtError) {
                console.log('Backend JWT verification failed:', jwtError.message);
                // Fall through to Supabase token handling
            }
        }

        // Verify Supabase session JWT when configured
        if (process.env.SUPABASE_JWT_SECRET) {
            try {
                decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
                const email = decoded.email?.toLowerCase();
                
                // Check token expiration
                if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
                    console.log('Auth failed: Supabase token expired for email:', email);
                    return res.status(401).json({
                        success: false,
                        message: "Token has expired"
                    });
                }
                
                console.log('Supabase JWT verified for email:', email);

                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        req.user = user;
                        req.tokenType = 'supabase';
                        return next();
                    } else {
                        console.log('User not found in database for email:', email);
                    }
                }
            } catch (supabaseJwtError) {
                console.log('Supabase JWT verification failed:', supabaseJwtError.message);
                // Fall through to error response
            }
        }

        // If no valid token was found
        console.log('Auth failed: No valid token found from IP:', req.ip);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    } catch (error) {
        console.log('Auth middleware error:', error.message, 'from IP:', req.ip);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;