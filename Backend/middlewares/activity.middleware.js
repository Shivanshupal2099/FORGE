const User = require('../models/Users.model');
const UserSession = require('../models/UserSession.model');

// Configuration
const ACTIVITY_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Activity tracking middleware
 * Updates user's last_activity_at and last_seen_at timestamps
 * on every authenticated request
 */
const activityMiddleware = async (req, res, next) => {
  try {
    // Only track activity for authenticated requests
    if (!req.user || !req.user.uid) {
      return next();
    }

    const uid = req.user.uid;
    const now = new Date();

    // Update user activity in the background (non-blocking)
    setImmediate(async () => {
      try {
        const user = await User.findOne({ uid });
        
        if (user) {
          // Update last_activity_at
          user.last_activity_at = now;
          
          // Update last_seen_at
          user.last_seen_at = now;
          
          // Mark user as online
          if (!user.is_online) {
            user.is_online = true;
          }
          
          await user.save();
          
          // Update session activity if session exists
          await UserSession.findOneAndUpdate(
            { 
              uid: uid,
              is_active: true,
              expires_at: { $gt: now }
            },
            { 
              last_activity_at: now,
              updated_at: now
            }
          );
        }
      } catch (error) {
        console.error('Error updating user activity:', error);
      }
    });

    next();
  } catch (error) {
    console.error('Activity middleware error:', error);
    next(); // Continue even if activity tracking fails
  }
};

/**
 * Middleware to mark user as online on login
 */
const markUserOnline = async (uid) => {
  try {
    const user = await User.findOne({ uid });
    
    if (user) {
      user.is_online = true;
      user.last_login_at = new Date();
      user.last_activity_at = new Date();
      user.last_seen_at = new Date();
      await user.save();
      
      console.log(`User ${uid} marked as online`);
    }
  } catch (error) {
    console.error('Error marking user online:', error);
  }
};

/**
 * Middleware to mark user as offline on logout
 */
const markUserOffline = async (uid) => {
  try {
    const user = await User.findOne({ uid });
    
    if (user) {
      user.is_online = false;
      user.last_seen_at = new Date();
      await user.save();
      
      // Deactivate all sessions for this user
      await UserSession.updateMany(
        { uid: uid },
        { is_active: false }
      );
      
      console.log(`User ${uid} marked as offline`);
    }
  } catch (error) {
    console.error('Error marking user offline:', error);
  }
};

/**
 * Scheduled task to mark inactive users as offline
 * Should be run periodically (e.g., every minute)
 */
const markInactiveUsersOffline = async () => {
  try {
    const inactivityThreshold = new Date(Date.now() - INACTIVITY_TIMEOUT);
    
    const result = await User.updateMany(
      {
        is_online: true,
        last_activity_at: { $lt: inactivityThreshold }
      },
      {
        is_online: false,
        last_seen_at: new Date()
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`Marked ${result.modifiedCount} inactive users as offline`);
    }
  } catch (error) {
    console.error('Error marking inactive users offline:', error);
  }
};

/**
 * Get user online status
 */
const getUserOnlineStatus = async (uid) => {
  try {
    const user = await User.findOne({ uid }).select('is_online last_activity_at last_seen_at');
    
    if (!user) {
      return { is_online: false, last_activity_at: null, last_seen_at: null };
    }
    
    // Double-check if user should be marked as offline
    if (user.is_online && user.last_activity_at) {
      const inactivityThreshold = new Date(Date.now() - INACTIVITY_TIMEOUT);
      if (user.last_activity_at < inactivityThreshold) {
        // Update user status
        user.is_online = false;
        user.last_seen_at = new Date();
        await user.save();
      }
    }
    
    return {
      is_online: user.is_online,
      last_activity_at: user.last_activity_at,
      last_seen_at: user.last_seen_at
    };
  } catch (error) {
    console.error('Error getting user online status:', error);
    return { is_online: false, last_activity_at: null, last_seen_at: null };
  }
};

module.exports = {
  activityMiddleware,
  markUserOnline,
  markUserOffline,
  markInactiveUsersOffline,
  getUserOnlineStatus,
  ACTIVITY_UPDATE_INTERVAL,
  INACTIVITY_TIMEOUT
};
