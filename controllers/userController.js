const User = require('../models/User');
const UserPlan = require('../models/UserPlan');
const Transaction = require('../models/Transaction');
const treeService = require('../services/treeService');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password');
    const directReferrals = await User.countDocuments({ sponsorId: userId });
    const teamSize = await treeService.getTeamCount(userId);
    const activePlans = await UserPlan.find({ userId, status: 'ACTIVE' });

    res.json({
      success: true,
      data: {
        totalInvestment: user.totalInvestment,
        totalROI: user.totalROI,
        totalCommission: user.totalCommission,
        walletBalance: user.walletBalance,
        directReferrals,
        teamSize,
        activePlansCount: activePlans.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, bankDetails } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, bankDetails },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
