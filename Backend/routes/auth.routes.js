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

// Get user statistics (total users and active users)
router.get("/stats", authController.getUserStats);

// ===========================
// Session Management
// ===========================

// Get all active sessions for current user
router.get("/sessions", authMiddleware, authController.getUserSessions);

// Revoke a specific session
router.delete("/sessions/:sessionId", authMiddleware, authController.revokeSession);

// Revoke all sessions except current
router.post("/sessions/revoke-others", authMiddleware, authController.revokeOtherSessions);

module.exports = router;