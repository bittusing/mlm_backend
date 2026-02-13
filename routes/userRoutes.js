const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const transactionController = require('../controllers/transactionController');
const withdrawalController = require('../controllers/withdrawalController');
const teamController = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', userController.getDashboard);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

router.get('/transactions', transactionController.getMyTransactions);
router.get('/income', transactionController.getIncomeBreakdown);

router.post('/withdrawals', withdrawalController.createWithdrawal);
router.get('/withdrawals', withdrawalController.getMyWithdrawals);

router.get('/team/direct', teamController.getDirectReferrals);
router.get('/team/tree', teamController.getTeamTree);
router.get('/team/levels', teamController.getLevelWiseTeam);

module.exports = router;
