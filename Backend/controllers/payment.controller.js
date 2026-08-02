const getRazorpayInstance = require("../config/razorpay");
const Transaction = require("../models/Transaction.model");
const User = require("../models/Users.model");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get Razorpay instance
    const razorpay = getRazorpayInstance();
    
    console.log('Payment request - Razorpay instance:', !!razorpay);
    
    // Check if Razorpay is configured
    if (!razorpay) {
      console.error('Razorpay instance is null');
      return res.status(503).json({ message: "Payment service not configured. Please add Razorpay credentials." });
    }

    // Verify user exists
    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const options = {
      amount: 29900, // ₹299 (amount in paise)
      currency: "INR",
      receipt: `rcpt_${Date.now().toString(36)}`,
      notes: {
        userId: userId,
        purpose: "verification"
      }
    };

    const order = await razorpay.orders.create(options);

    // Create transaction record
    const transaction = await Transaction.create({
      user_id: user._id,
      razorpay_order_id: order.id,
      amount_paise: order.amount,
      currency: order.currency,
      status: "created",
      metadata: {
        receipt: order.receipt,
        purpose: "verification"
      }
    });

    res.json({
      order: order,
      transaction_id: transaction._id
    });

  } catch (err) {
    console.log("Order creation error:", err);
    res.status(500).json({ message: "Order creation failed" });
  }
};

// Verify Payment and Update User
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: "Payment service not configured." });
    }

    // Verify signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Find user
    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update transaction
    const transaction = await Transaction.findOneAndUpdate(
      { razorpay_order_id: razorpay_order_id },
      {
        razorpay_payment_id: razorpay_payment_id,
        status: "captured",
        metadata: {
          razorpay_signature: razorpay_signature
        }
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Update user verification status in User model
    user.is_verified = true;
    await user.save();

    // Also update the Profile model's is_verified field
    const Profile = require("../models/Profile.model");
    const profile = await Profile.findOne({ uid: userId });
    if (profile) {
      profile.is_verified = true;
      await profile.save();
      console.log('Profile verification status updated');
    }

    res.json({
      message: "Payment verified successfully",
      user: {
        uid: user.uid,
        email: user.email,
        is_verified: user.is_verified
      },
      transaction: transaction
    });

  } catch (err) {
    console.log("Payment verification error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transactions = await Transaction.find({ user_id: user._id })
      .sort({ created_at: -1 })
      .limit(10);

    res.json(transactions);

  } catch (err) {
    console.log("Payment history error:", err);
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
};