import mongoose from "mongoose";

const surveySchema = new mongoose.Schema(
  {
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      maxlength: 255,
      trim: true
    },

    description: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft"
    },

    reward_amount: {
      type: Number,
      min: 0,
      default: null
    },

    target_responses: {
      type: Number,
      required: true,
      min: 1
    },

    current_responses: {
      type: Number,
      default: 0,
      min: 0
    },

    target_filter: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    expires_at: {
      type: Date,
      default: function() {
        // Default to 24 hours from creation
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return expiresAt;
      },
      required: true
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    }
  }
);

surveySchema.index({ creator_id: 1 });
surveySchema.index({ status: 1 });

// TTL index to auto-delete surveys after 24 hours
surveySchema.index({ expires_at: 1 }, { 
  expireAfterSeconds: 0,
  name: 'survey_ttl_index'
});

export default mongoose.model("Survey", surveySchema);

