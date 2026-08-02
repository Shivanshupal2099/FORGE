const mongoose = require("mongoose");

const surveyResponseSchema = new mongoose.Schema(
  {
    surveyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    anonymous: {
      type: Boolean,
      default: false
    },

    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

// Optimized indexes for query performance
surveyResponseSchema.index({ surveyId: 1, submittedBy: 1 }, { unique: true });
surveyResponseSchema.index({ surveyId: 1, submittedAt: -1 });

module.exports = mongoose.model("SurveyResponse", surveyResponseSchema);
