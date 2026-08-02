const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null
    },

    razorpay_order_id: {
      type: String,
      default: null
    },

    razorpay_payment_id: {
      type: String,
      default: null
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

    status: {
      type: String,
      enum: [
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded"
      ],
      default: "created"
    },

    payment_method: {
      type: String,
      maxlength: 50,
      default: null
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

// Indexes
transactionSchema.index({ user_id: 1 });
transactionSchema.index({ subscription_id: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ created_at: -1 });

// Ensure Razorpay IDs are unique if present
transactionSchema.index(
  { razorpay_order_id: 1 },
  {
    unique: true,
    sparse: true
  }
);

transactionSchema.index(
  { razorpay_payment_id: 1 },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);