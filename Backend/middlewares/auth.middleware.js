const jwt = require("jsonwebtoken");
const User = require("../models/Users.model");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access token required"
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify backend-issued JWT
        if (process.env.JWT_SECRET) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
                return next();
            } catch (jwtError) {
                // Fall through to Supabase token handling
            }
        }

        // Verify Supabase session JWT when configured
        if (process.env.SUPABASE_JWT_SECRET) {
            try {
                const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
                const email = decoded.email?.toLowerCase();

                if (email) {
                    const user = await User.findOne({ email });
                    if (user) {
                        req.user = user;
                        return next();
                    }
                }
            } catch (supabaseJwtError) {
                // Fall through to legacy token lookup
            }
        }

        // Legacy fallback: token stored as uid or email string
        let user = await User.findOne({ uid: token });

        if (!user) {
            user = await User.findOne({ email: token.toLowerCase() });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token or user not found"
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;