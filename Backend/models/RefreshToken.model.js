const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      description: 'User ID associated with this refresh token'
    },
    uid: {
      type: String,
      required: true,
      description: 'User UID from auth provider'
    },
    token: {
      type: String,
      required: true,
      unique: true,
      description: 'Refresh token string'
    },
    expires_at: {
      type: Date,
      required: true,
      description: 'Token expiration date (7 days from creation)'
    },
    created_at: {
      type: Date,
      default: Date.now,
      description: 'When the token was created'
    },
    revoked: {
      type: Boolean,
      default: false,
      description: 'Whether the token has been revoked'
    },
    revoked_at: {
      type: Date,
      default: null,
      description: 'When the token was revoked'
    },
    ip_address: {
      type: String,
      default: null,
      description: 'IP address when token was created'
    },
    user_agent: {
      type: String,
      default: null,
      description: 'User agent when token was created'
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Index for efficient queries
refreshTokenSchema.index({ user_id: 1 });
refreshTokenSchema.index({ expires_at: 1 });
refreshTokenSchema.index({ revoked: 1 });

// Method to check if token is expired
refreshTokenSchema.methods.isExpired = function() {
  return Date.now() > this.expires_at.getTime();
};

// Method to check if token is valid
refreshTokenSchema.methods.isValid = function() {
  return !this.revoked && !this.isExpired();
};

// Static method to clean up expired tokens
refreshTokenSchema.statics.cleanExpiredTokens = async function() {
  const result = await this.deleteMany({
    expires_at: { $lt: new Date() }
  });
  return result.deletedCount;
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
