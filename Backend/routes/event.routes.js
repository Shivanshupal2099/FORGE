const express = require("express");
const router = express.Router();

const eventController = require("../controllers/event.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { eventValidation, idValidation, uidValidation } = require("../middlewares/validation.middleware");

// Create a new event (requires authentication)
router.post("/", authMiddleware, eventValidation, eventController.createEvent);

// Get all events (public)
router.get("/", eventController.getAllEvents);

// Get a single event by ID (requires authentication for registration status check)
router.get("/:id", authMiddleware, idValidation, eventController.getEventById);

// Get all events created by a specific user (requires authentication for ownership check)
router.get("/user/:uid", authMiddleware, uidValidation, eventController.getUserEvents);

// Update an event (requires authentication and ownership)
router.put("/:id", authMiddleware, idValidation, eventValidation, eventController.updateEvent);

// Delete an event (requires authentication and ownership)
router.delete("/:id", authMiddleware, idValidation, eventController.deleteEvent);

// Register for an event (requires authentication)
router.post("/:id/register", authMiddleware, idValidation, eventController.registerForEvent);

// Check registration status for an event (requires authentication)
router.get("/:id/registration-status", authMiddleware, idValidation, eventController.checkRegistrationStatus);

// Cancel registration for an event (requires authentication)
router.delete("/:id/register", authMiddleware, idValidation, eventController.cancelRegistration);

module.exports = router;
