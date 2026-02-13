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
    const activePlans = await UserPlan.find({ userId, status: 'ACTIVE' }).populate('planId');

    // Recent transactions (last 10)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('type category amount createdAt description');

    // Income breakdown by category (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const incomeBreakdown = await Transaction.aggregate([
      { 
        $match: { 
          userId: user._id, 
          type: 'CREDIT',
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly income trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const incomeTrend = await Transaction.aggregate([
      { 
        $match: { 
          userId: user._id, 
          type: 'CREDIT',
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalIncome: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent team members (last 5)
    const recentTeamMembers = await User.find({ sponsorId: userId })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalInvestment: user.totalInvestment,
        totalROI: user.totalROI,
        totalCommission: user.totalCommission,
        walletBalance: user.walletBalance,
        directReferrals,
        teamSize,
        activePlansCount: activePlans.length,
        activePlans,
        recentTransactions,
        incomeBreakdown,
        incomeTrend,
        recentTeamMembers
      }
    });
  } catch (error) {
    console.error('User dashboard error:', error);
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
