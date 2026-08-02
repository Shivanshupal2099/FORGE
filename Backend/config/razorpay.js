const Razorpay = require("razorpay");

// Singleton pattern with lazy initialization
let razorpayInstance = null;

function getRazorpayInstance() {
  // Always check credentials at runtime (handles module caching)
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️ Razorpay credentials not found in environment variables');
    console.warn('Current env vars:', {
      RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET
    });
    return null;
  }

  // Return existing instance if already created
  if (razorpayInstance) {
    return razorpayInstance;
  }

  // Create new instance
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
    return razorpayInstance;
  } catch (error) {
    console.error('❌ Razorpay initialization failed:', error);
    return null;
  }
}

module.exports = getRazorpayInstance;