const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      description: "Unique user identifier (from auth provider)"
    },
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
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: null
    },

    location: {
      type: String,
      maxlength: 120,
      default: null
    },
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },

    department: {
      type: String,
      maxlength: 120,
      default: null
    },

    domain: {
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
    },

    // Service provider fields
    is_service_provider: {
      type: Boolean,
      default: false
    },
    services: {
      type: [String],
      default: []
    },

    // Payment verification
    is_verified: {
      type: Boolean,
      default: false
    },
    payment_date: {
      type: Date,
      default: null
    },

    // Visibility settings for public profile
    visibility_settings: {
      show_name: {
        type: Boolean,
        default: true
      },
      show_bio: {
        type: Boolean,
        default: true
      },
      show_looking_for: {
        type: Boolean,
        default: true
      },
      show_services: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

module.exports = mongoose.model("Profile", profileSchema);