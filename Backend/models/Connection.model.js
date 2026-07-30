const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    requester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "blocked"],
      default: "pending"
    },

    requester_intent: {
      type: String,
      maxlength: 255,
      default: null
    },

    match_score: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },

    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null
    },

    responded_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: "requested_at",
      updatedAt: false
    }
  }
);

// Prevent duplicate connection requests between the same two users
connectionSchema.index(
  { requester_id: 1, receiver_id: 1 },
  { unique: true }
);

// Speed up queries by status
connectionSchema.index({ receiver_id: 1, status: 1 });
connectionSchema.index({ requester_id: 1, status: 1 });

module.exports = mongoose.model("Connection", connectionSchema);