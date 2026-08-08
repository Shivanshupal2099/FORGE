const Connection = require('../models/Connection.model');
const Message = require('../models/Message.model');
const User = require('../models/Users.model');
const Profile = require('../models/Profile.model');
const mongoose = require('mongoose');
const { sendPushNotification } = require('./push.controller');

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

async function getChatConnection(connectionId, currentUserId) {
  console.log('getChatConnection - connectionId:', connectionId, 'currentUserId:', currentUserId);
  
  // Validate connectionId
  const connectionObjectId = validateAndConvertObjectId(connectionId, 'Connection ID');
  if (!connectionObjectId) {
    console.log('getChatConnection - invalid connection ID');
    return null;
  }
  
  // First, find the connection by ID
  const connection = await Connection.findOne({ _id: connectionObjectId, status: 'accepted' });
  if (!connection) {
    console.log('getChatConnection - connection not found or not accepted');
    return null;
  }
  
  console.log('getChatConnection - connection found:', connection._id);
  console.log('getChatConnection - requester_id:', connection.requester_id, 'receiver_id:', connection.receiver_id);
  
  // Resolve current user to ObjectId
  const currentUserObjectId = await resolveUserToObjectId(currentUserId);
  if (!currentUserObjectId) {
    console.log('getChatConnection - could not resolve current user to ObjectId');
    return null;
  }
  
  console.log('getChatConnection - current user ObjectId:', currentUserObjectId);
  
  // Check if the current user is part of this connection
  const isRequester = connection.requester_id.equals(currentUserObjectId);
  const isReceiver = connection.receiver_id.equals(currentUserObjectId);
  
  console.log('getChatConnection - isRequester:', isRequester, 'isReceiver:', isReceiver);
  
  if (isRequester || isReceiver) {
    return connection;
  }
  
  console.log('getChatConnection - user is not part of this connection');
  return null;
}

exports.getMessages = async (req, res) => {
  try {  
    const currentUser = req.user;
    console.log('getMessages - currentUser:', currentUser);
    
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });
    
    // Resolve current user to ObjectId
    const currentUserId = currentUser.email || currentUser.uid || currentUser._id?.toString();
    const currentUserObjectId = await resolveUserToObjectId(currentUserId);
    
    if (!currentUserObjectId) {
      console.log('getMessages - could not resolve current user to ObjectId');
      return res.status(400).json({ success: false, message: 'Invalid user identifier' });
    }
    
    console.log('getMessages - currentUserId:', currentUserId, 'resolved ObjectId:', currentUserObjectId);
    console.log('getMessages - connectionId:', req.params.connectionId);
    
    const connection = await getChatConnection(req.params.connectionId, currentUserId);
    console.log('getMessages - connection found:', !!connection);
    
    if (!connection) return res.status(403).json({ success: false, message: 'Chat is only available to accepted collaborators' });

    const now = new Date();
    console.log('getMessages - marking messages as read for user:', currentUserObjectId);
    await Message.updateMany(
      { connection_id: connection._id, receiver_id: currentUserObjectId, read_at: null, expires_at: { $gt: now } },
      { $set: { read_at: now } }
    );
    
    console.log('getMessages - fetching messages');
    const messages = await Message.find({ connection_id: connection._id, expires_at: { $gt: now } })
      .sort({ created_at: 1 }).limit(200).lean();
    console.log('getMessages - messages count:', messages.length);
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error loading chat messages:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ success: false, message: 'Could not load messages', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const currentUser = req.user;
    const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';
    
    console.log('sendMessage - currentUser:', currentUser);
    console.log('sendMessage - connectionId:', req.params.connectionId);
    console.log('sendMessage - bodyLength:', body.length);
    
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });
    if (!body) return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    if (body.length > 5000) return res.status(400).json({ success: false, message: 'Message must be 5,000 characters or less' });

    // Resolve current user to ObjectId
    const currentUserId = currentUser.email || currentUser.uid || currentUser._id?.toString();
    const currentUserObjectId = await resolveUserToObjectId(currentUserId);
    
    if (!currentUserObjectId) {
      console.log('sendMessage - could not resolve current user to ObjectId');
      return res.status(400).json({ success: false, message: 'Invalid user identifier' });
    }
    
    console.log('sendMessage - currentUserId:', currentUserId, 'resolved ObjectId:', currentUserObjectId);
    
    const connection = await getChatConnection(req.params.connectionId, currentUserId);
    
    console.log('sendMessage - connection found:', !!connection);
    
    if (!connection) return res.status(403).json({ success: false, message: 'Chat is only available to accepted collaborators' });
    
    // Determine receiver ObjectId
    const receiverObjectId = connection.requester_id.equals(currentUserObjectId) 
      ? connection.receiver_id 
      : connection.requester_id;
    
    console.log('sendMessage - receiver ObjectId:', receiverObjectId);
    
    const message = await Message.create({ 
      connection_id: connection._id, 
      sender_id: currentUserObjectId, 
      receiver_id: receiverObjectId, 
      body
    });
    
    console.log('sendMessage - message created successfully:', message._id);
    
    // Send push notification to receiver
    try {
      const senderProfile = await Profile.findOne({ user_id: currentUserObjectId });
      const senderName = senderProfile 
        ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim()
        : currentUser.email?.split('@')[0] || 'Someone';
      
      await sendPushNotification(
        receiverObjectId,
        `New message from ${senderName}`,
        body.length > 100 ? body.substring(0, 100) + '...' : body,
        {
          type: 'new_message',
          connectionId: connection._id.toString(),
          messageId: message._id.toString(),
          url: `/chat/${connection._id.toString()}`
        }
      );
    } catch (pushError) {
      console.error('Error sending push notification for new message:', pushError);
      // Don't fail the message if push notification fails
    }
    
    // Emit Socket.io event for real-time update (exclude sender to avoid duplication)
    const io = req.app.get('io');
    if (io) {
      // Emit to all users in the connection room except the sender
      io.to(`connection:${connection._id}`).except(req.socket?.id).emit('message:receive', message);
      console.log('sendMessage - emitted message via Socket.io (excluding sender)');
    }
    
    // Delete old messages: keep only last 2 messages per sender in this connection
    try {
      const allMessages = await Message.find({ connection_id: connection._id })
        .sort({ created_at: 1 })
        .lean();
      
      // Group messages by sender_id
      const messagesBySender = {};
      allMessages.forEach(msg => {
        const senderId = msg.sender_id.toString();
        if (!messagesBySender[senderId]) {
          messagesBySender[senderId] = [];
        }
        messagesBySender[senderId].push(msg._id);
      });
      
      // Keep only last 2 messages per sender, delete the rest
      const idsToDelete = [];
      Object.values(messagesBySender).forEach(messageIds => {
        if (messageIds.length > 2) {
          // Keep the last 2, delete the rest
          const toDelete = messageIds.slice(0, messageIds.length - 2);
          idsToDelete.push(...toDelete);
        }
      });
      
      if (idsToDelete.length > 0) {
        await Message.deleteMany({ _id: { $in: idsToDelete } });
        console.log('sendMessage - deleted old messages:', idsToDelete.length);
        
        // Emit deletion event to update frontend
        if (io) {
          io.to(`connection:${connection._id}`).emit('messages:deleted', { deletedIds: idsToDelete });
          console.log('sendMessage - emitted deletion event via Socket.io');
        }
      }
    } catch (error) {
      console.error('sendMessage - error deleting old messages:', error);
      // Continue even if deletion fails
    }
    
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error sending chat message:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ success: false, message: 'Could not send message', error: error.message });
  }
};

exports.clearChat = async (req, res) => {
  try {
    const currentUser = req.user;
    console.log('clearChat - currentUser:', currentUser);
    
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });

    // Resolve current user to ObjectId
    const currentUserId = currentUser.email || currentUser.uid || currentUser._id?.toString();
    const currentUserObjectId = await resolveUserToObjectId(currentUserId);
    
    if (!currentUserObjectId) {
      console.log('clearChat - could not resolve current user to ObjectId');
      return res.status(400).json({ success: false, message: 'Invalid user identifier' });
    }
    
    console.log('clearChat - currentUserId:', currentUserId, 'resolved ObjectId:', currentUserObjectId);
    console.log('clearChat - connectionId:', req.params.connectionId);
    
    const connection = await getChatConnection(req.params.connectionId, currentUserId);
    console.log('clearChat - connection found:', !!connection);
    
    if (!connection) return res.status(403).json({ success: false, message: 'Chat is only available to accepted collaborators' });

    // Delete all messages for this connection
    const result = await Message.deleteMany({ connection_id: connection._id });
    console.log('clearChat - deleted messages count:', result.deletedCount);
    
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error clearing chat:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ success: false, message: 'Could not clear chat' });
  }
};
