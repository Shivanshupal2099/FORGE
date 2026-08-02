const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    reported_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    report_type: {
      type: String,
      enum: [
        "spam",
        "harassment",
        "fake_profile",
        "inappropriate"
      ],
      required: true
    },

    description: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: [
        "open",
        "reviewed",
        "actioned",
        "dismissed"
      ],
      default: "open"
    },

    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin User
      default: null
    },

    resolved_at: {
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

// Indexes
reportSchema.index({ reporter_id: 1 });
reportSchema.index({ reported_user_id: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ report_type: 1 });

module.exports = mongoose.model("Report", reportSchema);