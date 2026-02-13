const CommissionSetting = require('../models/CommissionSetting');

exports.getSettings = async (req, res) => {
  try {
    let settings = await CommissionSetting.findOne({ isActive: true });
    
    if (!settings) {
      settings = await CommissionSetting.create({
        directReferralPercentage: 10,
        levelCommissions: [
          { level: 1, percentage: 5 },
          { level: 2, percentage: 3 },
          { level: 3, percentage: 2 }
        ],
        isActive: true
      });
    }

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { directReferralPercentage, levelCommissions, matchingBonusPercentage } = req.body;

    let settings = await CommissionSetting.findOne({ isActive: true });
    
    if (!settings) {
      settings = new CommissionSetting();
    }

    settings.directReferralPercentage = directReferralPercentage;
    settings.levelCommissions = levelCommissions;
    settings.matchingBonusPercentage = matchingBonusPercentage || 0;
    await settings.save();

    res.json({ success: true, message: 'Settings updated', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
