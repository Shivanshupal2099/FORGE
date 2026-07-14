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
      maxlength: 255,
      trim: true
    },

    description: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft"
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

surveySchema.index({ creator_id: 1 });
surveySchema.index({ status: 1 });
surveySchema.index({ expires_at: 1 });

module.exports = mongoose.model("Survey", surveySchema);