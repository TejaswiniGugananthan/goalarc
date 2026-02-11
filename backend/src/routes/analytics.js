const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { 
  authenticateToken, 
  apiRateLimit, 
  sanitizeInput 
} = require('../middleware/auth');

// Apply middleware to all routes
router.use(authenticateToken);
router.use(apiRateLimit);
router.use(sanitizeInput);

// Analytics routes
router.get('/overview', analyticsController.getOverview);
router.get('/timeline', analyticsController.getTimelineData);
router.get('/spending-breakdown', analyticsController.getSpendingBreakdown);
router.get('/income-breakdown', analyticsController.getIncomeBreakdown);
router.get('/goal-analytics', analyticsController.getGoalAnalytics);
router.get('/monthly-trends', analyticsController.getMonthlyTrends);

module.exports = router;