const mongoose = require("mongoose");

const ConnectDB = () => {
  // Database connection with timeout options
  const mongoUrl = 'mongodb://127.0.0.1:27017/forge';
  console.log('Connecting to MongoDB with URL:', mongoUrl);

  const options = {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000, // Socket timeout
    connectTimeoutMS: 30000, // Connection timeout
    maxPoolSize: 10, // Maximum connection pool size
    minPoolSize: 2, // Minimum connection pool size
  };

  mongoose.connect(mongoUrl, options)
    .then(() => console.log("Database Connected."))
    .catch((err) => {
      console.log("Database Connection Error:", err);
      console.log("Make sure MongoDB is running on 127.0.0.1:27017");
    });

  // Handle connection events
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
  });
};

module.exports = { ConnectDB };
