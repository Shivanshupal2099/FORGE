const mongoose = require("mongoose");

const userLocationSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      description: "Unique user identifier (from auth provider)"
    },

    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },

    accuracy_meters: {
      type: Number,
      min: 0,
      default: null
    },

    sharing_level: {
      type: String,
      enum: ["exact", "approximate", "city_only", "off"],
      default: "exact"
    },

    expires_at: {
      type: Date,
      default: null
    },

    is_virtual: {
      type: Boolean,
      default: false
    },

    virtual_city: {
      type: String,
      maxlength: 80,
      default: null
    },

    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Geo index for nearby user searches
userLocationSchema.index({
  latitude: 1,
  longitude: 1
});

// TTL index for automatic cleanup of expired locations
userLocationSchema.index(
  { expires_at: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model("UserLocation", userLocationSchema);
