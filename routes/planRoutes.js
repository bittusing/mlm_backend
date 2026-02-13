const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { protect } = require('../middleware/auth');
const { planPurchaseLimiter, apiLimiter } = require('../middleware/rateLimiter');

router.get('/', planController.getAllPlans);
router.post('/purchase', protect, planPurchaseLimiter, planController.purchasePlan);
router.get('/my-plans', protect, apiLimiter, planController.getMyPlans);

module.exports = router;
