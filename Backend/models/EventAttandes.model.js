const mongoose = require("mongoose");

const eventAttendeeSchema = new mongoose.Schema(
  {
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: [
        "going",
        "waitlist",
        "maybe",
        "not_going"
      ],
      default: "going"
    },

    checked_in: {
      type: Boolean,
      default: false
    },

    checked_in_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: "registered_at",
      updatedAt: false
    }
  }
);

// Prevent duplicate registrations
eventAttendeeSchema.index(
  { event_id: 1, user_id: 1 },
  { unique: true }
);

// Indexes for efficient queries
eventAttendeeSchema.index({ event_id: 1 });
eventAttendeeSchema.index({ user_id: 1 });
eventAttendeeSchema.index({ event_id: 1, status: 1 });
eventAttendeeSchema.index({ checked_in: 1 });

module.exports = mongoose.model("EventAttendee", eventAttendeeSchema);