const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    surveyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    question: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["text", "paragraph", "radio", "checkbox", "dropdown", "rating", "yes_no", "date", "number", "email"],
      required: true
    },

    required: {
      type: Boolean,
      default: false
    },

    options: {
      type: [String],
      default: []
    },

    order: {
      type: Number,
      required: true,
      default: 0
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
questionSchema.index({ surveyId: 1, order: 1 });
questionSchema.index({ ownerId: 1 });
questionSchema.index({ surveyId: 1 });
questionSchema.index({ surveyId: 1, ownerId: 1 });
questionSchema.index({ type: 1 }); // For filtering by question type

module.exports = mongoose.model("Question", questionSchema);
