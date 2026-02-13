const Transaction = require('../models/Transaction');

exports.getMyTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const query = { userId: req.user.id };
    
    if (category) query.category = category;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getIncomeBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;

    const roiIncome = await Transaction.aggregate([
      { $match: { userId: userId, category: 'ROI' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const directIncome = await Transaction.aggregate([
      { $match: { userId: userId, category: 'DIRECT_REFERRAL' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const levelIncome = await Transaction.aggregate([
      { $match: { userId: userId, category: 'LEVEL_INCOME' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      income: {
        roi: roiIncome[0]?.total || 0,
        directReferral: directIncome[0]?.total || 0,
        levelIncome: levelIncome[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
