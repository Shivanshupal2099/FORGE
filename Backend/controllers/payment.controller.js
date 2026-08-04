const getCashfreeInstance = require("../config/cashfree");
const Transaction = require("../models/Transaction.model");
const User = require("../models/Users.model");
const Profile = require("../models/Profile.model");
const axios = require('axios');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log('Order creation request received');
    console.log('Request body:', req.body);
    console.log('UserId:', userId);

    if (!userId) {
      console.error('User ID is missing from request');
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get Cashfree instance
    const cashfree = getCashfreeInstance();
    
    console.log('Payment request - Cashfree instance:', !!cashfree);
    console.log('Cashfree config:', {
      appId: cashfree?.appId,
      baseURL: cashfree?.baseURL,
      environment: cashfree?.environment,
      apiVersion: cashfree?.apiVersion
    });
    
    // Check if Cashfree is configured
    if (!cashfree) {
      console.error('Cashfree instance is null');
      return res.status(503).json({ message: "Payment service not configured. Please add Cashfree credentials." });
    }

    // Verify user exists
    console.log('Looking up user with uid:', userId);
    const user = await User.findOne({ uid: userId });
    console.log('User found:', !!user);
    
    if (!user) {
      console.error('User not found with uid:', userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('User details:', {
      uid: user.uid,
      email: user.email,
      full_name: user.full_name
    });

    // Get user profile to check for phone number
    const profile = await Profile.findOne({ uid: userId });
    console.log('Profile found:', !!profile);
    console.log('Profile contact_number:', profile?.contact_number);

    // Validate required fields
    if (!user.email) {
      console.error('User email is missing');
      return res.status(400).json({ 
        success: false,
        code: "EMAIL_REQUIRED",
        message: "User email is required for payment processing" 
      });
    }

    // Check phone number from profile (contact_number field)
    const phoneNumber = profile?.contact_number;
    console.log('Phone number:', phoneNumber);

    if (!phoneNumber || phoneNumber === "") {
      console.error('Phone number is missing from profile');
      return res.status(400).json({ 
        success: false,
        code: "PHONE_REQUIRED",
        message: "Please add your contact number in Edit Profile before proceeding with verification payment." 
      });
    }

    // Use user.uid as customer_id (alphanumeric)
    // If uid is not available, use sanitized email
    let customerId;
    if (user.uid && typeof user.uid === 'string' && /^[a-zA-Z0-9_-]+$/.test(user.uid)) {
      customerId = user.uid;
    } else {
      // Sanitize email to remove special characters
      customerId = user.email.replace(/@/g, "_").replace(/\./g, "_");
    }

    console.log('Using customer_id:', customerId);

    // Validate customer_id format
    if (!/^[a-zA-Z0-9_-]+$/.test(customerId)) {
      console.error('Invalid customer_id format:', customerId);
      return res.status(400).json({ 
        success: false,
        code: "INVALID_CUSTOMER_ID",
        message: "Invalid customer ID format. Please contact support." 
      });
    }

    // Use Cashfree REST API to create order
    const orderData = {
      order_amount: 299.00,
      order_currency: "INR",
      customer_details: {
        customer_id: customerId,
        customer_name: user.full_name || `${profile?.first_name} ${profile?.last_name}` || user.email.split('@')[0],
        customer_email: user.email,
        customer_phone: phoneNumber
      }
    };

    console.log('Sending order to Cashfree:', JSON.stringify(orderData, null, 2));

    // Make API call to Cashfree with error handling
    const axios = require('axios');
    let response;
    try {
      response = await axios.post(
        `${cashfree.baseURL}/orders`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': cashfree.appId,
            'x-client-secret': cashfree.secretKey,
            'x-api-version': cashfree.apiVersion
          },
          timeout: 10000 // 10 second timeout
        }
      );
    } catch (error) {
      console.error('Cashfree API error:', error.response?.status);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 500) {
        return res.status(503).json({
          success: false,
          code: "PAYMENT_SERVICE_UNAVAILABLE",
          message: "Payment service is temporarily unavailable. Please try again in a few minutes."
        });
      }
      
      if (error.response?.status === 401) {
        return res.status(500).json({
          success: false,
          code: "PAYMENT_CONFIG_ERROR",
          message: "Payment configuration error. Please contact support."
        });
      }

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return res.status(504).json({
          success: false,
          code: "PAYMENT_TIMEOUT",
          message: "Payment service timed out. Please try again."
        });
      }

      // Generic error
      return res.status(500).json({
        success: false,
        code: "PAYMENT_ERROR",
        message: "Unable to process payment. Please try again or contact support."
      });
    }

    console.log('Cashfree response status:', response.status);
    console.log('Cashfree response data:', JSON.stringify(response.data, null, 2));

    const order = response.data;

    console.log('Cashfree order created:', order.order_id);

    // Create payment session to get payment_session_id
    console.log('Creating payment session...');
    const sessionResponse = await axios.post(
      `${cashfree.baseURL}/orders/${order.order_id}/payments`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': cashfree.appId,
          'x-client-secret': cashfree.secretKey,
          'x-api-version': cashfree.apiVersion
        }
      }
    );

    console.log('Payment session response status:', sessionResponse.status);
    console.log('Payment session response data:', JSON.stringify(sessionResponse.data, null, 2));

    // Add payment_session_id to order object
    if (sessionResponse.data && sessionResponse.data.payment_session_id) {
      order.payment_session_id = sessionResponse.data.payment_session_id;
      console.log('Payment Session ID:', order.payment_session_id);
    }

    // Check if transaction already exists for this order
    const existingTransaction = await Transaction.findOne({ 
      cashfree_order_id: order.order_id 
    });

    if (existingTransaction) {
      console.log('Transaction already exists for order:', order.order_id);
      
      // Create a new payment session for the existing order
      console.log('Creating new payment session for existing order...');
      try {
        const sessionResponse = await axios.post(
          `${cashfree.baseURL}/orders/${order.order_id}/payments`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'x-client-id': cashfree.appId,
              'x-client-secret': cashfree.secretKey,
              'x-api-version': cashfree.apiVersion
            }
          }
        );

        console.log('Payment session response status:', sessionResponse.status);
        console.log('Payment session response data:', JSON.stringify(sessionResponse.data, null, 2));

        // Add payment_session_id to order object
        if (sessionResponse.data && sessionResponse.data.payment_session_id) {
          order.payment_session_id = sessionResponse.data.payment_session_id;
          console.log('Payment Session ID for existing order:', order.payment_session_id);
        }
      } catch (sessionError) {
        console.error('Failed to create payment session for existing order:', sessionError);
        // Continue without payment_session_id, frontend will handle the error
      }
      
      return res.json({
        success: true,
        order: order,
        transaction_id: existingTransaction._id,
        message: "Order already processed"
      });
    }

    // Check for pending transactions for this user (prevent duplicate orders)
    const pendingTransaction = await Transaction.findOne({
      user_id: user._id,
      status: "created",
      metadata: { purpose: "verification" }
    });

    if (pendingTransaction) {
      console.log('Pending transaction exists for user:', pendingTransaction._id);
      // Return the existing pending order instead of creating a new one
      // Fetch the existing order details from Cashfree
      try {
        const existingOrderResponse = await axios.get(
          `${cashfree.baseURL}/orders/${pendingTransaction.cashfree_order_id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-client-id': cashfree.appId,
              'x-client-secret': cashfree.secretKey,
              'x-api-version': cashfree.apiVersion
            }
          }
        );
        
        console.log('Fetched existing order:', pendingTransaction.cashfree_order_id);
        
        // Create a new payment session for the existing order
        console.log('Creating new payment session for pending order...');
        const sessionResponse = await axios.post(
          `${cashfree.baseURL}/orders/${pendingTransaction.cashfree_order_id}/payments`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'x-client-id': cashfree.appId,
              'x-client-secret': cashfree.secretKey,
              'x-api-version': cashfree.apiVersion
            }
          }
        );

        console.log('Payment session response status:', sessionResponse.status);
        console.log('Payment session response data:', JSON.stringify(sessionResponse.data, null, 2));

        // Add payment_session_id to order object
        if (sessionResponse.data && sessionResponse.data.payment_session_id) {
          existingOrderResponse.data.payment_session_id = sessionResponse.data.payment_session_id;
          console.log('Payment Session ID for pending order:', existingOrderResponse.data.payment_session_id);
        }
        
        console.log('Returning existing pending order with new payment session:', pendingTransaction.cashfree_order_id);
        return res.json({
          success: true,
          order: existingOrderResponse.data,
          transaction_id: pendingTransaction._id,
          message: "Using existing pending order"
        });
      } catch (orderError) {
        console.error('Failed to fetch existing order or create payment session:', orderError);
        // If we can't fetch the existing order, continue with creating a new one
      }
    }

    // Create transaction record without cashfree_payment_id initially
    const transaction = await Transaction.create({
      user_id: user._id,
      cashfree_order_id: order.order_id,
      order_amount: order.order_amount,
      order_currency: order.order_currency,
      status: "created",
      metadata: {
        purpose: "verification",
        customer_id: customerId
      }
    }).catch(async (err) => {
      // If duplicate key error on cashfree_payment_id, it means old index exists
      if (err.code === 11000 && err.keyPattern && err.keyPattern.cashfree_payment_id) {
        console.error('Old non-sparse index detected on cashfree_payment_id');
        console.error('Dropping old index and recreating with sparse option...');
        
        try {
          // Drop the old index
          await Transaction.collection.dropIndex('cashfree_payment_id_1');
          console.log('Old index dropped successfully');
          
          // Recreate transaction after index fix
          return await Transaction.create({
            user_id: user._id,
            cashfree_order_id: order.order_id,
            order_amount: order.order_amount,
            order_currency: order.order_currency,
            status: "created",
            metadata: {
              purpose: "verification",
              customer_id: customerId
            }
          });
        } catch (indexError) {
          console.error('Failed to fix index:', indexError);
          throw err; // Throw original error if index fix fails
        }
      }
      throw err;
    });

    console.log('Transaction created:', transaction._id);

    res.json({
      success: true,
      order: order,
      transaction_id: transaction._id
    });

  } catch (err) {
    console.error("Order creation error:", err);
    console.error("Error details:", err.response?.data || err.message);
    console.error("Error stack:", err.stack);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      console.error("MongoDB duplicate key error:", err);
      const field = Object.keys(err.keyPattern || {})[0];
      return res.status(400).json({
        success: false,
        code: "DUPLICATE_TRANSACTION",
        message: `A transaction with this ${field} already exists. Please try again or contact support.`,
        error: "Duplicate key error",
        field: field
      });
    }
    
    // Return detailed error message
    if (err.response) {
      // Cashfree API error
      console.error("Cashfree API error:", err.response.status, err.response.data);
      return res.status(err.response.status).json({
        success: false,
        code: "CASHFREE_API_ERROR",
        message: "Order creation failed at payment gateway",
        error: {
          status: err.response.status,
          data: err.response.data
        }
      });
    } else if (err.request) {
      // Network error
      console.error("Network error:", err.message);
      return res.status(500).json({
        success: false,
        code: "NETWORK_ERROR",
        message: "Network error. Unable to connect to Cashfree API.",
        error: err.message
      });
    } else {
      // Other error
      console.error("Unknown error:", err.message);
      return res.status(500).json({
        success: false,
        code: "UNKNOWN_ERROR",
        message: "Order creation failed due to server error",
        error: err.message
      });
    }
  }
};

// Get Transaction by Order ID
exports.getTransactionByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('=== GET TRANSACTION BY ORDER ID ===');
    console.log('Order ID:', orderId);

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const transaction = await Transaction.findOne({ cashfree_order_id: orderId });

    if (!transaction) {
      console.log('Transaction not found for order:', orderId);
      return res.status(404).json({ message: "Transaction not found" });
    }

    console.log('Transaction found:', transaction._id);
    console.log('Transaction status:', transaction.status);
    console.log('Payment ID:', transaction.cashfree_payment_id);

    res.json({
      success: true,
      transaction: {
        _id: transaction._id,
        cashfree_order_id: transaction.cashfree_order_id,
        cashfree_payment_id: transaction.cashfree_payment_id,
        status: transaction.status,
        order_amount: transaction.order_amount,
        order_currency: transaction.order_currency,
        signature: transaction.metadata?.signature
      }
    });

  } catch (err) {
    console.error("Get transaction error:", err);
    res.status(500).json({
      message: "Failed to get transaction",
      error: err.message
    });
  }
};

// Verify Payment and Update User
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      order_id, 
      payment_id, 
      signature,
      userId 
    } = req.body;

    console.log('=== PAYMENT VERIFICATION STARTED ===');
    console.log('Order ID:', order_id);
    console.log('Payment ID:', payment_id);
    console.log('Signature:', signature);
    console.log('User ID (email):', userId);

    if (!order_id) {
      console.error('Missing order_id');
      return res.status(400).json({ message: "Missing order details" });
    }

    // Check if Cashfree is configured
    if (!process.env.CASHFREE_SECRET_KEY) {
      console.error('Cashfree not configured');
      return res.status(503).json({ message: "Payment service not configured." });
    }

    // Find user by email (userId is email in this case)
    const user = await User.findOne({ email: userId });
    console.log('User found:', !!user);
    if (user) {
      console.log('User current is_verified status:', user.is_verified);
    }
    
    if (!user) {
      console.error('User not found with email:', userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Get transaction
    const transaction = await Transaction.findOne({ cashfree_order_id: order_id });
    console.log('Transaction found:', !!transaction);
    
    if (!transaction) {
      console.error('Transaction not found for order:', order_id);
      return res.status(404).json({ message: "Transaction not found" });
    }

    console.log('Transaction status:', transaction.status);
    console.log('Transaction payment_id:', transaction.cashfree_payment_id);

    // If transaction is already success, just refresh user verification status
    if (transaction.status === 'success') {
      console.log('Transaction already verified, refreshing user verification status');
      user.is_verified = true;
      await user.save();

      const profile = await Profile.findOne({ uid: user.uid });
      if (profile) {
        profile.is_verified = true;
        await profile.save();
        console.log('Profile verification status updated');
      }

      console.log('=== PAYMENT VERIFICATION COMPLETED (ALREADY VERIFIED) ===');
      return res.json({
        message: "Payment verified successfully",
        user: {
          uid: user.uid,
          email: user.email,
          is_verified: user.is_verified
        },
        transaction: transaction
      });
    }

    // If payment_id is not provided, fetch it from Cashfree
    let finalPaymentId = payment_id || transaction.cashfree_payment_id;
    let finalSignature = signature || transaction.metadata?.signature;

    if (!finalPaymentId) {
      console.log('Payment ID not available, fetching from Cashfree API...');
      try {
        const cashfree = getCashfreeInstance();
        
        if (!cashfree) {
          throw new Error('Cashfree instance not available');
        }

        console.log('Fetching order from Cashfree:', `${cashfree.baseURL}/orders/${order_id}`);
        const orderResponse = await axios.get(
          `${cashfree.baseURL}/orders/${order_id}`,
          {
            headers: {
              'Accept': 'application/json',
              'x-client-id': cashfree.appId,
              'x-client-secret': cashfree.secretKey,
              'x-api-version': cashfree.apiVersion
            }
          }
        );

        console.log('Cashfree order response:', orderResponse.data);
        
        // Check order status - Cashfree returns different statuses
        const orderStatus = orderResponse.data.order_status || orderResponse.data.order?.order_status;
        console.log('Order status from Cashfree:', orderStatus);
        
        if (orderStatus === 'PAID' || orderStatus === 'SUCCESS') {
          console.log('Order is PAID/SUCCESS in Cashfree, proceeding with verification');
          // Extract payment_id from response
          finalPaymentId = orderResponse.data.payment_id || 
                          orderResponse.data.order?.payment_id || 
                          orderResponse.data.payments?.[0]?.payment_id ||
                          finalPaymentId;
          console.log('Extracted payment_id:', finalPaymentId);
        } else if (orderStatus === 'ACTIVE' || orderStatus === 'PENDING') {
          console.error('Order still pending. Status:', orderStatus);
          return res.status(400).json({ 
            message: "Payment not completed yet",
            order_status: orderStatus
          });
        } else {
          console.error('Order failed or cancelled. Status:', orderStatus);
          // Update transaction to failed status
          await Transaction.findOneAndUpdate(
            { cashfree_order_id: order_id },
            { status: 'failed' }
          );
          return res.status(400).json({ 
            message: "Payment failed or cancelled",
            order_status: orderStatus
          });
        }
      } catch (cashfreeError) {
        console.error('Error fetching order from Cashfree:', cashfreeError);
        console.error('Error response:', cashfreeError.response?.data);
        return res.status(500).json({ 
          message: "Failed to verify payment status from Cashfree",
          error: cashfreeError.message
        });
      }
    }

    // Update transaction with success status and payment details
    console.log('Updating transaction to success status...');
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { cashfree_order_id: order_id },
      {
        cashfree_payment_id: finalPaymentId,
        status: "success",
        metadata: {
          signature: finalSignature,
          verified_at: new Date().toISOString()
        }
      },
      { new: true }
    );

    console.log('Transaction updated:', updatedTransaction._id);
    console.log('Transaction status:', updatedTransaction.status);
    console.log('Transaction payment_id:', updatedTransaction.cashfree_payment_id);

    // Update user verification status in User model
    console.log('Updating user is_verified to true');
    user.is_verified = true;
    await user.save();
    console.log('User verification status updated in User model');

    // Also update the Profile model's is_verified field
    const profile = await Profile.findOne({ uid: user.uid });
    if (profile) {
      console.log('Profile found, updating is_verified');
      profile.is_verified = true;
      await profile.save();
      console.log('Profile verification status updated');
    } else {
      console.log('Profile not found for uid:', user.uid);
    }

    console.log('=== PAYMENT VERIFICATION COMPLETED ===');
    res.json({
      message: "Payment verified successfully",
      user: {
        uid: user.uid,
        email: user.email,
        is_verified: user.is_verified
      },
      transaction: updatedTransaction
    });

  } catch (err) {
    console.error("Payment verification error:", err);
    console.error("Error details:", err.response?.data || err.message);
    console.error("Error stack:", err.stack);
    
    // Return detailed error message
    if (err.response) {
      return res.status(err.response.status).json({
        message: "Payment verification failed",
        error: err.response.data
      });
    } else if (err.request) {
      return res.status(500).json({
        message: "Network error. Unable to verify payment."
      });
    } else {
      return res.status(500).json({
        message: "Payment verification failed",
        error: err.message
      });
    }
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