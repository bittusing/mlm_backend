const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.createWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (amount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is ₹100' });
    }

    const user = await User.findById(userId);
    
    if (user.walletBalance <= 0) {
      return res.status(400).json({ success: false, message: 'Your wallet balance is zero' });
    }
    
    if (user.walletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    if (!user.bankDetails || !user.bankDetails.accountNumber) {
      return res.status(400).json({ success: false, message: 'Please update bank details first' });
    }

    const withdrawal = await Withdrawal.create({
      userId,
      amount,
      bankDetails: user.bankDetails
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
