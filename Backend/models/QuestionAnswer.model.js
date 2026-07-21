const mongoose = require("mongoose");

const questionAnswerSchema = new mongoose.Schema(
  {
    responseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SurveyResponse",
      required: true
    },

    surveyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true
    },

    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },

    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

questionAnswerSchema.index({ responseId: 1, questionId: 1 });
questionAnswerSchema.index({ questionId: 1 });
questionAnswerSchema.index({ surveyId: 1 });
questionAnswerSchema.index({ responseId: 1 });

module.exports = mongoose.model("QuestionAnswer", questionAnswerSchema);
