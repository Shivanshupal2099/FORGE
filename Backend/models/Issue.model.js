const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    user_email: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    assigned_to: {
      type: String,
      default: null
    },
    resolution: {
      type: String,
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
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ user_email: 1 });
issueSchema.index({ created_at: -1 });

module.exports = mongoose.model("Issue", issueSchema);
