const mongoose = require('mongoose');

const EventAttendeesSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  uid: {
    type: String,
    required: true,
    index: true
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

// Compound index to prevent duplicate registrations
EventAttendeesSchema.index({ event_id: 1, user_id: 1 }, { unique: true });
EventAttendeesSchema.index({ event_id: 1, uid: 1 }, { unique: true });

module.exports = mongoose.model('EventAttendees', EventAttendeesSchema);
