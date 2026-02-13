const crypto = require('crypto');

const generateReferralCode = () => {
  return 'MLM' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

module.exports = generateReferralCode;
