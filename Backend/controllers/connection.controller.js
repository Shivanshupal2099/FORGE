const Connection = require('../models/Connection.model');
const Profile = require('../models/Profile.model');
const User = require('../models/Users.model');
const mongoose = require('mongoose');

// Helper function to validate and convert string to ObjectId
function validateAndConvertObjectId(id, fieldName = 'ID') {
  if (!id) {
    console.log(`${fieldName} is missing`);
    return null;
  }
  
  // If already an ObjectId, return it
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }
  
  // If it's a string, try to convert to ObjectId
  if (typeof id === 'string') {

    if (mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);                 
    } else {
      console.log(`${fieldName} is not a valid ObjectId:`, id);
      return null;
    }
  }
  
  console.log(`${fieldName} has invalid type:`, typeof id);
  return null;
}

// Helper function to resolve username/uid to MongoDB ObjectId
async function resolveUserToObjectId(identifier) {
  if (!identifier) {
    console.log('User identifier is missing');
    return null;
  }
  
  // If already an ObjectId, return it
  if (identifier instanceof mongoose.Types.ObjectId) {
    return identifier;
  }
  
  // If it's a valid ObjectId string, convert and return
  if (typeof identifier === 'string' && mongoose.Types.ObjectId.isValid(identifier)) {
    return new mongoose.Types.ObjectId(identifier);
  }
  
  // Otherwise, try to find user by uid or email
  console.log('Resolving user identifier to ObjectId:', identifier);
  const user = await User.findOne({ 
    $or: [
      { uid: identifier },
      { email: identifier }
    ]
  });
  
  if (user) {
    console.log('Resolved user identifier to ObjectId:', user._id);
    return user._id;
  }
  
  console.log('Could not resolve user identifier to ObjectId:', identifier);
  return null;
}

async function profilesFor(users) {
  const ids = users.map((user) => user._id.toString()).filter(Boolean);
  const profiles = await Profile.find({ user_id: { $in: ids } }).lean();
  return new Map(profiles.map((profile) => [profile.user_id.toString(), profile]));
}

function presentUser(user, profile) {
  const firstName = profile?.first_name || user.email?.split('@')[0] || 'ForgeConnect user';
  const lastName = profile?.last_name || '';
  return {
    id: user._id.toString(),
    uid: user.uid,
    email: user.email,
    name: `${firstName} ${lastName}`.trim(),
    avatar_url: profile?.avatar_url || null,
    profession: profile?.department || '',
    isOnline: Boolean(user.is_online),
    lastSeenAt: user.last_seen_at || null
  };
}

async function decorateConnections(connections, currentUserId) {
  const ids = [...new Set(connections.flatMap((connection) => [
    connection.requester_id.toString(),
    connection.receiver_id.toString()
  ]))];
  const users = await User.find({ _id: { $in: ids } }).lean();
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));
  const profileByUserId = await profilesFor(users);

  return connections.map((connection) => {
    const requesterId = connection.requester_id.toString();
    const receiverId = connection.receiver_id.toString();
    const otherId = requesterId === currentUserId ? receiverId : requesterId;
    const other = usersById.get(otherId);
    const requester = usersById.get(requesterId);

    return {
      ...connection,
      collaborator: other ? presentUser(other, profileByUserId.get(otherId)) : null,
      requester_profile: requester ? {
        ...profileByUserId.get(requesterId),
        name: presentUser(requester, profileByUserId.get(requesterId)).name
      } : null
    };
  });
}

exports.createRequest = async (req, res) => {
  try {
    const currentUser = req.user;
    const receiverUid = req.body.receiver_uid || req.body.receiverUid || req.body.receiver_email;
    const intent = typeof req.body.intent === 'string' ? req.body.intent.trim() : null;

    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });
    if (!receiverUid) return res.status(400).json({ success: false, message: 'A collaborator is required' });

    console.log('createRequest - currentUser:', currentUser.email, currentUser.uid);
    console.log('createRequest - receiverUid:', receiverUid);

    // Resolve receiver to ObjectId
    const receiverObjectId = await resolveUserToObjectId(receiverUid);
    if (!receiverObjectId) {
      console.log('createRequest - could not resolve receiver to ObjectId');
      return res.status(404).json({ success: false, message: 'Collaborator not found' });
    }

    // Resolve current user to ObjectId
    const currentUserObjectId = await resolveUserToObjectId(currentUser.email || currentUser.uid || currentUser._id?.toString());
    if (!currentUserObjectId) {
      console.log('createRequest - could not resolve current user to ObjectId');
      return res.status(400).json({ success: false, message: 'Invalid user identifier' });
    }

    console.log('createRequest - receiver ObjectId:', receiverObjectId);
    console.log('createRequest - current user ObjectId:', currentUserObjectId);

    if (receiverObjectId.equals(currentUserObjectId)) {
      return res.status(400).json({ success: false, message: 'You cannot send a collaboration request to yourself' });
    }

    const existing = await Connection.findOne({
      $or: [
        { requester_id: currentUserObjectId, receiver_id: receiverObjectId },
        { requester_id: receiverObjectId, receiver_id: currentUserObjectId }
      ]
    });
    if (existing) {
      const message = existing.status === 'accepted'
        ? 'You are already connected and can chat now'
        : existing.status === 'pending'
          ? 'A collaboration request is already pending'
          : existing.status === 'declined'
            ? 'A previous request was declined. You can send a new request.'
            : 'A previous collaboration request already exists';
      
      console.log('createRequest - existing connection found:', existing.status);
      
      // Allow new request if previous one was declined
      if (existing.status === 'declined') {
        // Delete the declined request and allow new request
        await Connection.deleteOne({ _id: existing._id });
        console.log('createRequest - deleted declined request, allowing new request');
      } else {
        return res.status(409).json({ success: false, message, connection: existing });
      }
    }

    const connection = await Connection.create({
      requester_id: currentUserObjectId,
      receiver_id: receiverObjectId,
      requester_intent: intent || null
    });
    
    console.log('createRequest - connection created successfully:', connection._id);
    res.status(201).json({ success: true, connection, message: 'Collaboration request sent' });
  } catch (error) {
    console.error('Error creating connection request:', error);
    res.status(500).json({ success: false, message: 'Could not send collaboration request' });
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });

    console.log('getSentRequests - currentUser:', currentUser.email, currentUser.uid);

    // Resolve current user to ObjectId
    const currentUserObjectId = await resolveUserToObjectId(currentUser.email || currentUser.uid || currentUser._id?.toString());
    if (!currentUserObjectId) {
      console.log('getSentRequests - could not resolve current user to ObjectId');
      return res.status(400).json({ success: false, message: 'Invalid user identifier' });
    }

    console.log('getSentRequests - currentUserObjectId:', currentUserObjectId);

    // Get both pending and declined requests where current user is requester
    const connections = await Connection.find({ 
      requester_id: currentUserObjectId, 
      status: { $in: ['pending', 'declined'] }
    })
      .sort({ requested_at: -1 }).lean();
    
    console.log('getSentRequests - found connections:', connections.length);
    
    const decorated = await decorateConnections(connections, currentUserObjectId.toString());
    console.log('getSentRequests - decorated connections:', decorated.length);
    
    res.json({ success: true, connections: decorated });
  } catch (error) {
    console.error('Error loading sent connection requests:', error);
    res.status(500).json({ success: false, message: 'Could not load sent requests' });
  }
};

exports.getIncomingRequests = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });

    console.log('getIncomingRequests - currentUser:', currentUser.email, currentUser.uid);

    // Resolve current user to ObjectId
    const currentUserObjectId = await resolveUserToObjectId(currentUser.email || currentUser.uid || currentUser._id?.toString());
    if (!currentUserObjectId) {
      console.log('getIncomingRequests - could not resolve current user to ObjectId');
      return res.status(400).json({ success: false, message: 'Invalid user identifier' });
    }

    console.log('getIncomingRequests - currentUserObjectId:', currentUserObjectId);

    // Get both pending and declined requests
    const connections = await Connection.find({ 
      receiver_id: currentUserObjectId, 
      status: { $in: ['pending', 'declined'] }
    })
      .sort({ requested_at: -1 }).lean();
    
    console.log('getIncomingRequests - found connections:', connections.length);
    
    const decorated = await decorateConnections(connections, currentUserObjectId.toString());
    console.log('getIncomingRequests - decorated connections:', decorated.length);
    
    res.json({ success: true, connections: decorated });
  } catch (error) {
    console.error('Error loading incoming connection requests:', error);
    res.status(500).json({ success: false, message: 'Could not load collaboration requests' });
  }
};

async function respondToRequest(req, res, status) {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });

    // Resolve current user to ObjectId
    const currentUserObjectId = await resolveUserToObjectId(currentUser.email || currentUser.uid || currentUser._id?.toString());
    if (!currentUserObjectId) {
      console.log('respondToRequest - could not resolve current user to ObjectId');
      return res.status(400).json({ success: false, message: 'Invalid user identifier' });
    }

    // Validate connectionId
    const connectionObjectId = validateAndConvertObjectId(req.params.connectionId, 'Connection ID');
    if (!connectionObjectId) {
      console.log('respondToRequest - invalid connection ID');
      return res.status(400).json({ success: false, message: 'Invalid connection ID' });
    }

    const connection = await Connection.findOneAndUpdate(
      { _id: connectionObjectId, receiver_id: currentUserObjectId, status: 'pending' },
      { 
        status, 
        responded_at: new Date()
      },
      { new: true }
    );
    if (!connection) return res.status(404).json({ success: false, message: 'Pending request not found' });
    res.json({ success: true, connection, message: status === 'accepted' ? 'Collaboration accepted — chat is now available' : 'Collaboration request declined' });
  } catch (error) {
    console.error('Error responding to connection request:', error);
    res.status(500).json({ success: false, message: 'Could not update collaboration request' });
  }
}

exports.acceptRequest = (req, res) => respondToRequest(req, res, 'accepted');
exports.declineRequest = (req, res) => respondToRequest(req, res, 'declined');

exports.getAcceptedConnections = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });

    // Resolve current user to ObjectId
    const currentUserObjectId = await resolveUserToObjectId(currentUser.email || currentUser.uid || currentUser._id?.toString());
    if (!currentUserObjectId) {
      console.log('getAcceptedConnections - could not resolve current user to ObjectId');
      return res.status(400).json({ success: false, message: 'Invalid user identifier' });
    }

    const connections = await Connection.find({
      status: 'accepted',
      $or: [{ requester_id: currentUserObjectId }, { receiver_id: currentUserObjectId }]
    }).sort({ responded_at: -1 }).lean();
    res.json({ success: true, connections: await decorateConnections(connections, currentUserObjectId.toString()) });
  } catch (error) {
    console.error('Error loading accepted connections:', error);
    res.status(500).json({ success: false, message: 'Could not load collaborators' });
  }
};

exports.disconnect = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });

    // Resolve current user to ObjectId
    const currentUserObjectId = await resolveUserToObjectId(currentUser.email || currentUser.uid || currentUser._id?.toString());
    if (!currentUserObjectId) {
      console.log('disconnect - could not resolve current user to ObjectId');
      return res.status(400).json({ success: false, message: 'Invalid user identifier' });
    }

    // Validate connectionId
    const connectionObjectId = validateAndConvertObjectId(req.params.connectionId, 'Connection ID');
    if (!connectionObjectId) {
      console.log('disconnect - invalid connection ID');
      return res.status(400).json({ success: false, message: 'Invalid connection ID' });
    }

    const connection = await Connection.findOne({
      _id: connectionObjectId,
      $or: [{ requester_id: currentUserObjectId }, { receiver_id: currentUserObjectId }]
    });

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    // Delete the connection .... 
    await Connection.deleteOne({ _id: connectionObjectId });

    // Emit Socket.io event to notify both users
    const io = req.app.get('io');
    if (io) {
      io.to(`connection:${connection._id}`).emit('connection:disconnected', {
        connectionId: connection._id,
        disconnectedBy: currentUserObjectId.toString()
      });
    }

    res.json({ success: true, message: 'Disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting:', error);
    res.status(500).json({ success: false, message: 'Could not disconnect' });
  }
};
