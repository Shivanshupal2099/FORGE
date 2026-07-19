const express = require("express");
const router = express.Router();

const eventController = require("../controllers/event.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Create a new event (requires authentication)
router.post("/", authMiddleware, eventController.createEvent);

// Get all events (public)
router.get("/", eventController.getAllEvents);

// Get a single event by ID (public)
router.get("/:id", eventController.getEventById);

// Get all events created by a specific user (requires authentication for ownership check)
router.get("/user/:uid", authMiddleware, eventController.getUserEvents);

// Update an event (requires authentication and ownership)
router.put("/:id", authMiddleware, eventController.updateEvent);

// Delete an event (requires authentication and ownership)
router.delete("/:id", authMiddleware, eventController.deleteEvent);

module.exports = router;
