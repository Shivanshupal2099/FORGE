const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");

// Create Cashfree order
router.post("/create-order", paymentController.createOrder);

// Get transaction by order ID
router.get("/transaction/:orderId", paymentController.getTransactionByOrderId);

// Verify payment and update user status
router.post("/verify-payment", paymentController.verifyPayment);

// Get payment history for a user
router.get("/history/:userId", paymentController.getPaymentHistory);

module.exports = router;