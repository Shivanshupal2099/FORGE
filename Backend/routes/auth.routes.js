const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ===========================
// Google Authentication
// ===========================




// Login/Register with Google
router.post("/google", authController.googleAuth);



// Get current logged-in user
router.get("/me", authMiddleware, authController.getCurrentUser);




// Logout
router.post("/logout", authMiddleware, authController.logout);




// Refresh Access Token (optional if using JWT refresh tokens)
router.post("/refresh", authController.refreshToken);

module.exports = router;