const Offer = require('../models/Offer.model');

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
    const { title, description, token_cost, max_redemptions, category } = req.body;
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
    
    const offer = await Offer.create({
      title,
      description,
      token_cost: token_cost || 100,
      created_by: userId,
      max_redemptions: max_redemptions || null,
      category: category || 'other'
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
    const { title, description, token_cost, is_active, max_redemptions, category } = req.body;
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
    if (token_cost !== undefined) updateData.token_cost = token_cost;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (max_redemptions !== undefined) updateData.max_redemptions = max_redemptions;
    if (category !== undefined) updateData.category = category;
    
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
    
    // Check if user is verified
    if (!req.user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'You must be verified to redeem offers. Please complete your profile verification.'
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
    
    // Check if user has enough tokens
    const tokenData = await Token.findOne({ uid: userEmail });
    
    if (!tokenData || tokenData.total_tokens < offer.token_cost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient tokens. You need ${offer.token_cost} tokens to redeem this offer.`
      });
    }
    
    // Deduct tokens
    tokenData.total_tokens -= offer.token_cost;
    tokenData.token_history.push({
      amount: -offer.token_cost,
      source: 'offer_redemption',
      description: `Redeemed offer: ${offer.title}`,
      earned_at: new Date()
    });
    
    await tokenData.save();
    
    // Add user to redeemed list
    offer.redeemed_by.push({
      user_id: userId,
      redeemed_at: new Date()
    });
    
    await offer.save();
    
    res.json({
      success: true,
      message: 'Offer redeemed successfully',
      remaining_tokens: tokenData.total_tokens
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