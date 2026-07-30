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

        // Verify backend-issued JWT
        if (process.env.JWT_SECRET) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log('Backend JWT verified successfully for user:', decoded.email || decoded.uid);
                req.user = decoded;
                return next();
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
                    const user = await User.findOne({ email });
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
        let user = await User.findOne({ uid: token });

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