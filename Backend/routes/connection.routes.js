const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const controller = require('../controllers/connection.controller');

const router = express.Router();
router.use(authMiddleware);
router.post('/', controller.createRequest);
router.get('/incoming', controller.getIncomingRequests);
router.get('/accepted', controller.getAcceptedConnections);
router.put('/:connectionId/accept', controller.acceptRequest);
router.put('/:connectionId/decline', controller.declineRequest);

module.exports = router;
