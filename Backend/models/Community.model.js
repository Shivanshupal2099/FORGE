const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true
    },

    type: {
      type: String,
      enum: ["predefined", "custom"],
      required: true
    },

    category: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true
    },

    description: {
      type: String,
      maxlength: 500,
      default: ""
    },

    max_members: {
      type: Number,
      default: 12,
      min: 2,
      max: 12
    },

    current_members: {
      type: Number,
      default: 1,
      min: 1
    },

    members: [{
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      joined_at: {
        type: Date,
        default: Date.now
      },
      role: {
        type: String,
        enum: ["creator", "member"],
        default: "member"
      }
    }],

    status: {
      type: String,
      enum: ["active", "full", "archived"],
      default: "active"
    },

    region_preference: {
      type: String,
      enum: ["global", "local", "regional"],
      default: "global"
    },

    tags: [{
      type: String,
      maxlength: 30
    }],

    is_public: {
      type: Boolean,
      default: true
    },

    coming_soon: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

// Indexes for efficient queries
communitySchema.index({ creator_id: 1, created_at: -1 });
communitySchema.index({ type: 1, status: 1 });
communitySchema.index({ category: 1, status: 1 });
communitySchema.index({ members: 1 });
communitySchema.index({ is_public: 1, status: 1 });
communitySchema.index({ created_at: -1 });

// Compound index for fetching user's communities
communitySchema.index({ "members.user_id": 1, status: 1 });

// Prevent duplicate communities with same name by same creator
communitySchema.index({ creator_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Community", communitySchema);
