exports.googleAuth = async (req, res) => {
    // Verify Google ID Token
    // Find or create user
    // Generate JWT
    // Send response
};

exports.getCurrentUser = async (req, res) => {
    // req.user was added by authMiddleware

    res.json({
        success: true,
        user: req.user
    });
};

exports.logout = async (req, res) => {
    // Remove refresh token or invalidate session

    res.json({
        success: true,
        message: "Logged out successfully"
    });
};