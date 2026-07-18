import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
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
      maxlength: 255
    },

    description: {
      type: String,
      required: true
    },

    offer_type: {
      type: String,
      enum: [
        "free",
        "paid",
        "equity",
        "performance"
      ],
      required: true
    },

    price: {
      type: Number,
      min: 0,
      default: null
    },

    equity_percent: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },

    category: {
      type: String,
      maxlength: 80,
      required: true
    },

    skill_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      default: null
    },

    is_active: {
      type: Boolean,
      default: true
    },

    expires_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false
    }
  }
);

offerSchema.index({ creator_id: 1 });
offerSchema.index({ category: 1 });
offerSchema.index({ offer_type: 1 });
offerSchema.index({ is_active: 1 });
offerSchema.index({ expires_at: 1 });

export default mongoose.model("Offer", offerSchema);