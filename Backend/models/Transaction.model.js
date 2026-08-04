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

    cashfree_order_id: {
      type: String,
      default: null
    },

    cashfree_payment_id: {
      type: String,
      default: null
    },

    order_amount: {
      type: Number,
      required: true,
      min: 0
    },

    order_currency: {
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

// Ensure Cashfree IDs are unique if present (sparse indexes allow multiple null values)
transactionSchema.index(
  { cashfree_order_id: 1 },
  {
    unique: true,
    sparse: true,
    name: 'cashfree_order_id_1'
  }
);

transactionSchema.index(
  { cashfree_payment_id: 1 },
  {
    unique: true,
    partialFilterExpression: {
      cashfree_payment_id: { $type: "string" }
    },
    name: 'cashfree_payment_id_1'
  }
);

// Compound index for user + order to prevent duplicates
transactionSchema.index(
  { user_id: 1, cashfree_order_id: 1 },
  {
    unique: true,
    sparse: true,
    name: 'user_order_unique'
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);