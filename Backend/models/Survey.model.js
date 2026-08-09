const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema(
  {
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    visibility: {
      type: String,
      enum: ["public"],
      default: "public"
    },

    reward_amount: {
      type: Number,
      min: 0,
      default: null
    },

    target_responses: {
      type: Number,
      required: true,
      min: 1
    },

    current_responses: {
      type: Number,
      default: 0,
      min: 0
    },

    target_filter: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    expires_at: {
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

// Optimized indexes for query performance
surveySchema.index({ creator_id: 1, created_at: -1 });
surveySchema.index({ visibility: 1, created_at: -1 });
surveySchema.index({ expires_at: 1, created_at: -1 });
surveySchema.index({ creator_id: 1, visibility: 1 });
surveySchema.index({ created_at: -1 }); // For sorting in feed

// Compound index for public surveys query
surveySchema.index({ visibility: 1, expires_at: 1, created_at: -1 });

module.exports = mongoose.model("Survey", surveySchema);