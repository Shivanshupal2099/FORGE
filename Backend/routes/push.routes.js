const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const controller = require('../controllers/push.controller');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get VAPID public key (no auth required for this one)
router.get('/vapid-public-key', controller.getVapidPublicKey);

// Subscribe to push notifications
router.post('/subscribe', controller.subscribe);

// Unsubscribe from push notifications
router.post('/unsubscribe', controller.unsubscribe);

// Get user's active subscriptions
router.get('/subscriptions', controller.getSubscriptions);

module.exports = router;
