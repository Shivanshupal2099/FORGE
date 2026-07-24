const Connection = require('../models/Connection.model');
const Message = require('../models/Message.model');
const { getCurrentUser } = require('../utils/currentUser');

async function getChatConnection(connectionId, currentUserId) {
  return Connection.findOne({
    _id: connectionId,
    status: 'accepted',
    $or: [{ requester_id: currentUserId }, { receiver_id: currentUserId }]
  });
}

exports.getMessages = async (req, res) => {
  try {  
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });
    const connection = await getChatConnection(req.params.connectionId, currentUser._id);
    if (!connection) return res.status(403).json({ success: false, message: 'Chat is only available to accepted collaborators' });

    const now = new Date();
    await Message.updateMany(
      { connection_id: connection._id, receiver_id: currentUser._id, read_at: null, expires_at: { $gt: now } },
      { $set: { read_at: now } }
    );
    const messages = await Message.find({ connection_id: connection._id, expires_at: { $gt: now } })
      .sort({ created_at: 1 }).limit(200).lean();
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error loading chat messages:', error);
    res.status(500).json({ success: false, message: 'Could not load messages' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';
    if (!currentUser) return res.status(401).json({ success: false, message: 'User not authenticated' });
    if (!body) return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    if (body.length > 2000) return res.status(400).json({ success: false, message: 'Message must be 2,000 characters or less' });

    const connection = await getChatConnection(req.params.connectionId, currentUser._id);
    if (!connection) return res.status(403).json({ success: false, message: 'Chat is only available to accepted collaborators' });
    const receiverId = connection.requester_id.equals(currentUser._id) ? connection.receiver_id : connection.requester_id;
    const message = await Message.create({ connection_id: connection._id, sender_id: currentUser._id, receiver_id: receiverId, body });
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ success: false, message: 'Could not send message' });
  }
};
