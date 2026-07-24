const mongoose = require('mongoose');

const MESSAGE_RETENTION_MS = 5 * 24 * 60 * 60 * 1000;

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
    maxlength: 2000
  },
  read_at: {
    type: Date,
    default: null
  },
  // MongoDB's TTL monitor removes expired messages automatically. API queries
  // also exclude them so they disappear exactly at the five-day boundary.
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
