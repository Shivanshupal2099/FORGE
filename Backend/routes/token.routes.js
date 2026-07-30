const express = require('express');
const router = express.Router();
const { getUserTokens, addTokens } = require('../controllers/token.controller');

// Get user's token balance and history
router.get('/user/:uid', getUserTokens);

// Add tokens to user's account
router.post('/add', addTokens);

module.exports = router;
