const express = require("express");
const router = express.Router();

const issueController = require("../controllers/issue.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Create a new issue report
router.post("/report", authMiddleware, issueController.createIssue);

// Get all issues (admin only - optional)
router.get("/all", issueController.getAllIssues);

module.exports = router;
