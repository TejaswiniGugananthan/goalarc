const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { 
  authenticateToken, 
  apiRateLimit, 
  sanitizeInput,
  asyncHandler 
} = require('../middleware/auth');

// Apply middleware to all routes
router.use(authenticateToken);
router.use(apiRateLimit);
router.use(sanitizeInput);

// Get user profile (already available in auth routes, but also here for convenience)
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('goals', 'name targetAmount savedAmount status category')
    .populate({
      path: 'transactions',
      options: { sort: { date: -1 }, limit: 10 },
      select: 'type amount description date category'
    });
  
  res.status(200).json({
    success: true,
    data: {
      profile: user.getSummary(),
      recentGoals: user.goals.slice(0, 5),
      recentTransactions: user.transactions
    }
  });
});

// Update user preferences
const updatePreferences = asyncHandler(async (req, res) => {
  const { currency, dateFormat, notifications } = req.body;
  
  const updates = {};
  if (currency) updates['preferences.currency'] = currency;
  if (dateFormat) updates['preferences.dateFormat'] = dateFormat;
  if (notifications) {
    if (notifications.goalReminders !== undefined) {
      updates['preferences.notifications.goalReminders'] = notifications.goalReminders;
    }
    if (notifications.achievementAlerts !== undefined) {
      updates['preferences.notifications.achievementAlerts'] = notifications.achievementAlerts;
    }
    if (notifications.weeklyReports !== undefined) {
      updates['preferences.notifications.weeklyReports'] = notifications.weeklyReports;
    }
  }
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    data: user.getSummary()
  });
});

// Get user statistics
const getStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('goals')
    .populate('transactions');
  
  // Calculate various statistics
  const totalGoals = user.goals.length;
  const completedGoals = user.goals.filter(g => g.status === 'completed').length;
  const activeGoals = user.goals.filter(g => g.status === 'active').length;
  
  const totalTransactions = user.transactions.length;
  const incomeTransactions = user.transactions.filter(t => t.type === 'income').length;
  const expenseTransactions = user.transactions.filter(t => t.type === 'expense').length;
  
  // Calculate streaks (example: consecutive days with transactions)
  const today = new Date();
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentTransactions = user.transactions.filter(t => t.date >= last7Days);
  
  const stats = {
    financial: {
      totalIncome: user.totalIncome,
      totalExpenses: user.totalExpenses,
      currentBalance: user.currentBalance,
      savingsRate: user.totalIncome > 0 ? ((user.totalIncome - user.totalExpenses) / user.totalIncome) * 100 : 0
    },
    goals: {
      total: totalGoals,
      completed: completedGoals,
      active: activeGoals,
      completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
    },
    transactions: {
      total: totalTransactions,
      income: incomeTransactions,
      expense: expenseTransactions,
      recentActivity: recentTransactions.length
    },
    account: {
      memberSince: user.createdAt,
      lastLogin: user.lastLogin,
      authProvider: user.authProvider,
      isActive: user.isActive
    }
  };
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

// Delete user account and all associated data
const deleteAccount = asyncHandler(async (req, res) => {
  const { password, confirmation } = req.body;
  
  // Require explicit confirmation
  if (confirmation !== 'DELETE') {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Please type "DELETE" to confirm account deletion'
    });
  }
  
  // Verify password for local users
  if (req.user.authProvider === 'local') {
    if (!password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password is required to delete account'
      });
    }
    
    const isPasswordValid = await req.user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: 'Authentication error',
        message: 'Invalid password'
      });
    }
  }
  
  // Delete all associated data
  const Goal = require('../models/Goal');
  const Transaction = require('../models/Transaction');
  
  await Goal.deleteMany({ user: req.user._id });
  await Transaction.deleteMany({ user: req.user._id });
  await User.findByIdAndDelete(req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'Account and all associated data deleted successfully'
  });
});

// Export user data (for GDPR compliance)
const exportData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('goals')
    .populate('transactions');
  
  const exportData = {
    user: user.toJSON(),
    goals: user.goals.map(goal => goal.toJSON()),
    transactions: user.transactions.map(transaction => transaction.toJSON()),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  res.status(200).json({
    success: true,
    message: 'User data exported successfully',
    data: exportData
  });
});

// User routes
router.get('/profile', getProfile);
router.put('/preferences', updatePreferences);
router.get('/stats', getStats);
router.post('/delete-account', deleteAccount);
router.get('/export-data', exportData);

module.exports = router;