const mongoose = require('mongoose');

const commissionSettingSchema = new mongoose.Schema({
  directReferralPercentage: {
    type: Number,
    required: true,
    default: 10
  },
  levelCommissions: [{
    level: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    }
  }],
  matchingBonusPercentage: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CommissionSetting', commissionSettingSchema);
