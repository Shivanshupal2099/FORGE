const mongoose = require("mongoose");

const pushTokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    token: {
      type: String,
      required: true,
      unique: true
    },

    platform: {
      type: String,
      enum: [
        "android",
        "ios",
        "web"
      ],
      required: true
    },

    is_active: {
      type: Boolean,
      default: true
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
pushTokenSchema.index({ user_id: 1 });
pushTokenSchema.index({ platform: 1, is_active: 1 });

module.exports = mongoose.model("PushToken", pushTokenSchema);