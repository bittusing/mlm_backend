const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { protect } = require('../middleware/auth');

router.get('/', planController.getAllPlans);
router.post('/purchase', protect, planController.purchasePlan);
router.get('/my-plans', protect, planController.getMyPlans);

module.exports = router;
