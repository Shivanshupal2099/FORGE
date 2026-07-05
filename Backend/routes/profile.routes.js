const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profile.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Update user profile
router.put("/update", authMiddleware, profileController.updateProfile);

// Get user profile
router.get("/me", authMiddleware, profileController.getProfile);

module.exports = router;
