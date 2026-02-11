const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { 
  authenticateToken, 
  apiRateLimit, 
  validateRequestBody, 
  sanitizeInput,
  asyncHandler 
} = require('../middleware/auth');

// Apply middleware to all routes
router.use(authenticateToken);
router.use(apiRateLimit);
router.use(sanitizeInput);

// Get AI analysis for a specific goal
const getGoalAnalysis = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  
  if (!goalId) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Goal ID is required'
    });
  }
  
  const analysis = await aiService.analyzeGoalAndGenerateSuggestions(req.user._id, goalId);
  
  res.status(200).json({
    success: true,
    data: analysis
  });
});

// Get AI suggestions for all active goals
const getAllSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await aiService.getAllGoalSuggestions(req.user._id);
  
  res.status(200).json({
    success: true,
    data: suggestions
  });
});

// Get financial insights overview
const getFinancialInsights = asyncHandler(async (req, res) => {
  const financialData = await aiService.getUserFinancialData(req.user._id);
  
  // Generate general financial insights
  const insights = [];
  
  if (financialData.savingsRate < 10) {
    insights.push({
      type: 'warning',
      message: `Your current savings rate is ${financialData.savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income.`,
      priority: 'high',
      actionable: true
    });
  } else if (financialData.savingsRate > 30) {
    insights.push({
      type: 'success',
      message: `Excellent! You're saving ${financialData.savingsRate.toFixed(1)}% of your income. You're well on track for financial success.`,
      priority: 'low',
      actionable: false
    });
  }
  
  if (financialData.monthlyExpenses > financialData.monthlyIncome) {
    insights.push({
      type: 'alert',
      message: 'Your expenses exceed your income this month. Consider reviewing and reducing unnecessary expenses.',
      priority: 'high',
      actionable: true
    });
  }
  
  if (financialData.transactionCount < 5) {
    insights.push({
      type: 'info',
      message: 'Track more transactions to get better financial insights and AI suggestions.',
      priority: 'medium',
      actionable: true
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      financialSnapshot: financialData,
      insights
    }
  });
});

// Regenerate AI suggestions for a specific goal
const regenerateSuggestions = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  
  if (!goalId) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Goal ID is required'
    });
  }
  
  const analysis = await aiService.analyzeGoalAndGenerateSuggestions(req.user._id, goalId);
  
  res.status(200).json({
    success: true,
    message: 'AI suggestions regenerated successfully',
    data: analysis
  });
});

// AI routes
router.get('/goal/:goalId', getGoalAnalysis);
router.get('/suggestions/all', getAllSuggestions);
router.get('/insights', getFinancialInsights);
router.post('/goal/:goalId/regenerate', regenerateSuggestions);

module.exports = router;