const Connection = require('../models/Connection.model');
const Profile = require('../models/Profile.model');
const User = require('../models/Users.model');

const userId = (value) => value?._id?.toString?.() || value?.toString?.();

async function profilesFor(users) {
  const ids = users.map((user) => userId(user)).filter(Boolean);
  const profiles = await Profile.find({ user_id: { $in: ids } }).lean();
  return new Map(profiles.map((profile) => [profile.user_id.toString(), profile]));
}

function presentUser(user, profile) {
  const firstName = profile?.first_name || user.email?.split('@')[0] || 'ForgeConnect user';
  const lastName = profile?.last_name || '';
  return {
    id: user._id.toString(),
    uid: user.uid,
    name: `${firstName} ${lastName}`.trim(),
    avatarUrl: profile?.avatar_url || null,
    profession: profile?.department || '',
    isOnline: Boolean(user.is_online),
    lastSeenAt: user.last_seen_at || null
  };
}

async function decorateConnections(connections, currentUserId) {
  const ids = [...new Set(connections.flatMap((connection) => [
    userId(connection.requester_id),
    userId(connection.receiver_id)
  ]))];
  const users = await User.find({ _id: { $in: ids } }).lean();
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));
  const profileByUserId = await profilesFor(users);

  return connections.map((connection) => {
    const requesterId = userId(connection.requester_id);
    const receiverId = userId(connection.receiver_id);
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
    const requesterPublicKey = req.body.requester_public_key || null;

    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });
    if (!receiverUid) return res.status(400).json({ success: false, message: 'A collaborator is required' });

    const receiver = await User.findOne({ $or: [{ uid: receiverUid }, { email: receiverUid }] });
    if (!receiver) return res.status(404).json({ success: false, message: 'Collaborator not found' });
    if (receiver._id.equals(currentUser._id)) {
      return res.status(400).json({ success: false, message: 'You cannot send a collaboration request to yourself' });
    }

    const existing = await Connection.findOne({
      $or: [
        { requester_id: currentUser._id, receiver_id: receiver._id },
        { requester_id: receiver._id, receiver_id: currentUser._id }
      ]
    });
    if (existing) {
      const message = existing.status === 'accepted'
        ? 'You are already connected and can chat now'
        : existing.status === 'pending'
          ? 'A collaboration request is already pending'
          : 'A previous collaboration request already exists';
      return res.status(409).json({ success: false, message, connection: existing });
    }

    const connection = await Connection.create({
      requester_id: currentUser._id,
      receiver_id: receiver._id,
      requester_intent: intent || null,
      requester_public_key: requesterPublicKey
    });
    res.status(201).json({ success: true, connection, message: 'Collaboration request sent' });
  } catch (error) {
    console.error('Error creating connection request:', error);
    res.status(500).json({ success: false, message: 'Could not send collaboration request' });
  }
};

exports.getIncomingRequests = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });

    const connections = await Connection.find({ receiver_id: currentUser._id, status: 'pending' })
      .sort({ requested_at: -1 }).lean();
    res.json({ success: true, connections: await decorateConnections(connections, currentUser._id.toString()) });
  } catch (error) {
    console.error('Error loading incoming connection requests:', error);
    res.status(500).json({ success: false, message: 'Could not load collaboration requests' });
  }
};

async function respondToRequest(req, res, status) {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });

    const receiverPublicKey = req.body.receiver_public_key || null;

    const connection = await Connection.findOneAndUpdate(
      { _id: req.params.connectionId, receiver_id: currentUser._id, status: 'pending' },
      { 
        status, 
        responded_at: new Date(),
        ...(receiverPublicKey && { receiver_public_key: receiverPublicKey })
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
    const connections = await Connection.find({
      status: 'accepted',
      $or: [{ requester_id: currentUser._id }, { receiver_id: currentUser._id }]
    }).sort({ responded_at: -1 }).lean();
    res.json({ success: true, connections: await decorateConnections(connections, currentUser._id.toString()) });
  } catch (error) {
    console.error('Error loading accepted connections:', error);
    res.status(500).json({ success: false, message: 'Could not load collaborators' });
  }
};

exports.disconnect = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });

    const connection = await Connection.findOne({
      _id: req.params.connectionId,
      status: 'accepted',
      $or: [{ requester_id: currentUser._id }, { receiver_id: currentUser._id }]
    });

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    // Delete the connection
    await Connection.deleteOne({ _id: req.params.connectionId });

    // Emit Socket.io event to notify both users
    const io = req.app.get('io');
    if (io) {
      io.to(`connection:${connection._id}`).emit('connection:disconnected', {
        connectionId: connection._id,
        disconnectedBy: currentUser._id.toString()
      });
    }

    res.json({ success: true, message: 'Disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting:', error);
    res.status(500).json({ success: false, message: 'Could not disconnect' });
  }
};
