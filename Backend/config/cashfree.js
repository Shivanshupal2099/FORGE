const axios = require('axios');

// Singleton pattern with lazy initialization
let cashfreeConfig = null;

function getCashfreeInstance() {
  // Always check credentials at runtime (handles module caching)
  if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
    console.warn('⚠️ Cashfree credentials not found in environment variables');
    console.warn('Current env vars:', {
      CASHFREE_APP_ID: !!process.env.CASHFREE_APP_ID,
      CASHFREE_SECRET_KEY: !!process.env.CASHFREE_SECRET_KEY
    });
    return null;
  }

  // Return existing config if already created
  if (cashfreeConfig) {
    return cashfreeConfig;
  }

  // Create config object
  try {
    const environment = (process.env.CASHFREE_ENVIRONMENT || process.env.CASHFREE_ENV || process.env.NODE_ENV).toUpperCase();
    cashfreeConfig = {
      appId: process.env.CASHFREE_APP_ID,
      secretKey: process.env.CASHFREE_SECRET_KEY,
      environment: environment === 'PRODUCTION' ? 'production' : 'sandbox',
      apiVersion: process.env.CASHFREE_API_VERSION || '2022-09-01',
      baseURL: environment === 'PRODUCTION' 
        ? 'https://api.cashfree.com/pg' 
        : 'https://sandbox.cashfree.com/pg'
    };
    console.log('✅ Cashfree initialized successfully in', cashfreeConfig.environment, 'mode');
    console.log('📝 Using API version:', cashfreeConfig.apiVersion);
    return cashfreeConfig;
  } catch (error) {
    console.error('❌ Cashfree initialization failed:', error);
    return null;
  }
}

module.exports = getCashfreeInstance;
