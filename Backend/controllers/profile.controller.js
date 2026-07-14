const Profile = require('../models/Profile.model');
const User = require('../models/Users.model');
const UserLocation = require('../models/UserLocation.model');

exports.updateProfile = async (req, res) => {
  try {
    console.log('Received profile update request');
    console.log('Request body:', req.body);
    
    const { uid, name, bio, profession, domain, lookingFor, contactNumber, avatarUrl, gender, location, latitude, longitude, socialLinks, isServiceProvider, services } = req.body;

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

      // Save location to UserLocation database if coordinates provided
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
          { upsert: true, new: true }
        );
        console.log('User location saved to UserLocation database');
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
      });
      console.log('Profile created:', profile._id);

      // Save location to UserLocation database if coordinates provided
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
          { upsert: true, new: true }
        );
        console.log('User location saved to UserLocation database');
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
        is_verified: false,
        payment_date: null,
      });
      console.log('New profile created:', profile._id);
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
