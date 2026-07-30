const mongoose = require("mongoose");

const ConnectDB = async () => {
  // Database connection with MongoDB Atlas
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI or MONGO_URL not found in environment variables');
    console.error('Please check your .env file and ensure MONGODB_URI is set');
    process.exit(1);
  }
  
  console.log('Connecting to MongoDB...');
  console.log('MongoDB URI loaded from environment');

  const options = {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 60000, // Increase socket timeout to 60 seconds
    connectTimeoutMS: 30000, // Connection timeout
    maxPoolSize: 10, // Maximum connection pool size
    minPoolSize: 2, // Minimum connection pool size
    retryWrites: true,
    retryReads: true,
    maxIdleTimeMS: 10000, // Close idle connections after 10 seconds
    waitQueueTimeoutMS: 5000, // Timeout for connection from pool
    ssl: true, // Enable SSL for MongoDB Atlas
    tls: true, // Enable TLS
    tlsAllowInvalidCertificates: false, // Don't allow invalid certificates
    tlsAllowInvalidHostnames: false, // Don't allow invalid hostnames
    // Add connection resilience options
    heartbeatFrequencyMS: 10000, // Send heartbeat every 10 seconds
    monitorCommands: true, // Enable command monitoring
    autoIndex: false, // Disable auto index creation in production
  };

  // Retry logic for connection
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds

  for (let i = 0; i < maxRetries; i++) {
    try {
      await mongoose.connect(mongoUri, options);
      console.log("✅ Database Connected successfully");
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🔗 Connection Host: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.log(`❌ Database Connection Error (Attempt ${i + 1}/${maxRetries}):`, err.message);
      
      if (i < maxRetries - 1) {
        console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.log("❌ Max retries reached. Database connection failed.");
        console.log("Please check your MONGODB_URI in .env file");
        console.log("Make sure MongoDB Atlas is accessible and credentials are correct");
        console.log("Common issues:");
        console.log("- IP not whitelisted in MongoDB Atlas Network Access");
        console.log("- Incorrect username/password in connection string");
        console.log("- SSL/TLS configuration issues");
        console.log("- MongoDB Atlas cluster is down or undergoing maintenance");
        console.log("Check MongoDB Atlas status: https://status.mongodb.com/");
        throw err;
      }
    }
  }

  // Handle connection events
  mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to database');
  });

  mongoose.connection.on('error', (err) => {
    console.log('❌ Mongoose connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  Mongoose disconnected from database');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 Mongoose reconnected to database');
  });
};

module.exports = { ConnectDB };
