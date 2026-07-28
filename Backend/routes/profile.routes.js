const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profile.controller");
const { uidValidation } = require("../middlewares/validation.middleware");

// Update user profile (no auth middleware for now, using UID from request)
router.put("/update", profileController.updateProfile);

// Update user location
router.put("/:uid/location", uidValidation, profileController.updateLocation);

// Get user profile
router.get("/me", profileController.getProfile);

// Get user profile by uid
router.get("/:uid", uidValidation, profileController.getProfile);

module.exports = router;
