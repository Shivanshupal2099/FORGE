const express = require("express");
const router = express.Router();

const locationController = require("../controllers/location.controller");

// Get all user locations
router.get("/all", locationController.getAllUserLocations);

// Save/update user location
router.post("/save", locationController.saveUserLocation);

// Delete user location
router.delete("/:uid", locationController.deleteUserLocation);

module.exports = router;
