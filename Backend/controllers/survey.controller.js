const Survey = require('../models/Survey.model');
const User = require('../models/Users.model');

// Create a new survey
exports.createSurvey = async (req, res) => {
  try {
    console.log('Received survey creation request');
    console.log('Request body:', req.body);
    
    const { uid, title, description, status, reward_amount, target_responses, target_filter, expires_at } = req.body;

    // Find user by UID
    const user = await User.findOne({ uid });
    
    if (!user) {
      console.log('User not found with UID:', uid);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new survey
    const survey = await Survey.create({
      creator_id: user._id,
      title,
      description,
      status: status || 'draft',
      reward_amount,
      target_responses,
      current_responses: 0,
      target_filter: target_filter || {},
      expires_at: expires_at || null
    });

    console.log('Survey created successfully:', survey._id);

    res.json({
      success: true,
      message: 'Survey created successfully',
      survey
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating survey',
      error: error.message
    });
  }
};

// Get all surveys created by a user
exports.getUserSurveys = async (req, res) => {
  try {
    console.log('Received get user surveys request');
    const { uid } = req.params;

    // Find user by UID
    const user = await User.findOne({ uid });
    
    if (!user) {
      console.log('User not found with UID:', uid);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all surveys created by this user
    const surveys = await Survey.find({ creator_id: user._id })
      .sort({ created_at: -1 });

    console.log(`Found ${surveys.length} surveys for user ${uid}`);

    res.json({
      success: true,
      surveys
    });
  } catch (error) {
    console.error('Error fetching user surveys:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching user surveys',
      error: error.message
    });
  }
};

// Get a single survey by ID
exports.getSurveyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    res.json({
      success: true,
      survey
    });
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching survey',
      error: error.message
    });
  }
};
