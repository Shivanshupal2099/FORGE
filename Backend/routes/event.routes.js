const express = require("express");
const router = express.Router();

const eventController = require("../controllers/event.controller");

// Create a new event
router.post("/", eventController.createEvent);

// Get all events
router.get("/", eventController.getAllEvents);

// Get a single event by ID
router.get("/:id", eventController.getEventById);

// Get all events created by a specific user
router.get("/user/:uid", eventController.getUserEvents);

// Update an event (only the creator can update)
router.put("/:id", eventController.updateEvent);

// Delete an event (only the creator can delete)
router.delete("/:id", eventController.deleteEvent);

module.exports = router;
