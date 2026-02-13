const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/block', adminController.blockUser);
router.put('/users/:id/unblock', adminController.unblockUser);
router.get('/users/:id/tree', adminController.getUserTree);

router.post('/plans', adminController.createPlan);
router.put('/plans/:id', adminController.updatePlan);
router.delete('/plans/:id', adminController.deletePlan);

router.get('/withdrawals', adminController.getAllWithdrawals);
router.put('/withdrawals/:id/approve', adminController.approveWithdrawal);
router.put('/withdrawals/:id/reject', adminController.rejectWithdrawal);

router.get('/reports/investment', adminController.getInvestmentReport);
router.get('/reports/income', adminController.getIncomeReport);
router.get('/reports/withdrawal', adminController.getWithdrawalReport);

module.exports = router;
