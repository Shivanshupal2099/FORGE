const mongoose = require('mongoose');

const MESSAGE_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

const messageSchema = new mongoose.Schema({
  connection_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connection',
    required: true,
    index: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000 // Increased for encrypted data
  },
  is_encrypted: {
    type: Boolean,
    default: true
  },
  read_at: {
    type: Date,
    default: null
  },
  // MongoDB's TTL monitor removes expired messages automatically after 24 hours
  expires_at: {
    type: Date,
    default: () => new Date(Date.now() + MESSAGE_RETENTION_MS),
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

messageSchema.index({ connection_id: 1, created_at: -1 });
messageSchema.index({ receiver_id: 1, read_at: 1, expires_at: 1 });

module.exports = mongoose.model('Message', messageSchema);
