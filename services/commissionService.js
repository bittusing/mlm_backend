const User = require('../models/User');
const Transaction = require('../models/Transaction');
const CommissionSetting = require('../models/CommissionSetting');

class CommissionService {
  async distributeCommissions(userId, planAmount, planId) {
    try {
      console.log(`[Commission] Starting distribution for userId: ${userId}, amount: ${planAmount}`);
      
      const settings = await CommissionSetting.findOne({ isActive: true });
      
      if (!settings) {
        console.error('[Commission] No active commission settings found - Creating default settings');
        // Create default settings if not exists
        const defaultSettings = await CommissionSetting.create({
          directReferralPercentage: 10,
          levelCommissions: [
            { level: 1, percentage: 5 },
            { level: 2, percentage: 3 },
            { level: 3, percentage: 2 }
          ],
          isActive: true
        });
        console.log('[Commission] Default settings created:', defaultSettings);
        return await this.distributeCommissions(userId, planAmount, planId);
      }

      const user = await User.findById(userId);
      console.log(`[Commission] User found: ${user?.name}, sponsorId: ${user?.sponsorId}`);
      
      if (!user) {
        console.error('[Commission] User not found');
        return;
      }
      
      if (!user.sponsorId) {
        console.log('[Commission] No sponsor found for user - This is a direct signup without referral');
        return;
      }

      // Direct Referral Commission
      console.log(`[Commission] Crediting direct referral to sponsor: ${user.sponsorId}`);
      await this.creditDirectReferral(user.sponsorId, planAmount, settings.directReferralPercentage, userId, planId);

      // Level Commissions
      console.log(`[Commission] Starting level commissions distribution`);
      await this.creditLevelCommissions(user.sponsorId, planAmount, settings.levelCommissions, userId, planId);

      console.log(`[Commission] Distribution completed successfully`);
    } catch (error) {
      console.error('[Commission] Error distributing commissions:', error);
    }
  }

  async creditDirectReferral(sponsorId, planAmount, percentage, referredUserId, planId) {
    try {
      console.log(`[Direct Referral] Processing for sponsor: ${sponsorId}, amount: ${planAmount}, percentage: ${percentage}%`);
      
      const sponsor = await User.findById(sponsorId);
      if (!sponsor) {
        console.error(`[Direct Referral] Sponsor not found: ${sponsorId}`);
        return;
      }

      const commissionAmount = (planAmount * percentage) / 100;
      const balanceBefore = sponsor.walletBalance || 0;
      const balanceAfter = balanceBefore + commissionAmount;

      console.log(`[Direct Referral] Sponsor: ${sponsor.name}, Balance Before: ${balanceBefore}, Commission: ${commissionAmount}, Balance After: ${balanceAfter}`);

      sponsor.walletBalance = balanceAfter;
      sponsor.totalCommission = (sponsor.totalCommission || 0) + commissionAmount;
      await sponsor.save();

      const referredUser = await User.findById(referredUserId);
      
      const transaction = await Transaction.create({
        userId: sponsorId,
        type: 'CREDIT',
        category: 'DIRECT_REFERRAL',
        amount: commissionAmount,
        balanceBefore,
        balanceAfter,
        description: `Direct referral commission from ${referredUser?.name || 'user'}`,
        referenceId: planId,
        referenceModel: 'Plan',
        metadata: {
          percentage,
          planAmount,
          referredUserId,
          referredUserName: referredUser?.name
        }
      });

      console.log(`[Direct Referral] ✅ Commission credited: ₹${commissionAmount} to ${sponsor.name} (${sponsor.email})`);
      console.log(`[Direct Referral] Transaction ID: ${transaction._id}`);
    } catch (error) {
      console.error('[Direct Referral] Error:', error);
    }
  }

  async creditLevelCommissions(sponsorId, planAmount, levelCommissions, originalUserId, planId) {
    try {
      let currentSponsorId = sponsorId;
      const originalUser = await User.findById(originalUserId);
      
      for (const levelConfig of levelCommissions) {
        if (!currentSponsorId) {
          console.log(`[Level ${levelConfig.level}] No more sponsors in chain`);
          break;
        }

        const sponsor = await User.findById(currentSponsorId);
        if (!sponsor) {
          console.log(`[Level ${levelConfig.level}] Sponsor not found: ${currentSponsorId}`);
          break;
        }

        const commissionAmount = (planAmount * levelConfig.percentage) / 100;
        const balanceBefore = sponsor.walletBalance || 0;
        const balanceAfter = balanceBefore + commissionAmount;

        console.log(`[Level ${levelConfig.level}] Sponsor: ${sponsor.name}, Commission: ₹${commissionAmount}`);

        sponsor.walletBalance = balanceAfter;
        sponsor.totalCommission = (sponsor.totalCommission || 0) + commissionAmount;
        await sponsor.save();

        await Transaction.create({
          userId: currentSponsorId,
          type: 'CREDIT',
          category: 'LEVEL_INCOME',
          amount: commissionAmount,
          balanceBefore,
          balanceAfter,
          description: `Level ${levelConfig.level} commission from ${originalUser?.name || 'user'}`,
          referenceId: planId,
          referenceModel: 'Plan',
          metadata: {
            level: levelConfig.level,
            percentage: levelConfig.percentage,
            planAmount,
            originalUserId,
            originalUserName: originalUser?.name
          }
        });

        console.log(`[Level ${levelConfig.level}] ✅ Commission credited: ₹${commissionAmount} to ${sponsor.name}`);

        // Move to next level sponsor
        currentSponsorId = sponsor.sponsorId;
      }
    } catch (error) {
      console.error('[Level Commission] Error:', error);
    }
  }

  async getUplineChain(userId, levels = 10) {
    const chain = [];
    let currentUserId = userId;

    for (let i = 0; i < levels; i++) {
      const user = await User.findById(currentUserId).select('sponsorId name email');
      if (!user || !user.sponsorId) break;
      
      chain.push(user.sponsorId);
      currentUserId = user.sponsorId;
    }

    return chain;
  }
}

module.exports = new CommissionService();
