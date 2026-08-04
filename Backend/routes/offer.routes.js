const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  redeemOffer,
  getUserOffers,
  reportOffer
} = require('../controllers/offer.controller');

// Public routes - get offers
router.get('/', getAllOffers);
router.get('/:id', getOfferById);

// Protected routes - require authentication
router.post('/', authMiddleware, createOffer);
router.put('/:id', authMiddleware, updateOffer);
router.delete('/:id', authMiddleware, deleteOffer);
router.post('/:id/redeem', authMiddleware, redeemOffer);
router.post('/:id/report', authMiddleware, reportOffer);
router.get('/user/:userId', authMiddleware, getUserOffers);

module.exports = router;