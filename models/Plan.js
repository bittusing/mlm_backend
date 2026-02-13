const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
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
    required: true,
    comment: 'Duration in months'
  },
  monthlyReturn: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
