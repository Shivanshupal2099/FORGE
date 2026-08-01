const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    token_cost: {
      type: Number,
      required: true,
      min: 0,
      default: 100
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
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
          ref: "Users"
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
    },
    category: {
      type: String,
      enum: ["discount", "bonus", "exclusive", "community", "other"],
      default: "other"
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
offerSchema.index({ category: 1, is_active: 1 });

module.exports = mongoose.model("Offer", offerSchema);