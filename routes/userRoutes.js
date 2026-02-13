const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const transactionController = require('../controllers/transactionController');
const withdrawalController = require('../controllers/withdrawalController');
const teamController = require('../controllers/teamController');
const { protect } = require('../middleware/auth');
const { withdrawalLimiter, apiLimiter } = require('../middleware/rateLimiter');

router.use(protect);

// Apply general API rate limiter to all user routes
router.use(apiLimiter);

router.get('/dashboard', userController.getDashboard);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

router.get('/transactions', transactionController.getMyTransactions);
router.get('/income', transactionController.getIncomeBreakdown);

// Apply specific withdrawal rate limiter
router.post('/withdrawals', withdrawalLimiter, withdrawalController.createWithdrawal);
router.get('/withdrawals', withdrawalController.getMyWithdrawals);

router.get('/team/direct', teamController.getDirectReferrals);
router.get('/team/tree', teamController.getTeamTree);
router.get('/team/levels', teamController.getLevelWiseTeam);

module.exports = router;
