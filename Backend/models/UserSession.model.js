const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    description: "Reference to the authenticated user"
  },
  uid: {
    type: String,
    required: true,
    description: "User UID from auth provider"
  },
  device_info: {
    type: Object,
    default: null,
    description: "Information about the user's device, browser, and operating system"
  },
  ip_address: {
    type: String,
    default: null,
    description: "IPv4 or IPv6 address of the client"
  },
  user_agent: {
    type: String,
    default: null,
    description: "User agent string"
  },
  expires_at: {
    type: Date,
    required: true,
    description: "Session expiration timestamp"
  },
  last_activity_at: {
    type: Date,
    default: Date.now,
    description: "Last activity timestamp for this session"
  },
  is_active: {
    type: Boolean,
    default: true,
    description: "Whether the session is currently active"
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Index for efficient queries
userSessionSchema.index({ user_id: 1 });
userSessionSchema.index({ uid: 1 });
userSessionSchema.index({ expires_at: 1 });
userSessionSchema.index({ is_active: 1 });

// TTL index to automatically expire inactive sessions
userSessionSchema.index({ expires_at: 1 }, { 
  expireAfterSeconds: 0,
  name: 'session_ttl_index'
});

module.exports = mongoose.model('UserSession', userSessionSchema);
