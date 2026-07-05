import mongoose from "mongoose";

const matchScoreSchema = new mongoose.Schema(
  {
    user_a_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    user_b_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    total_score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    skill_score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    goal_score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },

    availability_score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },

    location_score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },

    common_skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill"
      }
    ],

    computed_at: {
      type: Date,
      default: Date.now
    },

    expires_at: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: false
  }
);

// One cached match score per user pair
matchScoreSchema.index(
  { user_a_id: 1, user_b_id: 1 },
  { unique: true }
);

// Fast lookup for recommendations
matchScoreSchema.index({ user_a_id: 1, total_score: -1 });
matchScoreSchema.index({ user_b_id: 1, total_score: -1 });

// Optional: TTL index to automatically remove expired cache
matchScoreSchema.index(
  { expires_at: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model("MatchScore", matchScoreSchema);