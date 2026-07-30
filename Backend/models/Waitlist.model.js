const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    description: "Email address for waitlist"
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    description: "Phone number for waitlist"
  },
  joined_at: {
    type: Date,
    default: Date.now,
    description: "When user joined the waitlist"
  },
  status: {
    type: String,
    enum: ['pending', 'invited', 'registered'],
    default: 'pending',
    description: "Waitlist status"
  },
  referral_code: {
    type: String,
    required: false,
    description: "Referral code if any"
  }
}, {
  timestamps: true
});

// Index for faster queries
waitlistSchema.index({ joined_at: -1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);
