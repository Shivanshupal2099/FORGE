const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ===========================
// Google Authentication
// ===========================

// Login/Register with Google
router.post("/google", authController.googleAuth);

// Sync user from Supabase to MongoDB
router.post("/sync", authController.syncUser);

// Get current logged-in user
router.get("/me", authMiddleware, authController.getCurrentUser);

// Logout
router.post("/logout", authMiddleware, authController.logout);

// Get user online status
router.get("/status/:uid", authController.getUserStatus);

// Delete account
router.delete("/delete-account", authMiddleware, authController.deleteAccount);

module.exports = router;