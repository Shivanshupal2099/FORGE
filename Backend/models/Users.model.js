
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    description: "Unique user identifier (from auth provider)"
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    default: null
  },
  auth_provider: {
    type: String,
    enum: ["email", "google"],
    default: "email"
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_online: {
    type: Boolean,
    default: false
  },
  last_seen_at: {
    type: Date,
    default: null
  },
  last_activity_at: {
    type: Date,
    default: null
  },
  last_login_at: {
    type: Date,
    default: null
  },
  deleted_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});



module.exports=mongoose.model('User',userSchema)