const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const controller = require('../controllers/connection.controller');

const router = express.Router();
router.use(authMiddleware);
router.post('/', controller.createRequest);
router.get('/incoming', controller.getIncomingRequests);
router.get('/sent', controller.getSentRequests);
router.get('/accepted', controller.getAcceptedConnections);
router.get('/connected', controller.getAcceptedConnections);
router.put('/:connectionId/accept', controller.acceptRequest);
router.put('/:connectionId/decline', controller.declineRequest);
router.delete('/:connectionId', controller.disconnect);

module.exports = router;
