const mongoose = require("mongoose");

const ConnectDB = () => {
  // Database connection with MongoDB Atlas
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI or MONGO_URL not found in environment variables');
    console.error('Please check your .env file and ensure MONGODB_URI is set');
    process.exit(1);
  }
  
  console.log('Connecting to MongoDB...');
  console.log('Using URI:', mongoUri.substring(0, 50) + '...');

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
  };

  mongoose.connect(mongoUri, options)
    .then(() => {
      console.log("✅ Database Connected successfully");
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🔗 Connection Host: ${mongoose.connection.host}`);
    })
    .catch((err) => {
      console.log("❌ Database Connection Error:", err.message);
      console.log("Please check your MONGODB_URI in .env file");
      console.log("Make sure MongoDB Atlas is accessible and credentials are correct");
      console.log("Common issues:");
      console.log("- IP not whitelisted in MongoDB Atlas Network Access");
      console.log("- Incorrect username/password in connection string");
      console.log("- SSL/TLS configuration issues");
    });

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
