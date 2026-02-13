const Plan = require('../models/Plan');
const UserPlan = require('../models/UserPlan');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const commissionService = require('../services/commissionService');

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const user = await User.findById(userId);
    
    // Calculate expiry date
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + plan.duration);

    // Create user plan
    const userPlan = await UserPlan.create({
      userId,
      planId: plan._id,
      amount: plan.amount,
      roiPercentage: plan.roiPercentage,
      duration: plan.duration,
      monthlyReturn: plan.monthlyReturn,
      startDate,
      expiryDate
    });

    // Update user
    user.totalInvestment += plan.amount;
    user.activePlan = plan._id;
    await user.save();

    // Distribute commissions - IMPORTANT: This runs immediately
    console.log(`Starting commission distribution for user ${userId}, plan amount: ${plan.amount}`);
    await commissionService.distributeCommissions(userId, plan.amount, plan._id);
    console.log(`Commission distribution completed for user ${userId}`);

    res.json({
      success: true,
      message: 'Plan purchased successfully',
      userPlan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyPlans = async (req, res) => {
  try {
    const plans = await UserPlan.find({ userId: req.user.id }).populate('planId');
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
