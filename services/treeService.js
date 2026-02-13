const User = require('../models/User');

class TreeService {
  async getDownlineTree(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) return null;

      const tree = await this.buildTree(userId);
      return tree;
    } catch (error) {
      console.error('Error getting downline tree:', error);
      return null;
    }
  }

  async buildTree(userId) {
    const user = await User.findById(userId).select('name email referralCode totalInvestment createdAt');
    if (!user) return null;

    const directReferrals = await User.find({ sponsorId: userId }).select('_id name email referralCode totalInvestment createdAt');

    const children = [];
    for (const referral of directReferrals) {
      const childTree = await this.buildTree(referral._id);
      children.push(childTree);
    }

    return {
      ...user.toObject(),
      children,
      directCount: directReferrals.length
    };
  }

  async getTeamCount(userId) {
    try {
      const count = await this.countDownline(userId);
      return count;
    } catch (error) {
      console.error('Error getting team count:', error);
      return 0;
    }
  }

  async countDownline(userId) {
    const directReferrals = await User.find({ sponsorId: userId }).select('_id');
    let count = directReferrals.length;

    for (const referral of directReferrals) {
      count += await this.countDownline(referral._id);
    }

    return count;
  }

  async getLevelWiseTeam(userId, maxLevel = 10) {
    const levels = [];
    
    for (let level = 1; level <= maxLevel; level++) {
      const users = await this.getUsersAtLevel(userId, level);
      if (users.length === 0) break;
      
      levels.push({
        level,
        count: users.length,
        users
      });
    }

    return levels;
  }

  async getUsersAtLevel(userId, targetLevel, currentLevel = 0) {
    if (currentLevel === targetLevel) {
      return [userId];
    }

    const directReferrals = await User.find({ sponsorId: userId }).select('_id');
    let usersAtLevel = [];

    for (const referral of directReferrals) {
      const users = await this.getUsersAtLevel(referral._id, targetLevel, currentLevel + 1);
      usersAtLevel = usersAtLevel.concat(users);
    }

    return usersAtLevel;
  }
}

module.exports = new TreeService();
