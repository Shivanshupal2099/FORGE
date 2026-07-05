import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    plan: {
      type: String,
      enum: [
        "student_base",
        "student_pro",
        "provider",
        "college",
        "company"
      ],
      required: true
    },

    status: {
      type: String,
      enum: [
        "active",
        "expired",
        "cancelled",
        "grace"
      ],
      default: "active"
    },

    amount_paise: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      minlength: 3,
      maxlength: 3
    },

    billing_cycle: {
      type: String,
      enum: [
        "monthly",
        "annual"
      ],
      required: true
    },

    started_at: {
      type: Date,
      required: true
    },

    expires_at: {
      type: Date,
      required: true
    },

    auto_renew: {
      type: Boolean,
      default: true
    },

    cancelled_at: {
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

// Indexes
subscriptionSchema.index({ user_id: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ expires_at: 1 });

// Optional: Only one active subscription per user
subscriptionSchema.index(
  { user_id: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "active"
    }
  }
);

export default mongoose.model("Subscription", subscriptionSchema);