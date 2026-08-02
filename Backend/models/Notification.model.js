const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: [
        "connection_request",
        "match_nearby",
        "event_reminder",
        "message",
        "survey_reward"
      ],
      required: true
    },

    title: {
      type: String,
      required: true,
      maxlength: 120
    },

    body: {
      type: String,
      required: true,
      maxlength: 300
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    is_read: {
      type: Boolean,
      default: false
    },

    is_sent_push: {
      type: Boolean,
      default: false
    },

    read_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    }
  }
);

// Indexes for efficient queries
notificationSchema.index({ user_id: 1 });
notificationSchema.index({ user_id: 1, is_read: 1 });
notificationSchema.index({ created_at: -1 });

module.exports = mongoose.model("Notification", notificationSchema);