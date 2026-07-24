const jwt = require('jsonwebtoken');
const User = require('../models/Users.model');
const Profile = require('../models/Profile.model');
const UserSession = require('../models/UserSession.model');
const { markUserOnline, markUserOffline, getUserOnlineStatus } = require('../middlewares/activity.middleware');

const signBackendToken = (user) => {
    return jwt.sign(
        {
            uid: user.uid,
            email: user.email,
            _id: user._id.toString(),
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

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
                is_verified: false,
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

        // Create user session
        const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        // Extract device info from request
        const deviceInfo = {
            userAgent: req.headers['user-agent'] || '',
            ip: req.ip || req.connection.remoteAddress || null
        };

        await UserSession.create({
            user_id: user._id,
            uid: user.uid,
            device_info: deviceInfo,
            ip_address: deviceInfo.ip,
            user_agent: deviceInfo.userAgent,
            expires_at: sessionExpiry,
            is_active: true
        });

        res.json({
            success: true,
            message: 'Authentication successful',
            user: {
                uid: user.uid,
                email: user.email,
                _id: user._id
            },
            token: signBackendToken(user)
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
                is_verified: false,
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

        // Create user session
        const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        // Extract device info from request
        const deviceInfo = {
            userAgent: req.headers['user-agent'] || '',
            ip: req.ip || req.connection.remoteAddress || null
        };

        await UserSession.create({
            user_id: user._id,
            uid: user.uid,
            device_info: deviceInfo,
            ip_address: deviceInfo.ip,
            user_agent: deviceInfo.userAgent,
            expires_at: sessionExpiry,
            is_active: true
        });

        res.json({
            success: true,
            message: 'User synced successfully',
            user: {
                uid: user.uid,
                email: user.email,
                _id: user._id
            },
            token: signBackendToken(user)
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
            
            // Deactivate all active sessions for this user
            await UserSession.updateMany(
                { uid: uid, is_active: true },
                { is_active: false }
            );
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

exports.deleteAccount = async (req, res) => {
    try {
        // Get user from authentication middleware
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const uid = user.uid;
        const email = user.email;
        const userId = user._id;

        // Find user by email
        const userToDelete = await User.findOne({ email });

        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete user's profile
        await Profile.deleteOne({ uid });

        // Delete user's location data
        const UserLocation = require('../models/UserLocation.model');
        await UserLocation.deleteOne({ uid });

        // Delete user's notifications
        const Notification = require('../models/Notification.model');
        await Notification.deleteMany({ user_id: userId });

        // Delete user's connections (as requester or receiver)
        const Connection = require('../models/Connection.model');
        await Connection.deleteMany({
            $or: [
                { requester_id: userId },
                { receiver_id: userId }
            ]
        });

        // Delete user's blocks (as blocker or blocked)
        const BlockedUser = require('../models/BlockUser.model');
        await BlockedUser.deleteMany({
            $or: [
                { blocker_id: userId },
                { blocked_id: userId }
            ]
        });

        // Delete user's event attendances
        const EventAttendee = require('../models/EventAttandes.model');
        await EventAttendee.deleteMany({ user_id: userId });

        // Delete user's created surveys
        const Survey = require('../models/Survey.model');
        await Survey.deleteMany({ creator_id: userId });

        // Delete user's push tokens
        const PushToken = require('../models/PushToken.model');
        await PushToken.deleteMany({ user_id: userId });

        // Delete user's reports (as reporter or reported user)
        const Report = require('../models/Reports.model');
        await Report.deleteMany({
            $or: [
                { reporter_id: userId },
                { reported_user_id: userId },
                { reviewed_by: userId }
            ]
        });

        // Delete user's transactions
        const Transaction = require('../models/Transaction.model');
        await Transaction.deleteMany({ user_id: userId });

        // Delete user's sessions
        const UserSession = require('../models/UserSession.model');
        await UserSession.deleteMany({ user_id: userId });

        // Mark user as offline before deletion
        await markUserOffline(uid);

        // Delete the user
        await User.deleteOne({ email });

        res.json({
            success: true,
            message: 'Account and all associated data deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account',
            error: error.message
        });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const activeUsers = await User.countDocuments({ 
            is_online: true 
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers
            }
        });
    } catch (error) {
        console.error('Error getting user stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user stats',
            error: error.message
        });
    }
};

// ===========================
// Session Management
// ===========================

exports.getUserSessions = async (req, res) => {
    try {
        const uid = req.user.uid;
        
        const sessions = await UserSession.find({ uid })
            .sort({ created_at: -1 })
            .limit(20);

        res.json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error('Error getting user sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get sessions',
            error: error.message
        });
    }
};

exports.revokeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const uid = req.user.uid;

        const session = await UserSession.findOne({ _id: sessionId, uid });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        await UserSession.findByIdAndUpdate(sessionId, { is_active: false });

        res.json({
            success: true,
            message: 'Session revoked successfully'
        });
    } catch (error) {
        console.error('Error revoking session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revoke session',
            error: error.message
        });
    }
};

exports.revokeOtherSessions = async (req, res) => {
    try {
        const uid = req.user.uid;
        const currentSessionId = req.body.currentSessionId;

        await UserSession.updateMany(
            { 
                uid: uid,
                is_active: true,
                _id: { $ne: currentSessionId }
            },
            { is_active: false }
        );

        res.json({
            success: true,
            message: 'Other sessions revoked successfully'
        });
    } catch (error) {
        console.error('Error revoking other sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revoke other sessions',
            error: error.message
        });
    }
};