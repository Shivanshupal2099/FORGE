const mongoose = require("mongoose");

const ConnectDB = async () => {
  // Database connection with MongoDB Atlas
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.error('Please check your Render environment variables and ensure MONGODB_URI is set');
    process.exit(1);
  }
  
  console.log('Connecting to MongoDB...');
  console.log('MongoDB URI loaded from environment');

  const options = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: true,
    retryReads: true,
    ssl: true,
    tls: true,
  };

  // Retry logic for connection
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds

  for (let i = 0; i < maxRetries; i++) {
    try {
      await mongoose.connect(mongoUri, options);
      console.log("✅ MongoDB connected successfully");
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🔗 Connection Host: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.log(`❌ MongoDB Atlas Connection Error (Attempt ${i + 1}/${maxRetries}):`);
      console.log(`   Error: ${err.message}`);
      console.log(`   Error Name: ${err.name}`);
      
      if (i < maxRetries - 1) {
        console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.log("❌ Max retries reached. MongoDB Atlas connection failed.");
        console.log("Please check:");
        console.log("1. MONGODB_URI environment variable in Render");
        console.log("2. MongoDB Atlas Network Access (whitelist 0.0.0.0/0)");
        console.log("3. Database user has read/write permissions");
        console.log("4. Username and password in URI are correct");
        console.log("5. MongoDB Atlas cluster status: https://status.mongodb.com/");
        throw err;
      }
    }
  }

  // Handle connection events
  mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to database');
    console.log(`📊 Database Name: ${mongoose.connection.name}`);
    console.log(`🔗 Connection Host: ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (err) => {
    console.log('❌ Mongoose connection error:', err.message);
    console.log('Error details:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  Mongoose disconnected from database');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 Mongoose reconnected to database');
  });

  // Log query errors
  mongoose.set('debug', process.env.NODE_ENV === 'development');
};

module.exports = { ConnectDB };
