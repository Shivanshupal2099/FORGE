const Offer = require('../models/Offer.model');
const OfferReport = require('../models/OfferReport.model');
const Token = require('../models/Token.model');

// Get all active offers
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ is_active: true })
      .populate('created_by', 'username email')
      .sort({ created_at: -1 });
    
    res.json({
      success: true,
      offers
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offers',
      error: error.message
    });
  }
};

// Get a single offer by ID
exports.getOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const offer = await Offer.findById(id)
      .populate('created_by', 'username email');
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }
    
    res.json({
      success: true,
      offer
    });
  } catch (error) {
    console.error('Error fetching offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offer',
      error: error.message
    });
  }
};

// Create a new offer
exports.createOffer = async (req, res) => {
  try {
    const { title, description, max_redemptions } = req.body;
    const userId = req.user?._id || req.user?.id; // Handle both _id and id
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    // Check if user has already created an offer in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingOffer = await Offer.findOne({
      created_by: userId,
      created_at: { $gte: oneDayAgo }
    });
    
    if (existingOffer) {
      return res.status(429).json({
        success: false,
        message: 'You can only create one offer per day. Try again tomorrow.'
      });
    }
    
    const offer = await Offer.create({
      title,
      description,
      token_cost: 100, // Fixed at 100 tokens
      created_by: userId,
      max_redemptions: max_redemptions || null
    });
    
    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      offer
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating offer',
      error: error.message
    });
  }
};

// Update an offer
exports.updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, is_active, max_redemptions } = req.body;
    const userId = req.user?._id || req.user?.id;
    
    const offer = await Offer.findById(id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }
    
    // Check if user is the creator
    if (offer.created_by.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own offers'
      });
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (max_redemptions !== undefined) updateData.max_redemptions = max_redemptions;
    // Always keep token_cost at 100
    updateData.token_cost = 100;
    
    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Offer updated successfully',
      offer: updatedOffer
    });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating offer',
      error: error.message
    });
  }
};

// Delete an offer
exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    
    const offer = await Offer.findById(id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }
    
    // Check if user is the creator
    if (offer.created_by.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own offers'
      });
    }
    
    await Offer.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting offer',
      error: error.message
    });
  }
};

// Redeem an offer
exports.redeemOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const userEmail = req.user?.email;
    
    if (!userId || !userEmail) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    const offer = await Offer.findById(id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }
    
    if (!offer.is_active) {
      return res.status(400).json({
        success: false,
        message: 'This offer is no longer active'
      });
    }
    
    // Check if user has enough tokens OR is using their first free redemption
    const tokenData = await Token.findOne({ uid: userEmail });
    const hasEnoughTokens = tokenData && tokenData.total_tokens >= offer.token_cost;
    
    // Check if user has already redeemed any offer (count total redemptions)
    const allOffers = await Offer.find({ 'redeemed_by.user_id': userId });
    const totalRedemptions = allOffers.reduce((count, offer) => {
      return count + offer.redeemed_by.filter(r => r.user_id.toString() === userId.toString()).length;
    }, 0);
    
    const isFirstFreeRedemption = totalRedemptions === 0;
    
    // Allow redemption if: has tokens OR is verified OR is using first free redemption
    if (!hasEnoughTokens && !req.user.is_verified && !isFirstFreeRedemption) {
      return res.status(403).json({
        success: false,
        message: isFirstFreeRedemption 
          ? 'You have 1 free offer redemption available!' 
          : 'Earn tokens by giving survey or get verified'
      });
    }
    
    // Check if user has already redeemed this offer
    const alreadyRedeemed = offer.redeemed_by.some(
      redemption => redemption.user_id.toString() === userId.toString()
    );
    
    if (alreadyRedeemed) {
      return res.status(400).json({
        success: false,
        message: 'You have already redeemed this offer'
      });
    }
    
    // Check if max redemptions reached
    if (offer.max_redemptions && offer.redeemed_by.length >= offer.max_redemptions) {
      return res.status(400).json({
        success: false,
        message: 'This offer has reached maximum redemptions'
      });
    }
    
    // Deduct tokens only if user is not verified AND not using first free redemption
    let remainingTokens = tokenData ? tokenData.total_tokens : 0;
    
    if (!req.user.is_verified && !isFirstFreeRedemption) {
      if (!tokenData || tokenData.total_tokens < offer.token_cost) {
        return res.status(400).json({
          success: false,
          message: `Insufficient tokens. You need ${offer.token_cost} tokens to redeem this offer.`
        });
      }
      
      tokenData.total_tokens -= offer.token_cost;
      tokenData.token_history.push({
        amount: -offer.token_cost,
        source: 'offer_redemption',
        description: `Redeemed offer: ${offer.title}`,
        earned_at: new Date()
      });
      
      await tokenData.save();
      remainingTokens = tokenData.total_tokens;
    }
    
    // Add user to redeemed list
    offer.redeemed_by.push({
      user_id: userId,
      redeemed_at: new Date()
    });
    
    await offer.save();
    
    res.json({
      success: true,
      message: 'Offer redeemed successfully',
      remaining_tokens: remainingTokens
    });
  } catch (error) {
    console.error('Error redeeming offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error redeeming offer',
      error: error.message
    });
  }
};

// Get offers created by a specific user
exports.getUserOffers = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const offers = await Offer.find({ created_by: userId })
      .populate('created_by', 'username email')
      .sort({ created_at: -1 });
    
    res.json({
      success: true,
      offers
    });
  } catch (error) {
    console.error('Error fetching user offers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user offers',
      error: error.message
    });
  }
};

// Report an offer
exports.reportOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }
    
    const offer = await Offer.findById(id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }
    
    // Check if user has already reported this offer
    const existingReport = await OfferReport.findOne({
      offer_id: id,
      reported_by: userId
    });
    
    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this offer'
      });
    }
    
    // Create the report
    const report = await OfferReport.create({
      offer_id: id,
      reported_by: userId,
      reason: reason.trim()
    });
    
    res.status(201).json({
      success: true,
      message: 'Offer reported successfully',
      report
    });
  } catch (error) {
    console.error('Error reporting offer:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this offer'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error reporting offer',
      error: error.message
    });
  }
};