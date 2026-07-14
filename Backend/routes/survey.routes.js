const express = require("express");
const router = express.Router();

const surveyController = require("../controllers/survey.controller");

// Create a new survey
router.post("/create", surveyController.createSurvey);

// Get all surveys created by a user
router.get("/user/:uid", surveyController.getUserSurveys);

// Get a single survey by ID
router.get("/:id", surveyController.getSurveyById);

module.exports = router;
