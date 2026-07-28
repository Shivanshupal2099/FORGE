const Event = require('../models/Event.model');

/**
 * Delete events that have ended (endAt date is in the past)
 * This function should be called periodically (e.g., daily)
 */
const deleteExpiredEvents = async () => {
  try {
    console.log('🗑️  Starting expired event cleanup...');

    const now = new Date();
    
    // Find all events where endAt is in the past
    const expiredEvents = await Event.find({
      endAt: { $lt: now }
    });

    if (expiredEvents.length === 0) {
      console.log('✅ No expired events found');
      return;
    }

    console.log(`📋 Found ${expiredEvents.length} expired events`);

    // Delete all expired events
    const deleteResult = await Event.deleteMany({
      endAt: { $lt: now }
    });

    console.log(`✅ Successfully deleted ${deleteResult.deletedCount} expired events`);
  } catch (error) {
    console.error('❌ Error during expired event cleanup:', error);
  }
};

module.exports = { deleteExpiredEvents };
