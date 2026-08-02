const UserLocation = require('../models/UserLocation.model');
const Profile = require('../models/Profile.model');
const User = require('../models/Users.model');

exports.getAllUserLocations = async (req, res) => {
  try {
    // Return all locations from UserLocation collection with profile data and user online status
    const locations = await UserLocation.find({});

    // Fetch profile data and user online status for each location
    const locationsWithProfiles = await Promise.all(
      locations.map(async (location) => {
        try {
          const profile = await Profile.findOne({ uid: location.uid });
          const user = await User.findOne({ uid: location.uid }).select('is_online');
          
          return {
            ...location.toObject(),
            profile: profile || null,
            is_online: user ? user.is_online : false
          };
        } catch (error) {
          console.error('Error fetching profile/user for:', location.uid, error);
          return {
            ...location.toObject(),
            profile: null,
            is_online: false
          };
        }
      })
    );

    res.json({
      success: true,
      locations: locationsWithProfiles
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
      { upsert: true, returnDocument: 'after' }
    );

    // Emit socket event for real-time update
    const io = req.app.get('io');
    const locationSocketHandler = req.app.get('locationSocketHandler');
    if (io && locationSocketHandler) {
      // Fetch profile data and user online status for the location
      const profile = await Profile.findOne({ uid });
      const user = await User.findOne({ uid }).select('is_online');
      const locationWithProfile = {
        ...location.toObject(),
        profile: profile || null,
        is_online: user ? user.is_online : false
      };
      locationSocketHandler.emitLocationUpdated(locationWithProfile);
    }

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

exports.deleteUserLocation = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'UID is required'
      });
    }

    console.log('Deleting location for UID:', uid);

    const deletedLocation = await UserLocation.findOneAndDelete({ uid: uid });

    if (!deletedLocation) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    console.log('Location deleted:', deletedLocation._id);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    const locationSocketHandler = req.app.get('locationSocketHandler');
    if (io && locationSocketHandler) {
      console.log('Emitting location removed event for:', uid);
      locationSocketHandler.emitLocationRemoved({ locationId: deletedLocation._id, uid: uid });
    }

    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user location:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user location',
      error: error.message
    });
  }
};
