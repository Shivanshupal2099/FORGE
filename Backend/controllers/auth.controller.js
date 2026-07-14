const User = require('../models/Users.model');
const Profile = require('../models/Profile.model');
const { markUserOnline, markUserOffline, getUserOnlineStatus } = require('../middlewares/activity.middleware');

exports.googleAuth = async (req, res) => {
    try {
        const { uid, email, name, picture } = req.body;

        if (!uid || !email) {
            return res.status(400).json({
                success: false,
                message: 'UID and email are required'
            });
        }

        // Find or create user
        let user = await User.findOne({ uid });

        if (!user) {
            // Create new user
            user = await User.create({
                uid,
                email,
                auth_provider: 'google',
                is_verified: true,
                last_login_at: new Date()
            });

            // Create initial profile for the user
            const nameParts = name ? name.trim().split(' ') : ['', ''];
            const first_name = nameParts[0] || '';
            const last_name = nameParts.slice(1).join(' ') || '';

            await Profile.create({
                uid,
                user_id: user._id,
                first_name,
                last_name,
                avatar_url: picture || null
            });

            // Mark user as online
            await markUserOnline(uid);
        } else {
            // Update last login and mark as online
            user.last_login_at = new Date();
            await user.save();
            await markUserOnline(uid);
        }

        res.json({
            success: true,
            message: 'Authentication successful',
            user: {
                uid: user.uid,
                email: user.email,
                _id: user._id
            }
        });
    } catch (error) {
        console.error('Error in googleAuth:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

exports.getCurrentUser = async (req, res) => {
    // req.user was added by authMiddleware

    res.json({
        success: true,
        user: req.user
    });
};

exports.syncUser = async (req, res) => {
    try {
        const { uid, email, name, picture } = req.body;

        if (!uid || !email) {
            return res.status(400).json({
                success: false,
                message: 'UID and email are required'
            });
        }

        // Find or create user
        let user = await User.findOne({ uid });

        if (!user) {
            // Create new user
            user = await User.create({
                uid,
                email,
                auth_provider: 'email',
                is_verified: true,
                last_login_at: new Date()
            });

            // Create initial profile for the user
            const nameParts = name ? name.trim().split(' ') : ['', ''];
            const first_name = nameParts[0] || '';
            const last_name = nameParts.slice(1).join(' ') || '';

            await Profile.create({
                uid,
                user_id: user._id,
                first_name,
                last_name,
                avatar_url: picture || null
            });

            // Mark user as online
            await markUserOnline(uid);
        } else {
            // Update last login and mark as online
            user.last_login_at = new Date();
            await user.save();
            await markUserOnline(uid);
        }

        res.json({
            success: true,
            message: 'User synced successfully',
            user: {
                uid: user.uid,
                email: user.email,
                _id: user._id
            }
        });
    } catch (error) {
        console.error('Error in syncUser:', error);
        res.status(500).json({
            success: false,
            message: 'User sync failed',
            error: error.message
        });
    }
};

exports.logout = async (req, res) => {
    try {
        // Get user from request (if authenticated)
        const uid = req.user?.uid;

        if (uid) {
            // Mark user as offline
            await markUserOffline(uid);
        }

        res.json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
};

exports.getUserStatus = async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: 'UID is required'
            });
        }

        const status = await getUserOnlineStatus(uid);

        res.json({
            success: true,
            status
        });
    } catch (error) {
        console.error('Error getting user status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user status',
            error: error.message
        });
    }
};