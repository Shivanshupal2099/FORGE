const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

const surveyController = require("../controllers/survey.controller");

// ==================== Survey Routes ====================

// Create a new survey
router.post("/create", authMiddleware, surveyController.createSurvey);

// Get all surveys created by a user
router.get("/user/:uid", authMiddleware, surveyController.getUserSurveys);

// Get public surveys
router.get("/public/all", surveyController.getPublicSurveys);

// Get a single survey by ID
router.get("/:id", authMiddleware, surveyController.getSurveyById);

// Update survey
router.put("/:id", authMiddleware, surveyController.updateSurvey);

// Delete survey with cascade delete
router.delete("/:id", authMiddleware, surveyController.deleteSurvey);

// Publish survey
router.put("/:id/publish", authMiddleware, surveyController.publishSurvey);

// Close survey
router.put("/:id/close", authMiddleware, surveyController.closeSurvey);

// ==================== Question Routes ====================

// Add question to survey
router.post("/:surveyId/questions", authMiddleware, surveyController.addQuestion);

// Get survey questions
router.get("/:surveyId/questions", authMiddleware, surveyController.getSurveyQuestions);

// Update question
router.put("/questions/:questionId", authMiddleware, surveyController.updateQuestion);

// Delete question
router.delete("/questions/:questionId", authMiddleware, surveyController.deleteQuestion);

// Reorder questions
router.put("/:surveyId/questions/reorder", authMiddleware, surveyController.reorderQuestions);

// Duplicate question
router.post("/questions/:questionId/duplicate", authMiddleware, surveyController.duplicateQuestion);

// ==================== Response Routes ====================

// Submit survey response
router.post("/:surveyId/responses", authMiddleware, surveyController.submitSurveyResponse);

// Get survey responses
router.get("/:surveyId/responses", authMiddleware, surveyController.getSurveyResponses);

// Get single response with answers
router.get("/responses/:responseId", authMiddleware, surveyController.getSingleResponse);

// Delete response
router.delete("/responses/:responseId", authMiddleware, surveyController.deleteResponse);

// Export responses
router.get("/:surveyId/responses/export", authMiddleware, surveyController.exportResponses);

module.exports = router;
