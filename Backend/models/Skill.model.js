import mongoose from "mongoose";

const userSkillSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    skill_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
      index: true
    },

    proficiency: {
      type: String,
      enum: ["beginner", "intermediate", "expert"],
      required: true
    },

    years_experience: {
      type: Number,
      min: 0,
      default: null
    },

    is_primary: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    }
  }
);

// Prevent duplicate skills for the same user
userSkillSchema.index(
  { user_id: 1, skill_id: 1 },
  { unique: true }
);

export default mongoose.model("UserSkill", userSkillSchema);