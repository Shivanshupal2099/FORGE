const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profile.controller");

// Update user profile (no auth middleware for now, using UID from request)
router.put("/update", profileController.updateProfile);

// Get user profile
router.get("/me", profileController.getProfile);

// Get user profile by uid
router.get("/:uid", profileController.getProfile);

module.exports = router;
