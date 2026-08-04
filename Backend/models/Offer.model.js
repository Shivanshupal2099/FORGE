const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 45
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3801
    },
    token_cost: {
      type: Number,
      required: true,
      min: 0,
      default: 100
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    is_active: {
      type: Boolean,
      default: true
    },
    redeemed_by: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        redeemed_at: {
          type: Date,
          default: Date.now
        }
      }
    ],
    max_redemptions: {
      type: Number,
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
offerSchema.index({ created_by: 1, is_active: 1 });

// TTL index to auto-delete offers after 24 hours
offerSchema.index({ created_at: 1 }, { expireAfterSeconds: 86400 }); // 24 hours = 86400 seconds

module.exports = mongoose.model("Offer", offerSchema);