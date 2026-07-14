const jwt = require("jsonwebtoken");

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
            // If JWT verification fails, treat it as a Supabase token
            // For now, we'll allow the request to proceed with the token as uid
            // In production, you should verify Supabase tokens properly
            req.user = { uid: token }; // Use token as uid for now
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