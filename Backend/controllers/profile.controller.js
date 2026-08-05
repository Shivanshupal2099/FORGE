const Profile = require('../models/Profile.model');
const User = require('../models/Users.model');
const UserLocation = require('../models/UserLocation.model');

exports.updateProfile = async (req, res) => {
  try {
    console.log('Received profile update request');
    console.log('Request body:', req.body);
    
    const { uid, name, bio, profession, domain, lookingFor, contactNumber, avatarUrl, gender, location, latitude, longitude, socialLinks, isServiceProvider, services, visibilitySettings } = req.body;

    // Use uid from request body
    const targetUid = uid;

    if (!targetUid) {
      console.log('UID is missing from request');
      return res.status(400).json({
        success: false,
        message: 'UID is required'
      });
    }

    console.log('Target UID:', targetUid);

    // Split name into first_name and last_name
    const nameParts = name ? name.trim().split(' ') : ['', ''];
    const first_name = nameParts[0] || 'User';
    const last_name = nameParts.slice(1).join(' ') || 'User';

    console.log('Name parts:', { first_name, last_name });

    // Find existing profile or create new one
    let profile = await Profile.findOne({ uid: targetUid });
    console.log('Existing profile found:', !!profile);

    if (profile) {
      // Update existing profile
      profile.first_name = first_name;
      profile.last_name = last_name;
      profile.bio = bio;
      profile.department = profession;
      profile.domain = domain || null;
      profile.contact_number = contactNumber;
      profile.looking_for = lookingFor || [];
      profile.avatar_url = avatarUrl;
      profile.gender = gender;
      profile.location = location;
      profile.latitude = latitude || null;
      profile.longitude = longitude || null;
      profile.is_service_provider = isServiceProvider || false;
      profile.services = services || [];
      
      // Update visibility settings if provided
      if (visibilitySettings) {
        profile.visibility_settings = {
          ...profile.visibility_settings.toObject ? profile.visibility_settings.toObject() : profile.visibility_settings,
          ...visibilitySettings
        };
      }
      
      // Don't update is_verified - this should only be set by payment system
      
      // Update social links based on titles
      if (socialLinks && Array.isArray(socialLinks)) {
        socialLinks.forEach(link => {
          const title = link.title ? link.title.toLowerCase() : '';
          if (title.includes('github') && link.url) {
            profile.github_url = link.url;
          } else if (title.includes('linkedin') && link.url) {
            profile.linkedin_url = link.url;
          } else if (title.includes('portfolio') && link.url) {
            profile.portfolio_url = link.url;
          }
        });
      }

      await profile.save();
      console.log('Profile updated successfully');

      // Handle location - save to UserLocation if coordinates provided, otherwise delete
      if (latitude && longitude) {
        await UserLocation.findOneAndUpdate(
          { uid: targetUid },
          {
            uid: targetUid,
            latitude,
            longitude,
            sharing_level: 'exact',
            updated_at: new Date()
          },
          { upsert: true, returnDocument: 'after' }
        );
        console.log('User location saved to UserLocation database');
      } else {
        // Clear location from UserLocation database
        const deletedLocation = await UserLocation.findOneAndDelete({ uid: targetUid });
        console.log('User location removed from UserLocation database:', deletedLocation);
        
        // Emit socket event for real-time update
        const io = req.app.get('io');
        const locationSocketHandler = req.app.get('locationSocketHandler');
        if (io && locationSocketHandler && deletedLocation) {
          console.log('Emitting location removed event for:', targetUid);
          locationSocketHandler.emitLocationRemoved({ locationId: deletedLocation._id, uid: targetUid });
        }
      }
    } else {
      console.log('Creating new profile');
      
      // Find or create user first
      let mongoUser = await User.findOne({ uid: targetUid });
      console.log('Existing user found:', !!mongoUser);
      
      if (!mongoUser) {
        console.log('Creating new user');
        // Create user if doesn't exist
        mongoUser = await User.create({
          uid: targetUid,
          email: targetUid, // Using email as uid
          auth_provider: 'google',
          is_verified: true,
          last_login_at: new Date()
        });
        console.log('User created:', mongoUser._id);
      }

      // Create new profile
      profile = await Profile.create({
        uid: targetUid,
        user_id: mongoUser._id,
        first_name,
        last_name,
        bio,
        department: profession,
        domain: domain || null,
        contact_number: contactNumber,
        looking_for: lookingFor || [],
        avatar_url: avatarUrl,
        gender: gender,
        location: location,
        latitude: latitude || null,
        longitude: longitude || null,
        is_service_provider: isServiceProvider || false,
        services: services || [],
        is_verified: false,
        payment_date: null,
        visibility_settings: visibilitySettings || {
          show_name: true,
          show_looking_for: true,
          show_services: true
        }
      });
      console.log('Profile created:', profile._id);

      // Handle location - save to UserLocation if coordinates provided, otherwise delete
      if (latitude && longitude) {
        await UserLocation.findOneAndUpdate(
          { uid: targetUid },
          {
            uid: targetUid,
            latitude,
            longitude,
            sharing_level: 'exact',
            updated_at: new Date()
          },
          { upsert: true, returnDocument: 'after' }
        );
        console.log('User location saved to UserLocation database');
      } else {
        // Clear location from UserLocation database
        const deletedLocation = await UserLocation.findOneAndDelete({ uid: targetUid });
        console.log('User location removed from UserLocation database:', deletedLocation);
        
        // Emit socket event for real-time update
        const io = req.app.get('io');
        const locationSocketHandler = req.app.get('locationSocketHandler');
        if (io && locationSocketHandler && deletedLocation) {
          console.log('Emitting location removed event for:', targetUid);
          locationSocketHandler.emitLocationRemoved({ locationId: deletedLocation._id, uid: targetUid });
        }
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'UID is required'
      });
    }
    
    let profile = await Profile.findOne({ uid: uid });

    // If profile doesn't exist, create one automatically
    if (!profile) {
      console.log('Profile not found, creating new profile for UID:', uid);
      
      // Find or create user first
      let mongoUser = await User.findOne({ uid: uid });
      
      if (!mongoUser) {
        console.log('Creating new user for UID:', uid);
        mongoUser = await User.create({
          uid: uid,
          email: uid,
          auth_provider: 'google',
          is_verified: true,
          last_login_at: new Date()
        });
      }

      // Create new profile with default values
      profile = await Profile.create({
        uid: uid,
        user_id: mongoUser._id,
        first_name: 'User',
        last_name: 'User',
        bio: '',
        department: '',
        contact_number: '',
        looking_for: [],
        avatar_url: '',
        gender: 'Other',
        location: '',
        latitude: null,
        longitude: null,
        is_service_provider: false,
        services: [],
        is_verified: mongoUser.is_verified || false,
        payment_date: mongoUser.payment_date || null,
      });
      console.log('New profile created:', profile._id);
    } else {
      // Profile exists - sync verification status from User model
      const mongoUser = await User.findOne({ uid: uid });
      if (mongoUser && mongoUser.is_verified !== profile.is_verified) {
        console.log('Syncing verification status from User to Profile');
        profile.is_verified = mongoUser.is_verified;
        await profile.save();
      }
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { uid } = req.params;
    const { latitude, longitude } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'UID is required'
      });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    console.log('Updating location for UID:', uid, 'to:', { latitude, longitude });

    // Find or create profile
    let profile = await Profile.findOne({ uid: uid });

    if (profile) {
      // Update existing profile
      profile.latitude = latitude;
      profile.longitude = longitude;
      await profile.save();
      console.log('Profile location updated successfully');
    } else {
      console.log('Profile not found, creating new profile for UID:', uid);
      
      // Find or create user first
      let mongoUser = await User.findOne({ uid: uid });
      
      if (!mongoUser) {
        console.log('Creating new user for UID:', uid);
        mongoUser = await User.create({
          uid: uid,
          email: uid,
          auth_provider: 'google',
          is_verified: true,
          last_login_at: new Date()
        });
      }

      // Create new profile with location
      profile = await Profile.create({
        uid: uid,
        user_id: mongoUser._id,
        first_name: 'User',
        last_name: 'User',
        bio: '',
        department: '',
        contact_number: '',
        looking_for: [],
        avatar_url: '',
        gender: 'Other',
        location: '',
        latitude: latitude,
        longitude: longitude,
        is_service_provider: false,
        services: [],
        is_verified: false,
        payment_date: null,
      });
      console.log('New profile created with location:', profile._id);
    }

    // Save location to UserLocation database
    await UserLocation.findOneAndUpdate(
      { uid: uid },
      {
        uid: uid,
        latitude,
        longitude,
        sharing_level: 'exact',
        updated_at: new Date()
      },
      { upsert: true, returnDocument: 'after' }
    );
    console.log('User location saved to UserLocation database');

    res.json({
      success: true,
      message: 'Location updated successfully',
      profile
    });
  } catch (error) {
    console.error('Error updating location:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error.message
    });
  }
};

// Clear user location from database
exports.clearLocation = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'UID is required'
      });
    }

    console.log('Clearing location for UID:', uid);

    // Clear location from Profile
    const profile = await Profile.findOne({ uid: uid });
    if (profile) {
      profile.location = '';
      profile.latitude = null;
      profile.longitude = null;
      await profile.save();
      console.log('Profile location cleared');
    }

    // Remove from UserLocation database
    await UserLocation.deleteOne({ uid: uid });
    console.log('User location removed from UserLocation database');

    res.json({
      success: true,
      message: 'Location cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing location:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing location',
      error: error.message
    });
  }
};

// Get nearby users based on location
exports.getNearbyUsers = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'UID is required'
      });
    }

    console.log('Fetching nearby users for UID:', uid);

    // Get current user's profile to get their location
    const currentUserProfile = await Profile.findOne({ uid: uid });
    
    if (!currentUserProfile || !currentUserProfile.latitude || !currentUserProfile.longitude) {
      return res.json({
        success: true,
        users: [],
        message: 'User location not set'
      });
    }

    const { latitude: userLat, longitude: userLon } = currentUserProfile;
    const searchRadiusKm = 50; // Search within 50km

    // Find all profiles with location data (excluding current user)
    const nearbyProfiles = await Profile.find({
      uid: { $ne: uid },
      latitude: { $ne: null },
      longitude: { $ne: null }
    }).lean();

    // Calculate distance for each user and filter by radius
    const nearbyUsers = nearbyProfiles
      .map(profile => {
        const distance = calculateDistance(userLat, userLon, profile.latitude, profile.longitude);
        return {
          ...profile,
          distance
        };
      })
      .filter(user => user.distance <= searchRadiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50); // Limit to 50 nearest users

    console.log(`Found ${nearbyUsers.length} nearby users within ${searchRadiusKm}km`);

    res.json({
      success: true,
      users: nearbyUsers
    });
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby users',
      error: error.message
    });
  }
};

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
