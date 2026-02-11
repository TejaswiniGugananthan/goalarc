const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const { asyncHandler } = require('../middleware/auth');

// Get all transactions for a user
const getTransactions = asyncHandler(async (req, res) => {
  const { 
    type, 
    category, 
    goal,
    startDate, 
    endDate, 
    page = 1, 
    limit = 20,
    sortBy = 'date',
    order = 'desc'
  } = req.query;
  
  const filters = {
    user: req.user._id
  };
  
  // Apply filters
  if (type) filters.type = type;
  if (category) filters.category = category;
  if (goal) filters.goal = goal;
  
  if (startDate && endDate) {
    filters.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const sortOptions = {};
  sortOptions[sortBy] = order === 'desc' ? -1 : 1;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const transactions = await Transaction.find(filters)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('goal', 'name category');
  
  const total = await Transaction.countDocuments(filters);
  
  res.status(200).json({
    success: true,
    data: {
      transactions: transactions.map(t => t.getSummary()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// Get single transaction
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('goal', 'name category');
  
  if (!transaction) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Transaction not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: transaction
  });
});

// Create new transaction
const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, description, category, date, goal, paymentMethod, location, merchant, tags, notes } = req.body;
  
  // Validate required fields
  if (!type || !amount || !description || !category) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Type, amount, description, and category are required'
    });
  }
  
  // Validate amount
  if (amount <= 0) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Amount must be greater than 0'
    });
  }
  
  // Validate type
  const validTypes = ['income', 'expense', 'goal_contribution', 'goal_withdrawal'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Invalid transaction type'
    });
  }
  
  // If goal is specified, validate it belongs to user
  if (goal) {
    const goalDoc = await Goal.findOne({ _id: goal, user: req.user._id });
    if (!goalDoc) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid goal specified'
      });
    }
  }
  
  const transactionData = {
    user: req.user._id,
    type,
    amount: parseFloat(amount),
    description: description.trim(),
    category,
    date: date ? new Date(date) : new Date(),
    goal: goal || null,
    paymentMethod: paymentMethod || 'cash',
    location: location?.trim() || '',
    merchant: merchant?.trim() || '',
    tags: tags || [],
    notes: notes?.trim() || ''
  };
  
  const transaction = new Transaction(transactionData);
  await transaction.save();
  
  // Update user's transactions array
  req.user.transactions.push(transaction._id);
  await req.user.save();
  
  // If it's a goal contribution, update the goal
  if (goal && (type === 'goal_contribution')) {
    const goalDoc = await Goal.findById(goal);
    if (goalDoc) {
      await goalDoc.addSavings(amount, description);
    }
  }
  
  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: transaction.getSummary()
  });
});

// Update transaction
const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!transaction) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Transaction not found'
    });
  }
  
  const allowedUpdates = ['type', 'amount', 'description', 'category', 'date', 'paymentMethod', 'location', 'merchant', 'tags', 'notes'];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  });
  
  // Validate amount if provided
  if (updates.amount && updates.amount <= 0) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Amount must be greater than 0'
    });
  }
  
  // Validate date if provided
  if (updates.date) {
    updates.date = new Date(updates.date);
  }
  
  Object.assign(transaction, updates);
  await transaction.save();
  
  res.status(200).json({
    success: true,
    message: 'Transaction updated successfully',
    data: transaction.getSummary()
  });
});

// Delete transaction
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!transaction) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Transaction not found'
    });
  }
  
  await Transaction.findByIdAndDelete(transaction._id);
  
  // Remove from user's transactions array
  req.user.transactions.pull(transaction._id);
  await req.user.save();
  
  res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully'
  });
});

// Get transaction categories
const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;
  
  const categories = {
    income: [
      'salary',
      'freelance',
      'business',
      'investment',
      'gift',
      'bonus',
      'other_income'
    ],
    expense: [
      'food',
      'transportation',
      'housing',
      'utilities',
      'healthcare',
      'entertainment',
      'shopping',
      'education',
      'travel',
      'insurance',
      'debt_payment',
      'charity',
      'savings',
      'other_expense'
    ]
  };
  
  if (type && categories[type]) {
    return res.status(200).json({
      success: true,
      data: categories[type]
    });
  }
  
  res.status(200).json({
    success: true,
    data: categories
  });
});

// Get monthly summary
const getMonthlySummary = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  
  if (!year || !month) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Year and month are required'
    });
  }
  
  const summary = await Transaction.getMonthlySummary(req.user._id, parseInt(year), parseInt(month));
  
  let income = 0;
  let expense = 0;
  
  summary.forEach(item => {
    if (item._id === 'income') {
      income = item.total;
    } else if (item._id === 'expense') {
      expense = item.total;
    }
  });
  
  res.status(200).json({
    success: true,
    data: {
      year: parseInt(year),
      month: parseInt(month),
      income,
      expense,
      savings: income - expense,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
      summary
    }
  });
});

// Get category breakdown
const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const { type, startDate, endDate } = req.query;
  
  if (!type) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Transaction type is required'
    });
  }
  
  const breakdown = await Transaction.getCategoryBreakdown(req.user._id, type, startDate, endDate);
  
  const total = breakdown.reduce((sum, item) => sum + item.total, 0);
  
  const result = breakdown.map(item => ({
    category: item._id,
    amount: item.total,
    percentage: total > 0 ? (item.total / total) * 100 : 0,
    transactionCount: item.count,
    averageAmount: item.avgAmount
  }));
  
  res.status(200).json({
    success: true,
    data: {
      type,
      total,
      breakdown: result
    }
  });
});

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  getMonthlySummary,
  getCategoryBreakdown
};