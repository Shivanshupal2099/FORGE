import mongoose from "mongoose";

const userGoalSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    goal_type: {
      type: String,
      enum: [
        "startup",
        "hackathon",
        "study",
        "mentor",
        "social_impact",
        "research",
        "work_on_startup_as_member"
      ],
      required: true
    },

    description: {
      type: String,
      default: null
    },

    industry: {
      type: String,
      maxlength: 80,
      default: null
    },

    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    }
  }
);

// Prevent duplicate active goals of the same type for a user
userGoalSchema.index(
  { user_id: 1, goal_type: 1 },
  { unique: true }
);

export default mongoose.model("UserGoal", userGoalSchema);