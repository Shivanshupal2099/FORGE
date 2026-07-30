const Token = require('../models/Token.model');

// Get user's token balance and history
exports.getUserTokens = async (req, res) => {
  try {
    const { uid } = req.params;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    let tokenData = await Token.findOne({ uid });
    
    // Create token record if it doesn't exist
    if (!tokenData) {
      tokenData = await Token.create({
        uid,
        total_tokens: 0,
        token_history: []
      });
    }

    res.json({
      success: true,
      tokens: tokenData
    });
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user tokens',
      error: error.message
    });
  }
};

// Add tokens to user's account
exports.addTokens = async (req, res) => {
  try {
    const { uid, amount, source, description, survey_id } = req.body;
    
    if (!uid || !amount || !source || !description) {
      return res.status(400).json({
        success: false,
        message: 'uid, amount, source, and description are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    let tokenData = await Token.findOne({ uid });
    
    // Create token record if it doesn't exist
    if (!tokenData) {
      tokenData = await Token.create({
        uid,
        total_tokens: 0,
        token_history: []
      });
    }

    // Add tokens to total and history
    tokenData.total_tokens += amount;
    tokenData.token_history.push({
      amount,
      source,
      description,
      survey_id: survey_id || null,
      earned_at: new Date()
    });

    await tokenData.save();

    res.json({
      success: true,
      message: 'Tokens added successfully',
      tokens: tokenData
    });
  } catch (error) {
    console.error('Error adding tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding tokens',
      error: error.message
    });
  }
};

// Generate random token amount between 20-50
const generateRandomTokenAmount = () => {
  return Math.floor(Math.random() * (50 - 20 + 1)) + 20;
};

// Award tokens for survey submission
exports.awardSurveyTokens = async (uid, survey_id) => {
  try {
    if (!uid) {
      throw new Error('User ID is required');
    }

    const amount = generateRandomTokenAmount();
    const description = `Survey completion reward`;
    
    let tokenData = await Token.findOne({ uid });
    
    // Create token record if it doesn't exist
    if (!tokenData) {
      tokenData = await Token.create({
        uid,
        total_tokens: 0,
        token_history: []
      });
    }

    // Add tokens to total and history
    tokenData.total_tokens += amount;
    tokenData.token_history.push({
      amount,
      source: 'survey_submission',
      description,
      survey_id: survey_id || null,
      earned_at: new Date()
    });

    await tokenData.save();
    
    console.log(`Awarded ${amount} tokens to user ${uid} for survey ${survey_id}`);
    
    return { success: true, amount, total_tokens: tokenData.total_tokens };
  } catch (error) {
    console.error('Error awarding survey tokens:', error);
    throw error;
  }
};
