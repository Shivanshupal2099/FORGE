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

        // Try to verify as JWT first
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (jwtError) {
            // If JWT verification fails, treat it as a Supabase token or email
            // Try to find user by treating token as uid (Supabase user id) or email
            let user = await User.findOne({ uid: token });
            
            // If not found by uid, try finding by email
            if (!user) {
                user = await User.findOne({ email: token });
            }
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token or user not found"
                });
            }
            
            req.user = user;
            return next();
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;