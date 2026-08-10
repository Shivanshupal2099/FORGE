const PushSubscription = require('../models/PushSubscription.model');
const User = require('../models/Users.model');
const webpush = require('web-push');

// Configure web-push with VAPID keys
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (!publicVapidKey || !privateVapidKey) {
  console.warn('VAPID keys not found in environment variables. Push notifications will not work.');
} else {
  webpush.setVapidDetails(
    'mailto:forgeconnect@example.com',
    publicVapidKey,
    privateVapidKey
  );
}

// Helper function to detect device type from user agent
function detectDeviceType(userAgent) {
  if (!userAgent) return 'desktop';
  
  const ua = userAgent.toLowerCase();
  
  // iOS detection
  if (/iphone|ipad|ipod/.test(ua)) {
    return 'ios';
  }
  
  // Android detection
  if (/android/.test(ua)) {
    return 'android';
  }
  
  return 'desktop';
}

// Subscribe to push notifications
exports.subscribe = async (req, res) => {
  try {
    const { subscription, user_agent } = req.body;
    const userId = req.user.id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid subscription object' 
      });
    }

    // Detect device type
    const deviceType = detectDeviceType(user_agent || req.headers['user-agent']);

    // Allow all devices (mobile and desktop) to subscribe to push notifications
    // This enables PWA push notifications on desktop browsers

    // Check if subscription already exists for this user
    const existingSubscription = await PushSubscription.findOne({
      user_id: userId,
      'subscription.endpoint': subscription.endpoint
    });

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.subscription = subscription;
      existingSubscription.device_type = deviceType;
      existingSubscription.user_agent = user_agent || req.headers['user-agent'];
      existingSubscription.is_active = true;
      existingSubscription.last_used_at = new Date();
      await existingSubscription.save();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Subscription updated successfully' 
      });
    }

    // Create new subscription
    const newSubscription = new PushSubscription({
      user_id: userId,
      subscription,
      device_type,
      user_agent: user_agent || req.headers['user-agent']
    });

    await newSubscription.save();

    res.status(201).json({ 
      success: true, 
      message: 'Subscribed to push notifications successfully' 
    });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to subscribe to push notifications' 
    });
  }
};

// Unsubscribe from push notifications
exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user.id;

    if (!endpoint) {
      return res.status(400).json({ 
        success: false, 
        message: 'Endpoint is required' 
      });
    }

    await PushSubscription.findOneAndUpdate(
      { user_id: userId, 'subscription.endpoint': endpoint },
      { is_active: false }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Unsubscribed successfully' 
    });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to unsubscribe from push notifications' 
    });
  }
};

// Get user's active subscriptions
exports.getSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await PushSubscription.find({
      user_id: userId,
      is_active: true
    }).sort({ created_at: -1 });

    res.status(200).json({ 
      success: true, 
      subscriptions 
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get subscriptions' 
    });
  }
};

// Send push notification to a specific user
exports.sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    // Get active subscriptions for the user
    const subscriptions = await PushSubscription.find({
      user_id: userId,
      is_active: true
    });

    if (subscriptions.length === 0) {
      console.log(`No active subscriptions found for user ${userId}`);
      return;
    }

    const payload = JSON.stringify({
      title,
      body,
      data,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100]
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          
          // Update last_used_at
          sub.last_used_at = new Date();
          await sub.save();
          
          return { success: true, endpoint: sub.subscription.endpoint };
        } catch (error) {
          console.error('Failed to send push notification:', error);
          
          // Mark subscription as inactive if it's permanently invalid
          if (error.statusCode === 410 || error.statusCode === 404) {
            sub.is_active = false;
            await sub.save();
          }
          
          return { success: false, endpoint: sub.subscription.endpoint, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

    console.log(`Push notification sent to user ${userId}: ${successful} successful, ${failed} failed`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Clean up expired subscriptions (can be run periodically)
exports.cleanupExpiredSubscriptions = async () => {
  try {
    const expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() - 6); // 6 months ago

    const result = await PushSubscription.updateMany(
      {
        last_used_at: { $lt: expiredDate },
        is_active: true
      },
      { is_active: false }
    );

    console.log(`Cleaned up ${result.modifiedCount} expired push subscriptions`);
  } catch (error) {
    console.error('Error cleaning up expired subscriptions:', error);
  }
};

// Get VAPID public key for frontend
exports.getVapidPublicKey = (req, res) => {
  if (!publicVapidKey) {
    return res.status(500).json({ 
      success: false, 
      message: 'VAPID public key not configured' 
    });
  }

  res.status(200).json({ 
    success: true, 
    publicKey: publicVapidKey 
  });
};
