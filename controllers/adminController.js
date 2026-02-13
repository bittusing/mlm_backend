const User = require('../models/User');
const Plan = require('../models/Plan');
const UserPlan = require('../models/UserPlan');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');
const treeService = require('../services/treeService');

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalActivePlans = await UserPlan.countDocuments({ status: 'ACTIVE' });
    
    const businessVolume = await UserPlan.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPayout = await Transaction.aggregate([
      { $match: { type: 'CREDIT' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'PENDING' });

    // Recent users (last 10 joined)
    const recentUsers = await User.find({ role: 'USER' })
      .select('name email createdAt referralCode')
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent investments (last 10 plan purchases)
    const recentInvestments = await UserPlan.find()
      .populate('userId', 'name email')
      .populate('planId', 'name')
      .select('userId planId amount createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // User growth chart data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userGrowth = await User.aggregate([
      { $match: { role: 'USER', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Investment trend chart data (last 6 months)
    const investmentTrend = await UserPlan.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Commission breakdown by category
    const commissionBreakdown = await Transaction.aggregate([
      { $match: { type: 'CREDIT', category: { $ne: 'ROI' } } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalActivePlans,
        totalBusinessVolume: businessVolume[0]?.total || 0,
        totalPayout: totalPayout[0]?.total || 0,
        pendingWithdrawals,
        recentUsers,
        recentInvestments,
        userGrowth,
        investmentTrend,
        commissionBreakdown
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'USER' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('activePlan');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    ).select('-password');
    res.json({ success: true, message: 'User blocked', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    ).select('-password');
    res.json({ success: true, message: 'User unblocked', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserTree = async (req, res) => {
  try {
    const tree = await treeService.getDownlineTree(req.params.id);
    res.json({ success: true, tree });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const { name, amount, roiPercentage, duration, description } = req.body;
    const monthlyReturn = (amount * roiPercentage) / 100;

    const plan = await Plan.create({
      name,
      amount,
      roiPercentage,
      duration,
      monthlyReturn,
      description
    });

    res.json({ success: true, message: 'Plan created', plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Plan updated', plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    await Plan.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Plan deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const withdrawals = await Withdrawal.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Withdrawal already processed' });
    }

    const user = await User.findById(withdrawal.userId);
    const balanceBefore = user.walletBalance;
    const balanceAfter = balanceBefore - withdrawal.amount;

    user.walletBalance = balanceAfter;
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      type: 'DEBIT',
      category: 'WITHDRAWAL',
      amount: withdrawal.amount,
      balanceBefore,
      balanceAfter,
      description: 'Withdrawal approved',
      referenceId: withdrawal._id,
      referenceModel: 'Withdrawal'
    });

    withdrawal.status = 'APPROVED';
    withdrawal.processedBy = req.user.id;
    withdrawal.processedAt = new Date();
    withdrawal.transactionId = transaction._id;
    await withdrawal.save();

    res.json({ success: true, message: 'Withdrawal approved', withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.rejectWithdrawal = async (req, res) => {
  try {
    const { remarks } = req.body;
    const withdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      {
        status: 'REJECTED',
        processedBy: req.user.id,
        processedAt: new Date(),
        remarks
      },
      { new: true }
    );

    res.json({ success: true, message: 'Withdrawal rejected', withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getInvestmentReport = async (req, res) => {
  try {
    const report = await UserPlan.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalInvestment: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getIncomeReport = async (req, res) => {
  try {
    const report = await Transaction.aggregate([
      { $match: { type: 'CREDIT' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getWithdrawalReport = async (req, res) => {
  try {
    const report = await Withdrawal.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
