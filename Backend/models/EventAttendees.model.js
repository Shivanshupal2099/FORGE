const mongoose = require('mongoose');

const EventAttendeesSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uid: {
    type: String,
    required: true
  },
  registered_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['registered', 'cancelled'],
    default: 'registered'
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Indexes for efficient queries
EventAttendeesSchema.index({ event_id: 1 });
EventAttendeesSchema.index({ user_id: 1 });
EventAttendeesSchema.index({ uid: 1 });

// Compound index to prevent duplicate registrations
EventAttendeesSchema.index({ event_id: 1, user_id: 1 }, { unique: true });
EventAttendeesSchema.index({ event_id: 1, uid: 1 }, { unique: true });

module.exports = mongoose.model('EventAttendees', EventAttendeesSchema);
