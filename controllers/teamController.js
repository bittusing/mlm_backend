const User = require('../models/User');
const treeService = require('../services/treeService');

exports.getDirectReferrals = async (req, res) => {
  try {
    const referrals = await User.find({ sponsorId: req.user.id })
      .select('name email referralCode totalInvestment createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, referrals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTeamTree = async (req, res) => {
  try {
    const tree = await treeService.getDownlineTree(req.user.id);
    res.json({ success: true, tree });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getLevelWiseTeam = async (req, res) => {
  try {
    const levels = await treeService.getLevelWiseTeam(req.user.id);
    res.json({ success: true, levels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
