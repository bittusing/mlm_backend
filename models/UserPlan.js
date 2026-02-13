const mongoose = require('mongoose');

const userPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  roiPercentage: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  monthlyReturn: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
    default: 'ACTIVE'
  },
  totalROIPaid: {
    type: Number,
    default: 0
  },
  lastROIDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserPlan', userPlanSchema);
