const Community = require('../models/Community.model');
const User = require('../models/Users.model');

// Create a custom community
exports.createCustomCommunity = async (req, res) => {
  try {
    console.log('Received custom community creation request');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);

    const { uid, category, max_members, description, tags, region_preference } = req.body;

    // Find user by UID
    const user = await User.findOne({ uid });

    if (!user) {
      console.log('User not found with UID:', uid);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Found user:', user._id, user.email);

    // Generate community name from category
    const communityName = `${category} Community`;

    // Create new custom community
    const community = await Community.create({
      creator_id: user._id,
      name: communityName,
      type: 'custom',
      category,
      description: description || '',
      max_members: max_members || 12,
      current_members: 1,
      members: [{
        user_id: user._id,
        joined_at: new Date(),
        role: 'creator'
      }],
      status: 'active',
      region_preference: region_preference || 'global',
      tags: tags || [],
      is_public: true,
      coming_soon: false
    });

    console.log('Custom community created successfully:', community._id);

    // Emit WebSocket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('community:created', {
        community_id: community._id,
        creator_id: user._id,
        category
      });
    }

    res.status(201).json({
      success: true,
      message: 'Custom community created successfully',
      data: {
        community_id: community._id,
        name: community.name,
        category: community.category,
        max_members: community.max_members,
        current_members: community.current_members,
        status: community.status
      }
    });

  } catch (error) {
    console.error('Error creating custom community:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already have a community with this name'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating custom community',
      error: error.message
    });
  }
};

// Join a predefined community
exports.joinCommunity = async (req, res) => {
  try {
    console.log('Received join community request');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);

    const { uid, community_id, community_type } = req.body;

    // Find user by UID
    const user = await User.findOne({ uid });

    if (!user) {
      console.log('User not found with UID:', uid);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Found user:', user._id, user.email);

    // If joining a predefined community type, find or create it
    let community;
    if (community_type) {
      community = await Community.findOne({
        type: 'predefined',
        category: community_type,
        status: 'active'
      });

      // If community doesn't exist, create it
      if (!community) {
        community = await Community.create({
          creator_id: user._id,
          name: `${community_type} Community`,
          type: 'predefined',
          category: community_type,
          description: `Join the ${community_type} community to connect with like-minded people`,
          max_members: 12,
          current_members: 0,
          members: [],
          status: 'active',
          region_preference: 'global',
          tags: [community_type],
          is_public: true,
          coming_soon: false
        });
        console.log('Created new predefined community:', community._id);
      }
    } else if (community_id) {
      // Join specific community by ID
      community = await Community.findById(community_id);

      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either community_id or community_type is required'
      });
    }

    // Check if user is already a member
    const isMember = community.members.some(
      member => member.user_id.toString() === user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this community'
      });
    }

    // Check if community is full
    if (community.current_members >= community.max_members) {
      community.status = 'full';
      await community.save();
      
      return res.status(400).json({
        success: false,
        message: 'Community is full'
      });
    }

    // Add user to community
    community.members.push({
      user_id: user._id,
      joined_at: new Date(),
      role: 'member'
    });
    community.current_members += 1;

    // Update status if full
    if (community.current_members >= community.max_members) {
      community.status = 'full';
    }

    await community.save();

    console.log('User joined community successfully:', community._id);

    // Emit WebSocket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('community:joined', {
        community_id: community._id,
        user_id: user._id,
        current_members: community.current_members
      });
    }

    res.status(200).json({
      success: true,
      message: 'Joined community successfully',
      data: {
        community_id: community._id,
        name: community.name,
        category: community.category,
        current_members: community.current_members,
        max_members: community.max_members,
        status: community.status
      }
    });

  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining community',
      error: error.message
    });
  }
};

// Fetch user's communities
exports.getUserCommunities = async (req, res) => {
  try {
    console.log('Received get user communities request');
    console.log('Request user:', req.user);

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

    console.log('Found user:', user._id, user.email);

    // Find all communities where user is a member
    const communities = await Community.find({
      'members.user_id': user._id,
      status: { $in: ['active', 'full'] }
    }).populate('members.user_id', 'uid email full_name')
      .sort({ created_at: -1 });

    console.log(`Found ${communities.length} communities for user`);

    res.status(200).json({
      success: true,
      data: communities.map(community => ({
        community_id: community._id,
        name: community.name,
        type: community.type,
        category: community.category,
        description: community.description,
        max_members: community.max_members,
        current_members: community.current_members,
        status: community.status,
        region_preference: community.region_preference,
        tags: community.tags,
        is_public: community.is_public,
        members: community.members.map(member => ({
          user_id: member.user_id._id,
          uid: member.user_id.uid,
          email: member.user_id.email,
          full_name: member.user_id.full_name,
          role: member.role,
          joined_at: member.joined_at
        })),
        created_at: community.created_at
      }))
    });

  } catch (error) {
    console.error('Error fetching user communities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user communities',
      error: error.message
    });
  }
};

// Fetch all available communities (for discovery)
exports.getAllCommunities = async (req, res) => {
  try {
    console.log('Received get all communities request');

    const { category, type, page = 1, limit = 20 } = req.query;

    const query = {
      is_public: true,
      status: { $in: ['active', 'full'] }
    };

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    const communities = await Community.find(query)
      .populate('creator_id', 'uid email full_name')
      .populate('members.user_id', 'uid email full_name')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Community.countDocuments(query);

    console.log(`Found ${communities.length} communities`);

    res.status(200).json({
      success: true,
      data: communities.map(community => ({
        community_id: community._id,
        name: community.name,
        type: community.type,
        category: community.category,
        description: community.description,
        max_members: community.max_members,
        current_members: community.current_members,
        status: community.status,
        region_preference: community.region_preference,
        tags: community.tags,
        creator: {
          user_id: community.creator_id._id,
          uid: community.creator_id.uid,
          email: community.creator_id.email,
          full_name: community.creator_id.full_name
        },
        created_at: community.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching all communities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching communities',
      error: error.message
    });
  }
};

// Leave a community
exports.leaveCommunity = async (req, res) => {
  try {
    console.log('Received leave community request');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);

    const { uid, community_id } = req.body;

    // Find user by UID
    const user = await User.findOne({ uid });

    if (!user) {
      console.log('User not found with UID:', uid);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find community
    const community = await Community.findById(community_id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is the creator
    if (community.creator_id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Creator cannot leave their own community'
      });
    }

    // Remove user from members
    const memberIndex = community.members.findIndex(
      member => member.user_id.toString() === user._id.toString()
    );

    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this community'
      });
    }

    community.members.splice(memberIndex, 1);
    community.current_members -= 1;

    // Update status if no longer full
    if (community.status === 'full' && community.current_members < community.max_members) {
      community.status = 'active';
    }

    await community.save();

    console.log('User left community successfully:', community._id);

    // Emit WebSocket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('community:left', {
        community_id: community._id,
        user_id: user._id,
        current_members: community.current_members
      });
    }

    res.status(200).json({
      success: true,
      message: 'Left community successfully'
    });

  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving community',
      error: error.message
    });
  }
};
