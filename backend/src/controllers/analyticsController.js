const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const { asyncHandler } = require('../middleware/auth');

// Get financial overview analytics
const getOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { period = '30' } = req.query;
  
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - parseInt(period));
  
  // Get transaction summary for the period
  const transactionSummary = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: daysAgo }
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get goal summary
  const goalSummary = await Goal.aggregate([
    {
      $match: { user: userId }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalTarget: { $sum: '$targetAmount' },
        totalSaved: { $sum: '$savedAmount' }
      }
    }
  ]);
  
  // Process transaction data
  let income = 0;
  let expenses = 0;
  let transactionCount = 0;
  
  transactionSummary.forEach(item => {
    if (item._id === 'income') {
      income = item.total;
    } else if (item._id === 'expense') {
      expenses = item.total;
    }
    transactionCount += item.count;
  });
  
  // Process goal data
  const goals = {
    active: 0,
    completed: 0,
    paused: 0,
    totalTarget: 0,
    totalSaved: 0
  };
  
  goalSummary.forEach(item => {
    goals[item._id] = item.count;
    goals.totalTarget += item.totalTarget;
    goals.totalSaved += item.totalSaved;
  });
  
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const goalProgress = goals.totalTarget > 0 ? (goals.totalSaved / goals.totalTarget) * 100 : 0;
  
  res.status(200).json({
    success: true,
    data: {
      period: parseInt(period),
      financial: {
        income,
        expenses,
        savings,
        savingsRate: Math.round(savingsRate * 100) / 100,
        transactionCount
      },
      goals: {
        ...goals,
        overallProgress: Math.round(goalProgress * 100) / 100
      }
    }
  });
});

// Get timeline data for charts
const getTimelineData = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate, 
    groupBy = 'day' 
  } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Start date and end date are required'
    });
  }
  
  const timelineData = await Transaction.getTimelineData(
    req.user._id, 
    startDate, 
    endDate, 
    groupBy
  );
  
  res.status(200).json({
    success: true,
    data: {
      groupBy,
      period: {
        startDate,
        endDate
      },
      timeline: timelineData
    }
  });
});

// Get spending breakdown by category
const getSpendingBreakdown = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate,
    limit = 10 
  } = req.query;
  
  const matchQuery = {
    user: req.user._id,
    type: 'expense'
  };
  
  if (startDate && endDate) {
    matchQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const breakdown = await Transaction.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    { $sort: { total: -1 } },
    { $limit: parseInt(limit) }
  ]);
  
  const totalExpenses = breakdown.reduce((sum, item) => sum + item.total, 0);
  
  const result = breakdown.map(item => ({
    category: item._id,
    amount: item.total,
    percentage: totalExpenses > 0 ? (item.total / totalExpenses) * 100 : 0,
    transactionCount: item.count,
    averageAmount: Math.round(item.avgAmount * 100) / 100
  }));
  
  res.status(200).json({
    success: true,
    data: {
      totalExpenses,
      breakdown: result
    }
  });
});

// Get income sources breakdown
const getIncomeBreakdown = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate 
  } = req.query;
  
  const matchQuery = {
    user: req.user._id,
    type: 'income'
  };
  
  if (startDate && endDate) {
    matchQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const breakdown = await Transaction.aggregate([
    { $match: matchQuery },
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
  
  const totalIncome = breakdown.reduce((sum, item) => sum + item.total, 0);
  
  const result = breakdown.map(item => ({
    category: item._id,
    amount: item.total,
    percentage: totalIncome > 0 ? (item.total / totalIncome) * 100 : 0,
    transactionCount: item.count,
    averageAmount: Math.round(item.avgAmount * 100) / 100
  }));
  
  res.status(200).json({
    success: true,
    data: {
      totalIncome,
      breakdown: result
    }
  });
});

// Get goal performance analytics
const getGoalAnalytics = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user: req.user._id });
  
  const analytics = goals.map(goal => ({
    id: goal._id,
    name: goal.name,
    category: goal.category,
    status: goal.status,
    progressPercentage: goal.progressPercentage,
    remainingAmount: goal.remainingAmount,
    daysRemaining: goal.daysRemaining,
    monthlyRequiredSavings: goal.monthlyRequiredSavings,
    isCompleted: goal.isCompleted,
    isOverdue: goal.isOverdue
  }));
  
  // Calculate overall statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const overdueGoals = goals.filter(g => g.isOverdue).length;
  
  const avgProgress = totalGoals > 0 ? 
    goals.reduce((sum, g) => sum + g.progressPercentage, 0) / totalGoals : 0;
  
  // Group by category
  const categoryStats = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = {
        count: 0,
        totalTarget: 0,
        totalSaved: 0,
        completed: 0
      };
    }
    
    acc[goal.category].count++;
    acc[goal.category].totalTarget += goal.targetAmount;
    acc[goal.category].totalSaved += goal.savedAmount;
    if (goal.status === 'completed') {
      acc[goal.category].completed++;
    }
    
    return acc;
  }, {});
  
  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalGoals,
        completedGoals,
        activeGoals,
        overdueGoals,
        completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
        averageProgress: Math.round(avgProgress * 100) / 100
      },
      goals: analytics,
      categoryBreakdown: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        ...stats,
        completionRate: stats.count > 0 ? (stats.completed / stats.count) * 100 : 0,
        progress: stats.totalTarget > 0 ? (stats.totalSaved / stats.totalTarget) * 100 : 0
      }))
    }
  });
});

// Get monthly trends
const getMonthlyTrends = asyncHandler(async (req, res) => {
  const { months = 12 } = req.query;
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - parseInt(months));
  startDate.setDate(1);
  
  const trends = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: {
          year: '$_id.year',
          month: '$_id.month'
        },
        income: {
          $sum: {
            $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0]
          }
        },
        expense: {
          $sum: {
            $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0]
          }
        }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1
      }
    }
  ]);
  
  const result = trends.map(item => ({
    year: item._id.year,
    month: item._id.month,
    monthName: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
    income: item.income,
    expense: item.expense,
    savings: item.income - item.expense,
    savingsRate: item.income > 0 ? ((item.income - item.expense) / item.income) * 100 : 0
  }));
  
  res.status(200).json({
    success: true,
    data: {
      months: parseInt(months),
      trends: result
    }
  });
});

module.exports = {
  getOverview,
  getTimelineData,
  getSpendingBreakdown,
  getIncomeBreakdown,
  getGoalAnalytics,
  getMonthlyTrends
};