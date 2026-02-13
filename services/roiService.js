const UserPlan = require('../models/UserPlan');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

class ROIService {
  async distributeMonthlyROI() {
    try {
      const activePlans = await UserPlan.find({ status: 'ACTIVE' });

      for (const userPlan of activePlans) {
        // Check if plan has expired
        if (new Date() > userPlan.expiryDate) {
          userPlan.status = 'EXPIRED';
          await userPlan.save();
          continue;
        }

        // Check if ROI already paid this month
        const lastROIDate = userPlan.lastROIDate;
        const now = new Date();
        
        if (lastROIDate) {
          const lastMonth = lastROIDate.getMonth();
          const currentMonth = now.getMonth();
          
          if (lastMonth === currentMonth) {
            console.log(`ROI already paid this month for plan ${userPlan._id}`);
            continue;
          }
        }

        // Calculate and credit ROI
        const roiAmount = userPlan.monthlyReturn;
        const user = await User.findById(userPlan.userId);
        
        if (!user) continue;

        const balanceBefore = user.walletBalance;
        const balanceAfter = balanceBefore + roiAmount;

        user.walletBalance = balanceAfter;
        user.totalROI += roiAmount;
        await user.save();

        // Create transaction
        await Transaction.create({
          userId: user._id,
          type: 'CREDIT',
          category: 'ROI',
          amount: roiAmount,
          balanceBefore,
          balanceAfter,
          description: `Monthly ROI for plan ${userPlan.planId}`,
          referenceId: userPlan._id,
          referenceModel: 'UserPlan'
        });

        // Update plan
        userPlan.totalROIPaid += roiAmount;
        userPlan.lastROIDate = now;
        await userPlan.save();

        console.log(`ROI credited: ${roiAmount} to user ${user._id}`);
      }

      console.log('Monthly ROI distribution completed');
    } catch (error) {
      console.error('Error distributing monthly ROI:', error);
    }
  }
}

module.exports = new ROIService();
