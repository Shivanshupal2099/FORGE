const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const controller = require('../controllers/chat.controller');

const router = express.Router();
router.use(authMiddleware);
router.get('/:connectionId/messages', controller.getMessages);
router.post('/:connectionId/messages', controller.sendMessage);

module.exports = router;
