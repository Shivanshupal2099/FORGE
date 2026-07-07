const Profile = require('../models/Profile.model');

exports.updateProfile = async (req, res) => {
  try {
    const { user } = req;
    const { userId, name, bio, profession, lookingFor, contactNumber, socialLinks } = req.body;

    // Use userId from request body if provided, otherwise use authenticated user
    const targetUserId = userId || user._id;

    // Split name into first_name and last_name
    const nameParts = name.trim().split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    // Find existing profile or create new one
    let profile = await Profile.findOne({ user_id: targetUserId });

    if (profile) {
      // Update existing profile
      profile.first_name = first_name;
      profile.last_name = last_name;
      profile.bio = bio;
      profile.department = profession;
      profile.contact_number = contactNumber;
      profile.looking_for = lookingFor || [];
      
      // Update social links based on titles
      socialLinks.forEach(link => {
        const title = link.title.toLowerCase();
        if (title.includes('github') && link.url) {
          profile.github_url = link.url;
        } else if (title.includes('linkedin') && link.url) {
          profile.linkedin_url = link.url;
        } else if (title.includes('portfolio') && link.url) {
          profile.portfolio_url = link.url;
        }
      });

      await profile.save();
    } else {
      // Create new profile
      profile = await Profile.create({
        user_id: targetUserId,
        first_name,
        last_name,
        bio,
        department: profession,
        contact_number: contactNumber,
        looking_for: lookingFor || [],
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { user } = req;
    const profile = await Profile.findOne({ user_id: user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
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
