const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    subscription: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },

    device_type: {
      type: String,
      enum: ["android", "ios", "desktop"],
      required: true
    },

    user_agent: {
      type: String,
      default: null
    },

    is_active: {
      type: Boolean,
      default: true
    },

    last_used_at: {
      type: Date,
      default: Date.now
    },

    expires_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

// Indexes for efficient queries
pushSubscriptionSchema.index({ user_id: 1, is_active: 1 });
pushSubscriptionSchema.index({ created_at: -1 });

module.exports = mongoose.model("PushSubscription", pushSubscriptionSchema);
