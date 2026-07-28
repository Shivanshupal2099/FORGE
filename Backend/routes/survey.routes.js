const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { surveyValidation, questionValidation, idValidation, uidValidation, surveyIdValidation } = require("../middlewares/validation.middleware");

const surveyController = require("../controllers/survey.controller");

// ==================== Survey Routes ====================

// Create a new survey
router.post("/create", authMiddleware, surveyValidation, surveyController.createSurvey);

// Get all surveys created by a user
router.get("/user/:uid", authMiddleware, uidValidation, surveyController.getUserSurveys);

// Get public surveys
router.get("/public/all", surveyController.getPublicSurveys);

// Get a single survey by ID
router.get("/:id", authMiddleware, idValidation, surveyController.getSurveyById);

// Update survey
router.put("/:id", authMiddleware, idValidation, surveyValidation, surveyController.updateSurvey);

// Delete survey with cascade delete
router.delete("/:id", authMiddleware, idValidation, surveyController.deleteSurvey);

// Publish survey
router.put("/:id/publish", authMiddleware, idValidation, surveyController.publishSurvey);

// Close survey
router.put("/:id/close", authMiddleware, idValidation, surveyController.closeSurvey);

// ==================== Question Routes ====================

// Add question to survey
router.post("/:surveyId/questions", authMiddleware, surveyIdValidation, questionValidation, surveyController.addQuestion);

// Get survey questions (public access for feed)
router.get("/:surveyId/questions", surveyController.getSurveyQuestions);

// Update question
router.put("/questions/:questionId", authMiddleware, idValidation, questionValidation, surveyController.updateQuestion);

// Delete question
router.delete("/questions/:questionId", authMiddleware, idValidation, surveyController.deleteQuestion);

// Reorder questions
router.put("/:surveyId/questions/reorder", authMiddleware, surveyIdValidation, surveyController.reorderQuestions);

// Duplicate question
router.post("/questions/:questionId/duplicate", authMiddleware, idValidation, surveyController.duplicateQuestion);

// ==================== Response Routes ====================

// Submit survey response
router.post("/:surveyId/responses", authMiddleware, surveyIdValidation, surveyController.submitSurveyResponse);

// Get survey responses
router.get("/:surveyId/responses", authMiddleware, surveyIdValidation, surveyController.getSurveyResponses);

// Get single response with answers
router.get("/responses/:responseId", authMiddleware, idValidation, surveyController.getSingleResponse);

// Delete response
router.delete("/responses/:responseId", authMiddleware, idValidation, surveyController.deleteResponse);

// Export responses
router.get("/:surveyId/responses/export", authMiddleware, surveyIdValidation, surveyController.exportResponses);

module.exports = router;
