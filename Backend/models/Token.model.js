const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      description: "User identifier (email)"
    },
    total_tokens: {
      type: Number,
      default: 0,
      min: 0
    },
    token_history: [
      {
        amount: {
          type: Number,
          required: true
        },
        source: {
          type: String,
          required: true,
          enum: ["survey_submission", "referral", "bonus", "offer_redemption", "other"]
        },
        description: {
          type: String,
          required: true
        },
        survey_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Survey",
          default: null
        },
        earned_at: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

// Indexes for efficient queries
tokenSchema.index({ total_tokens: -1 });
tokenSchema.index({ "token_history.earned_at": -1 });

module.exports = mongoose.model("Token", tokenSchema);
