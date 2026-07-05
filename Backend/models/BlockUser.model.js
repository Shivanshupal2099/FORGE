import mongoose from "mongoose";

const blockedUserSchema = new mongoose.Schema(
  {
    blocker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    blocked_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    reason: {
      type: String,
      maxlength: 255,
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

// Prevent duplicate block records
blockedUserSchema.index(
  { blocker_id: 1, blocked_id: 1 },
  { unique: true }
);

// Index for fast lookups
blockedUserSchema.index({ blocker_id: 1 });
blockedUserSchema.index({ blocked_id: 1 });

export default mongoose.model("BlockedUser", blockedUserSchema);