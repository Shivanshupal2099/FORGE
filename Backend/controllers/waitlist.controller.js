const Waitlist = require('../models/Waitlist.model');

// Add user to waitlist
exports.addToWaitlist = async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    // Check if email already exists
    const existingUser = await Waitlist.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered on waitlist'
      });
    }

    // Create new waitlist entry
    const waitlistEntry = new Waitlist({
      email: email.toLowerCase(),
      phone: phone || null
    });

    await waitlistEntry.save();

    res.status(201).json({
      success: true,
      message: 'Successfully added to waitlist',
      data: {
        email: waitlistEntry.email,
        joined_at: waitlistEntry.joined_at
      }
    });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to waitlist',
      error: error.message
    });
  }
};

// Get waitlist stats (admin only)
exports.getWaitlistStats = async (req, res) => {
  try {
    const totalWaitlist = await Waitlist.countDocuments({ status: 'pending' });
    const invitedCount = await Waitlist.countDocuments({ status: 'invited' });
    const registeredCount = await Waitlist.countDocuments({ status: 'registered' });

    res.json({
      success: true,
      stats: {
        total: totalWaitlist,
        invited: invitedCount,
        registered: registeredCount
      }
    });
  } catch (error) {
    console.error('Error fetching waitlist stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching waitlist stats',
      error: error.message
    });
  }
};
