const express = require('express');
const router = express.Router();
const {
  createCustomCommunity,
  joinCommunity,
  getUserCommunities,
  getAllCommunities,
  leaveCommunity
} = require('../controllers/community.controller');

// Middleware to authenticate user
const authMiddleware = require('../middlewares/auth.middleware');

// Create a custom community
router.post('/create', authMiddleware, createCustomCommunity);

// Join a community (predefined or by ID)
router.post('/join', authMiddleware, joinCommunity);

// Get user's communities
router.get('/user/:uid', authMiddleware, getUserCommunities);

// Get all available communities (for discovery)
router.get('/all', authMiddleware, getAllCommunities);

// Leave a community
router.post('/leave', authMiddleware, leaveCommunity);

module.exports = router;
