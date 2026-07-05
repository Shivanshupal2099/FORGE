import mongoose from "mongoose";

const surveyResponseSchema = new mongoose.Schema(
  {
    survey_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true,
      index: true
    },

    respondent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    answers: {
      type: [
        {
          question_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SurveyQuestion",
            required: true
          },
          answer: {
            type: mongoose.Schema.Types.Mixed,
            required: true
          }
        }
      ],
      required: true
    },

    completion_time_secs: {
      type: Number,
      min: 0,
      default: null
    },

    reward_paid: {
      type: Boolean,
      default: false
    },

    submitted_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

surveyResponseSchema.index(
  { survey_id: 1, respondent_id: 1 },
  { unique: true }
);

export default mongoose.model("SurveyResponse", surveyResponseSchema);