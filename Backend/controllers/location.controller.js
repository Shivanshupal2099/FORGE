const UserLocation = require('../models/UserLocation.model');

exports.getAllUserLocations = async (req, res) => {
  try {
    const locations = await UserLocation.find({ 
      sharing_level: { $ne: 'off' },
      $or: [
        { expires_at: null },
        { expires_at: { $gt: new Date() } }
      ]
    });

    res.json({
      success: true,
      locations
    });
  } catch (error) {
    console.error('Error fetching user locations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user locations',
      error: error.message
    });
  }
};

exports.saveUserLocation = async (req, res) => {
  try {
    const { uid, latitude, longitude, sharing_level, accuracy_meters, is_virtual, virtual_city } = req.body;

    if (!uid || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'uid, latitude, and longitude are required'
      });
    }

    // Find existing location or create new one
    const location = await UserLocation.findOneAndUpdate(
      { uid },
      {
        latitude,
        longitude,
        sharing_level: sharing_level || 'exact',
        accuracy_meters: accuracy_meters || null,
        is_virtual: is_virtual || false,
        virtual_city: virtual_city || null,
        updated_at: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Location saved successfully',
      location
    });
  } catch (error) {
    console.error('Error saving user location:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving user location',
      error: error.message
    });
  }
};
