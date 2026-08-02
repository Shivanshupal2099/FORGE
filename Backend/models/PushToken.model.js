const mongoose = require("mongoose");

const pushTokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
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

pushTokenSchema.index({ user_id: 1 });
pushTokenSchema.index({ token: 1 }, { unique: true });

module.exports = mongoose.model("PushToken", pushTokenSchema);