const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      description: "Unique user identifier (from auth provider) - event creator"
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 255,
      trim: true
    },
    description: {
      type: String,
      default: null
    },
    category: {
      type: String,
      enum: ["Workshop", "Meetup", "Conference", "Social", "Sports", "Charity", "Other"],
      default: null
    },
    onlineType: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Offline"
    },
    locationOrLink: {
      type: String,
      default: null
    },
    startAt: {
      type: Date,
      default: null
    },
    endAt: {
      type: Date,
      default: null
    },
    organizer: {
      type: String,
      default: null
    },
    registrationRequired: {
      type: Boolean,
      default: false
    },
    maxAttendees: {
      type: Number,
      default: null,
      min: 1
    },
    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public"
    },
    priceType: {
      type: String,
      enum: ["Free", "Paid"],
      default: "Free"
    },
    contactInformation: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },
    imageUrl: {
      type: String,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

// Indexes for efficient queries
eventSchema.index({ uid: 1 });
eventSchema.index({ user_id: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ startAt: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model("Event", eventSchema);