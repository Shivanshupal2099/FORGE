const express = require("express");
const router = express.Router();

const waitlistController = require("../controllers/waitlist.controller");

// Add user to waitlist
router.post("/", waitlistController.addToWaitlist);

// Get waitlist stats (admin only - add auth middleware later)
router.get("/stats", waitlistController.getWaitlistStats);

module.exports = router;
