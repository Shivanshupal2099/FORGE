const express = require("express");
const router = express.Router();

const locationController = require("../controllers/location.controller");

// Get all user locations
router.get("/all", locationController.getAllUserLocations);

// Save/update user location
router.post("/save", locationController.saveUserLocation);

module.exports = router;
