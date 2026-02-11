const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { 
  authenticateToken, 
  apiRateLimit, 
  validateRequestBody, 
  sanitizeInput 
} = require('../middleware/auth');

// Apply middleware to all routes
router.use(authenticateToken);
router.use(apiRateLimit);
router.use(sanitizeInput);

// Goal CRUD routes
router.get('/', goalController.getGoals);
router.get('/stats', goalController.getGoalStats);
router.get('/:id', goalController.getGoal);

router.post('/', 
  validateRequestBody(['name', 'targetAmount', 'targetDate']),
  goalController.createGoal
);

router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

// Goal actions
router.post('/:id/add-savings', 
  validateRequestBody(['amount']),
  goalController.addSavings
);

router.post('/:id/mark-suggestion-read', 
  validateRequestBody(['suggestionIndex']),
  goalController.markSuggestionRead
);

module.exports = router;