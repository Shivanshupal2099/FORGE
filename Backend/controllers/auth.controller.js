const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/Users.model');
const Profile = require('../models/Profile.model');
const UserSession = require('../models/UserSession.model');
const RefreshToken = require('../models/RefreshToken.model');
const UserLocation = require('../models/UserLocation.model');
const Connection = require('../models/Connection.model');
const Transaction = require('../models/Transaction.model');
const Survey = require('../models/Survey.model');
const Event = require('../models/Event.model');
const Notification = require('../models/Notification.model');
const Offer = require('../models/Offer.model');
const BlockedUser = require('../models/BlockUser.model');
const Report = require('../models/Reports.model');
const EventAttendee = require('../models/EventAttandes.model');
const PushToken = require('../models/PushToken.model');
const { markUserOnline, markUserOffline, getUserOnlineStatus } = require('../middlewares/activity.middleware');

const signAccessToken = (user) => {
    return jwt.sign(
        {
            uid: user.uid,
            email: user.email,
            _id: user._id.toString(),
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

const createRefreshToken = async (user, req) => {
    const token = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const deviceInfo = {
        userAgent: req.headers['user-agent'] || '',
        ip: req.ip || req.connection.remoteAddress || null
    };

    await RefreshToken.create({
        user_id: user._id,
        uid: user.uid,
        token,
        expires_at: expiresAt,
        ip_address: deviceInfo.ip,
        user_agent: deviceInfo.userAgent
    });

    return token;
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
            accessToken: signAccessToken(user),
            refreshToken: await createRefreshToken(user, req)
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
            accessToken: signAccessToken(user),
            refreshToken: await createRefreshToken(user, req)
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

            // Revoke all refresh tokens for this user
            await RefreshToken.updateMany(
                { uid: uid, revoked: false },
                { revoked: true, revoked_at: new Date() }
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

exports.getUserVerificationStatus = async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: 'UID is required'
            });
        }

        const user = await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            is_verified: user.is_verified
        });
    } catch (error) {
        console.error('Error getting user verification status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get verification status',
            error: error.message
        });
    }
};

exports.getUserVerificationStatusByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        console.log('Getting verification status for email:', email);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found for email:', email);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('User found, is_verified:', user.is_verified);
        res.json({
            success: true,
            is_verified: user.is_verified,
            email: user.email,
            exists: true
        });
    } catch (error) {
        console.error('Error getting user verification status by email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get verification status',
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

        // Delete user's profile (only this user's profile)
        await Profile.deleteOne({ uid });

        // Delete user's location data (only this user's location)
        await UserLocation.deleteOne({ uid });

        // Delete user's notifications (only this user's notifications)
        await Notification.deleteMany({ user_id: userId });

        // Delete user's connections (as requester or receiver - shared connections are removed)
        await Connection.deleteMany({
            $or: [
                { requester_id: userId },
                { receiver_id: userId }
            ]
        });

        // Delete user's blocks (as blocker only, not as blocked user to preserve other users' block lists)
        await BlockedUser.deleteMany({ blocker_id: userId });

        // Delete user's transactions (including verification payments - only this user's transactions)
        await Transaction.deleteMany({ user_id: userId });

        // Delete user's event attendances (only this user's attendances)
        await EventAttendee.deleteMany({ user_id: userId });

        // Delete user's created surveys (only this user's surveys)
        await Survey.deleteMany({ creator_id: userId });

        // Delete user's push tokens (only this user's tokens)
        await PushToken.deleteMany({ user_id: userId });

        // Delete user's reports (as reporter or reported user, but not as reviewer to preserve moderation history)
        await Report.deleteMany({
            $or: [
                { reporter_id: userId },
                { reported_user_id: userId }
            ]
        });

        // Delete user's sessions (only this user's sessions)
        await UserSession.deleteMany({ user_id: userId });

        // Mark user as offline before deletion
        await markUserOffline(uid);

        // Remove verification status and mark user as deleted
        await User.updateOne({ email }, { 
            deleted_at: new Date(),
            is_verified: false
        });

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
        // Count users who have profiles (active users, not deleted)
        const Profile = require('../models/Profile.model');
        const totalUsers = await Profile.countDocuments({});
        
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

exports.deleteAccount = async (req, res) => {
    try {
        const uid = req.user.uid;
        const email = req.user.email;

        console.log('Starting account deletion for:', email);

        // Get the user's ObjectId first
        const user = await User.findOne({ uid: uid });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userId = user._id;

        // Get all connections before deletion to notify other users
        const connections = await Connection.find({ $or: [{ requester_uid: uid }, { receiver_uid: uid }] });
        console.log('Found connections to remove:', connections.length);

        // Delete all user data from all collections (only this user's data)
        const deletionPromises = [];

        // 1. Mark user as deleted instead of deleting
        deletionPromises.push(User.updateOne({ uid: uid }, { 
            deleted_at: new Date(),
            is_verified: false
        }));

        // 2. Delete from Profile collection (also removes verification status)
        deletionPromises.push(Profile.deleteOne({ uid }));

        // 3. Delete from UserLocation collection
        deletionPromises.push(UserLocation.deleteOne({ uid }));

        // 4. Delete all connections where user is involved (shared connections are removed)
        deletionPromises.push(Connection.deleteMany({ $or: [{ requester_uid: uid }, { receiver_uid: uid }] }));

        // 5. Delete all transactions (including verification payments) - only this user's transactions
        deletionPromises.push(Transaction.deleteMany({ user_id: userId }));

        // 6. Delete all sessions (only this user's sessions)
        deletionPromises.push(UserSession.deleteMany({ uid }));

        // 7. Delete all refresh tokens (only this user's tokens)
        deletionPromises.push(RefreshToken.deleteMany({ uid }));

        // 8. Delete surveys created by user (only this user's surveys)
        deletionPromises.push(Survey.deleteMany({ creator_uid: uid }));

        // 9. Delete events created by user (only this user's events)
        deletionPromises.push(Event.deleteMany({ creator_uid: uid }));

        // 10. Delete notifications (only this user's notifications)
        deletionPromises.push(Notification.deleteMany({ user_id: userId }));

        // 11. Delete offers created by user (only this user's offers)
        deletionPromises.push(Offer.deleteMany({ created_by: userId }));

        // 12. Delete blocks where user is blocker (preserve other users' block lists)
        deletionPromises.push(BlockedUser.deleteMany({ blocker_id: userId }));

        // 13. Delete reports where user is reporter or reported (preserve moderation history)
        deletionPromises.push(Report.deleteMany({
            $or: [
                { reporter_id: userId },
                { reported_user_id: userId }
            ]
        }));

        // 14. Delete event attendances (only this user's attendances)
        deletionPromises.push(EventAttendee.deleteMany({ user_id: userId }));

        // 15. Delete push tokens (only this user's tokens)
        deletionPromises.push(PushToken.deleteMany({ user_id: userId }));

        // Execute all deletions
        await Promise.all(deletionPromises);

        // Emit socket events to notify other users about connection removal
        const io = req.app.get('io');
        if (io) {
            connections.forEach(connection => {
                const otherUserUid = connection.requester_uid === uid ? connection.receiver_uid : connection.requester_uid;
                console.log('Notifying user about connection removal:', otherUserUid);
                io.emit('connection:removed', { connectionId: connection._id, deletedUserUid: uid });
            });
        }

        console.log('All user data deleted successfully for:', email);

        res.json({
            success: true,
            message: 'Account deleted successfully'
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

// ===========================
// Refresh Token Management
// ===========================

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Find the refresh token in database
        const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

        if (!tokenDoc) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Check if token is valid
        if (!tokenDoc.isValid()) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token is expired or revoked'
            });
        }

        // Get user
        const user = await User.findById(tokenDoc.user_id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new access token
        const newAccessToken = signAccessToken(user);

        // Generate new refresh token and revoke old one
        const newRefreshToken = await createRefreshToken(user, req);
        await RefreshToken.findByIdAndUpdate(tokenDoc._id, {
            revoked: true,
            revoked_at: new Date()
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token',
            error: error.message
        });
    }
};