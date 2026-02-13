const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', withdrawalController.createWithdrawal);
router.get('/', withdrawalController.getMyWithdrawals);

module.exports = router;
