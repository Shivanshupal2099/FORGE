import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },

    bio: {
      type: String,
      maxlength: 280,
      default: null
    },
    avatar_url: {
      type: String,
      default: null
    },
    year_of_study: {
      type: Number,
      min: 1,
      max: 6,
      default: null
    },

    department: {
      type: String,
      maxlength: 120,
      default: null
    },

    degree: {
      type: String,
      maxlength: 120,
      default: null
    },

    github_url: {
      type: String,
      default: null
    },

    linkedin_url: {
      type: String,
      default: null
    },

    portfolio_url: {
      type: String,
      default: null
    },

    current_need: {
      type: String,
      default: null
    },

    contact_number: {
      type: String,
      maxlength: 20,
      default: null
    },

    looking_for: {
      type: [String],
      default: []
    },

    availability_status: {
      type: String,
      enum: ["available", "busy", "invisible"],
      default: "available"
    },

    availability_until: {
      type: Date,
      default: null
    },

    profile_completeness: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    is_open_to_work: {
      type: String,
        enum: ["yes", "no", "maybe"],
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

export default mongoose.model("Profile", profileSchema);