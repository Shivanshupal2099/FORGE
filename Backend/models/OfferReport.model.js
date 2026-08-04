const mongoose = require("mongoose");

const offerReportSchema = new mongoose.Schema(
  {
    offer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true
    },
    reported_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending"
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewed_at: {
      type: Date
    },
    action_taken: {
      type: String,
      enum: ["none", "offer_removed", "user_warned", "other"],
      default: "none"
    },
    action_notes: {
      type: String,
      maxlength: 500
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
offerReportSchema.index({ offer_id: 1, reported_by: 1 }, { unique: true }); // Prevent duplicate reports
offerReportSchema.index({ status: 1 });
offerReportSchema.index({ created_at: -1 });

module.exports = mongoose.model("OfferReport", offerReportSchema);
