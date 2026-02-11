const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
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

// Transaction CRUD routes
router.get('/', transactionController.getTransactions);
router.get('/categories', transactionController.getCategories);
router.get('/monthly-summary', transactionController.getMonthlySummary);
router.get('/category-breakdown', transactionController.getCategoryBreakdown);
router.get('/:id', transactionController.getTransaction);

router.post('/', 
  validateRequestBody(['type', 'amount', 'description', 'category']),
  transactionController.createTransaction
);

router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;