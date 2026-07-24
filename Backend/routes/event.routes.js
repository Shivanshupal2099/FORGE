const express = require("express");
const router = express.Router();

const eventController = require("../controllers/event.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { eventValidation, idValidation, uidValidation } = require("../middlewares/validation.middleware");

// Create a new event (requires authentication)
router.post("/", authMiddleware, eventValidation, eventController.createEvent);

// Get all events (public)
router.get("/", eventController.getAllEvents);

// Get a single event by ID (public)
router.get("/:id", idValidation, eventController.getEventById);

// Get all events created by a specific user (requires authentication for ownership check)
router.get("/user/:uid", authMiddleware, uidValidation, eventController.getUserEvents);

// Update an event (requires authentication and ownership)
router.put("/:id", authMiddleware, idValidation, eventValidation, eventController.updateEvent);

// Delete an event (requires authentication and ownership)
router.delete("/:id", authMiddleware, idValidation, eventController.deleteEvent);

module.exports = router;
