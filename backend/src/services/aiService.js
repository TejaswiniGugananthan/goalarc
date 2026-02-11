const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');

class AIService {
  // Main AI analysis function for a specific goal
  async analyzeGoalAndGenerateSuggestions(userId, goalId) {
    try {
      const goal = await Goal.findOne({ _id: goalId, user: userId });
      if (!goal) {
        throw new Error('Goal not found');
      }
      
      // Get user's financial data
      const financialData = await this.getUserFinancialData(userId);
      const goalAnalysis = this.analyzeGoalProgress(goal);
      const spendingPatterns = await this.analyzeSpendingPatterns(userId);
      
      // Generate suggestions based on analysis
      const suggestions = this.generateSmartSuggestions(goal, financialData, goalAnalysis, spendingPatterns);
      
      // Save suggestions to goal
      goal.aiSuggestions = suggestions.map(suggestion => ({
        ...suggestion,
        isRead: false,
        createdAt: new Date()
      }));
      
      await goal.save();
      
      return {
        goalAnalysis,
        suggestions,
        financialSnapshot: financialData
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw error;
    }
  }
  
  // Get user's financial overview
  async getUserFinancialData(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlySavings = income - expenses;
    
    return {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      monthlySavings,
      savingsRate: income > 0 ? (monthlySavings / income) * 100 : 0,
      transactionCount: transactions.length
    };
  }
  
  // Analyze goal progress and status
  analyzeGoalProgress(goal) {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const startDate = new Date(goal.startDate);
    
    const totalDays = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    
    const expectedProgress = Math.max(0, Math.min(100, (daysPassed / totalDays) * 100));
    const actualProgress = (goal.savedAmount / goal.targetAmount) * 100;
    const progressDifference = actualProgress - expectedProgress;
    
    const requiredMonthlySavings = goal.remainingAmount / Math.max(1, daysRemaining / 30.44);
    const currentSavingsRate = daysPassed > 0 ? (goal.savedAmount / (daysPassed / 30.44)) : 0;
    
    let status;
    if (actualProgress >= 100) {
      status = 'completed';
    } else if (progressDifference >= 10) {
      status = 'ahead';
    } else if (progressDifference >= -10) {
      status = 'on_track';
    } else if (daysRemaining > 0) {
      status = 'behind';
    } else {
      status = 'overdue';
    }
    
    return {
      status,
      progressPercentage: Math.round(actualProgress * 100) / 100,
      expectedProgress: Math.round(expectedProgress * 100) / 100,
      progressDifference: Math.round(progressDifference * 100) / 100,
      daysRemaining: Math.max(0, daysRemaining),
      requiredMonthlySavings: Math.round(requiredMonthlySavings * 100) / 100,
      currentSavingsRate: Math.round(currentSavingsRate * 100) / 100,
      isAchievable: requiredMonthlySavings > 0 && daysRemaining > 0
    };
  }
  
  // Analyze user's spending patterns
  async analyzeSpendingPatterns(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const expenseCategories = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.total, 0);
    
    return expenseCategories.map(category => ({
      category: category._id,
      amount: category.total,
      percentage: totalExpenses > 0 ? (category.total / totalExpenses) * 100 : 0,
      frequency: category.count,
      avgAmount: category.avgAmount
    }));
  }
  
  // Generate smart AI suggestions based on analysis
  generateSmartSuggestions(goal, financialData, goalAnalysis, spendingPatterns) {
    const suggestions = [];
    
    // Goal status based suggestions
    switch (goalAnalysis.status) {
      case 'completed':
        suggestions.push({
          suggestion: `🎉 Congratulations! You've achieved your ${goal.name} goal. Consider setting a new financial target to maintain your saving momentum.`,
          type: 'achievement',
          priority: 'high',
          impact: 0
        });
        break;
        
      case 'ahead':
        suggestions.push({
          suggestion: `🚀 Excellent progress! You're ahead of schedule for your ${goal.name} goal. You might complete this ${Math.ceil(goalAnalysis.progressDifference / 10)} month(s) early.`,
          type: 'encouragement',
          priority: 'medium',
          impact: 0
        });
        break;
        
      case 'on_track':
        suggestions.push({
          suggestion: `✅ You're on track to achieve your ${goal.name} goal on time! Keep up the consistent savings of $${goalAnalysis.currentSavingsRate.toFixed(0)} per month.`,
          type: 'encouragement',
          priority: 'medium',
          impact: 0
        });
        break;
        
      case 'behind':
        const additionalNeeded = goalAnalysis.requiredMonthlySavings - goalAnalysis.currentSavingsRate;
        suggestions.push({
          suggestion: `⚠️ You need to increase savings by $${additionalNeeded.toFixed(0)} per month to achieve your ${goal.name} goal on time.`,
          type: 'saving_tip',
          priority: 'high',
          impact: additionalNeeded
        });
        break;
        
      case 'overdue':
        suggestions.push({
          suggestion: `📅 Your ${goal.name} goal is overdue. Consider extending the deadline or increasing savings to $${goalAnalysis.requiredMonthlySavings.toFixed(0)} per month.`,
          type: 'timeline_adjustment',
          priority: 'high',
          impact: goalAnalysis.requiredMonthlySavings
        });
        break;
    }
    
    // Spending pattern analysis suggestions
    if (spendingPatterns.length > 0) {
      const topExpenseCategory = spendingPatterns[0];
      
      if (topExpenseCategory.percentage > 30) {
        suggestions.push({
          suggestion: `💰 Your ${topExpenseCategory.category} expenses account for ${topExpenseCategory.percentage.toFixed(0)}% of your spending. Reducing this by 20% could save $${(topExpenseCategory.amount * 0.2).toFixed(0)} monthly.`,
          type: 'expense_reduction',
          priority: 'medium',
          impact: topExpenseCategory.amount * 0.2
        });
      }
      
      // Suggest specific category optimizations
      const categoryAdvice = this.getCategorySpecificAdvice(topExpenseCategory.category, topExpenseCategory.amount);
      if (categoryAdvice) {
        suggestions.push(categoryAdvice);
      }
    }
    
    // Savings rate suggestions
    if (financialData.savingsRate < 10) {
      suggestions.push({
        suggestion: `📊 Your current savings rate is ${financialData.savingsRate.toFixed(0)}%. Consider aiming for at least 20% to build financial security faster.`,
        type: 'saving_tip',
        priority: 'medium',
        impact: financialData.monthlyIncome * 0.1
      });
    } else if (financialData.savingsRate > 30) {
      suggestions.push({
        suggestion: `🌟 Outstanding! You're saving ${financialData.savingsRate.toFixed(0)}% of your income. You could achieve financial goals faster than expected.`,
        type: 'encouragement',
        priority: 'low',
        impact: 0
      });
    }
    
    // Goal-specific suggestions based on category
    const goalCategoryAdvice = this.getGoalCategoryAdvice(goal);
    if (goalCategoryAdvice) {
      suggestions.push(goalCategoryAdvice);
    }
    
    // Timeline-based suggestions
    if (goalAnalysis.daysRemaining < 30 && goalAnalysis.progressPercentage < 80) {
      suggestions.push({
        suggestion: `⏰ With less than 30 days remaining, consider a final push to reach your ${goal.name} goal. You need $${goalAnalysis.requiredMonthlySavings.toFixed(0)} more.`,
        type: 'timeline_adjustment',
        priority: 'high',
        impact: goalAnalysis.requiredMonthlySavings
      });
    }
    
    return suggestions.slice(0, 5); // Limit to top 5 suggestions
  }
  
  // Get category-specific spending advice
  getCategorySpecificAdvice(category, amount) {
    const advice = {
      'food': {
        suggestion: `🍽️ Food expenses are high at $${amount.toFixed(0)}/month. Try meal planning, cooking at home more often, or using grocery coupons to save 15-25%.`,
        type: 'expense_reduction',
        impact: amount * 0.2
      },
      'entertainment': {
        suggestion: `🎬 Entertainment spending is $${amount.toFixed(0)}/month. Consider free activities, streaming instead of theaters, or group discounts to save 30%.`,
        type: 'expense_reduction',
        impact: amount * 0.3
      },
      'shopping': {
        suggestion: `🛍️ Shopping expenses are $${amount.toFixed(0)}/month. Create a shopping list, wait 24 hours before purchases, or look for sales to reduce spending.`,
        type: 'expense_reduction',
        impact: amount * 0.25
      },
      'transportation': {
        suggestion: `🚗 Transportation costs $${amount.toFixed(0)}/month. Consider carpooling, public transport, or walking when possible to save money.`,
        type: 'expense_reduction',
        impact: amount * 0.15
      }
    };
    
    const categoryAdvice = advice[category];
    if (categoryAdvice) {
      return {
        ...categoryAdvice,
        priority: 'medium'
      };
    }
    
    return null;
  }
  
  // Get goal category-specific advice
  getGoalCategoryAdvice(goal) {
    const advice = {
      'electronics': {
        suggestion: `📱 For electronics like ${goal.name}, consider buying during sales seasons (Black Friday, end of year) or refurbished options to save 20-40%.`,
        type: 'category_advice',
        priority: 'low',
        impact: goal.targetAmount * 0.3
      },
      'travel': {
        suggestion: `✈️ For travel goals like ${goal.name}, book in advance, use travel rewards, or consider off-season travel to reduce costs by 25-50%.`,
        type: 'category_advice',
        priority: 'low',
        impact: goal.targetAmount * 0.25
      },
      'education': {
        suggestion: `🎓 For education expenses, look for scholarships, online alternatives, or employer tuition assistance programs.`,
        type: 'category_advice',
        priority: 'medium',
        impact: goal.targetAmount * 0.2
      },
      'emergency_fund': {
        suggestion: `🛡️ Emergency funds are crucial! Aim for 3-6 months of expenses. Consider high-yield savings accounts for better returns.`,
        type: 'category_advice',
        priority: 'high',
        impact: 0
      }
    };
    
    return advice[goal.category] || null;
  }
  
  // Get all AI suggestions for a user's active goals
  async getAllGoalSuggestions(userId) {
    const activeGoals = await Goal.find({ user: userId, status: 'active' });
    const suggestions = [];
    
    for (const goal of activeGoals) {
      const analysis = await this.analyzeGoalAndGenerateSuggestions(userId, goal._id);
      suggestions.push({
        goalId: goal._id,
        goalName: goal.name,
        analysis: analysis.goalAnalysis,
        suggestions: analysis.suggestions
      });
    }
    
    return suggestions;
  }
}

module.exports = new AIService();