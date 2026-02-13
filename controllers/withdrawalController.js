const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.createWithdrawal = async (req, res) => {
  try {
    console.log('[Withdrawal] Request received:', req.body);
    console.log('[Withdrawal] User ID:', req.user.id);
    
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      console.log('[Withdrawal] Invalid amount:', amount);
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (amount < 100) {
      console.log('[Withdrawal] Amount less than minimum:', amount);
      return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is ₹100' });
    }

    const user = await User.findById(userId);
    console.log('[Withdrawal] User found:', user.name, 'Balance:', user.walletBalance);
    
    if (user.walletBalance <= 0) {
      console.log('[Withdrawal] Zero balance');
      return res.status(400).json({ success: false, message: 'Your wallet balance is zero' });
    }
    
    if (user.walletBalance < amount) {
      console.log('[Withdrawal] Insufficient balance. Requested:', amount, 'Available:', user.walletBalance);
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    if (!user.bankDetails || !user.bankDetails.accountNumber) {
      console.log('[Withdrawal] Bank details missing');
      return res.status(400).json({ success: false, message: 'Please update bank details first' });
    }

    const withdrawal = await Withdrawal.create({
      userId,
      amount,
      bankDetails: user.bankDetails
    });

    console.log('[Withdrawal] ✅ Withdrawal request created:', withdrawal._id);

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal
    });
  } catch (error) {
    console.error('[Withdrawal] Error:', error);
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
