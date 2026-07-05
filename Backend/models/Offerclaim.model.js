import mongoose from "mongoose";

const offerClaimSchema = new mongoose.Schema(
  {
    offer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
      index: true
    },

    claimant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "completed",
        "cancelled"
      ],
      default: "pending"
    },

    message: {
      type: String,
      default: null
    },

    completed_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: "claimed_at",
      updatedAt: false
    }
  }
);

offerClaimSchema.index(
  { offer_id: 1, claimant_id: 1 },
  { unique: true }
);

export default mongoose.model("OfferClaim", offerClaimSchema);