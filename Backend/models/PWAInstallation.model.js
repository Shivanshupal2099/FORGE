const mongoose = require('mongoose');

const PWAInstallationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  device: {
    type: String,
    default: null
  },
  platform: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
PWAInstallationSchema.index({ email: 1, timestamp: -1 });

module.exports = mongoose.model('PWAInstallation', PWAInstallationSchema);
