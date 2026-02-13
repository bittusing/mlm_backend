const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/settings', commissionController.getSettings);
router.put('/settings', commissionController.updateSettings);

module.exports = router;
