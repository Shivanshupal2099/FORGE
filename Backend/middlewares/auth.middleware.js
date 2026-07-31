const jwt = require("jsonwebtoken");
const User = require("../models/Users.model");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log('Auth failed: No Bearer token in request');
            return res.status(401).json({
                success: false,
                message: "Access token required"
            });
        }

        const token = authHeader.split(" ")[1];
        console.log('Auth attempt with token length:', token?.length);

        let user = null;

        // Verify backend-issued JWT
        if (process.env.JWT_SECRET) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
                const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
                const email = decoded.email?.toLowerCase();
                console.log('Supabase JWT verified for email:', email);

                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        req.user = user;
                        return next();
                    } else {
                        console.log('User not found in database for email:', email);
                    }
                }
            } catch (supabaseJwtError) {
                console.log('Supabase JWT verification failed:', supabaseJwtError.message);
                // Fall through to legacy token lookup
            }
        }

        // Legacy fallback: token stored as uid or email string
        user = await User.findOne({ uid: token });

        if (!user) {
            user = await User.findOne({ email: token.toLowerCase() });
        }

        if (!user) {
            console.log('Auth failed: User not found for token');
            return res.status(401).json({
                success: false,
                message: "Invalid token or user not found"
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        console.log('Auth middleware error:', error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;