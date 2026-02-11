const Goal = require('../models/Goal');
const aiService = require('../services/aiService');
const { asyncHandler } = require('../middleware/auth');

// Get all goals for a user
const getGoals = asyncHandler(async (req, res) => {
  const { status, category, sortBy = 'createdAt', order = 'desc' } = req.query;
  
  const query = { user: req.user._id };
  if (status) query.status = status;
  if (category) query.category = category;
  
  const sortOptions = {};
  sortOptions[sortBy] = order === 'desc' ? -1 : 1;
  
  const goals = await Goal.find(query)
    .sort(sortOptions)
    .populate('user', 'name email');
  
  const goalsWithSummary = goals.map(goal => goal.getSummary());
  
  res.status(200).json({
    success: true,
    count: goals.length,
    data: goalsWithSummary
  });
});

// Get single goal by ID
const getGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('user', 'name email');
  
  if (!goal) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Goal not found'
    });
  }
  
  // Get AI suggestions for this goal
  const aiAnalysis = await aiService.analyzeGoalAndGenerateSuggestions(req.user._id, goal._id);
  
  res.status(200).json({
    success: true,
    data: {
      ...goal.toObject(),
      aiAnalysis: aiAnalysis.goalAnalysis,
      suggestions: aiAnalysis.suggestions
    }
  });
});

// Create new goal
const createGoal = asyncHandler(async (req, res) => {
  const { name, description, targetAmount, targetDate, category, priority } = req.body;
  
  // Validate required fields
  if (!name || !targetAmount || !targetDate) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Name, target amount, and target date are required'
    });
  }
  
  // Validate target amount
  if (targetAmount <= 0) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Target amount must be greater than 0'
    });
  }
  
  // Validate target date
  const target = new Date(targetDate);
  if (target <= new Date()) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Target date must be in the future'
    });
  }
  
  const goalData = {
    user: req.user._id,
    name: name.trim(),
    description: description?.trim() || '',
    targetAmount,
    targetDate: target,
    category: category || 'other',
    priority: priority || 'medium'
  };
  
  const goal = new Goal(goalData);
  await goal.save();
  
  // Update user's goals array
  req.user.goals.push(goal._id);
  await req.user.save();
  
  // Generate initial AI suggestions
  await aiService.analyzeGoalAndGenerateSuggestions(req.user._id, goal._id);
  
  res.status(201).json({
    success: true,
    message: 'Goal created successfully',
    data: goal.getSummary()
  });
});

// Update goal
const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!goal) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Goal not found'
    });
  }
  
  const allowedUpdates = ['name', 'description', 'targetAmount', 'targetDate', 'category', 'priority', 'status', 'notes'];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  });
  
  // Validate target date if provided
  if (updates.targetDate) {
    const target = new Date(updates.targetDate);
    if (target <= new Date()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Target date must be in the future'
      });
    }
    updates.targetDate = target;
  }
  
  // Validate target amount if provided
  if (updates.targetAmount && updates.targetAmount <= 0) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Target amount must be greater than 0'
    });
  }
  
  Object.assign(goal, updates);
  await goal.save();
  
  // Regenerate AI suggestions if significant changes
  if (updates.targetAmount || updates.targetDate || updates.status) {
    await aiService.analyzeGoalAndGenerateSuggestions(req.user._id, goal._id);
  }
  
  res.status(200).json({
    success: true,
    message: 'Goal updated successfully',
    data: goal.getSummary()
  });
});

// Delete goal
const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!goal) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Goal not found'
    });
  }
  
  await Goal.findByIdAndDelete(goal._id);
  
  // Remove from user's goals array
  req.user.goals.pull(goal._id);
  await req.user.save();
  
  res.status(200).json({
    success: true,
    message: 'Goal deleted successfully'
  });
});

// Add savings to goal
const addSavings = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Valid amount is required'
    });
  }
  
  const goal = await Goal.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!goal) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Goal not found'
    });
  }
  
  await goal.addSavings(amount, description);
  
  // Regenerate AI suggestions
  await aiService.analyzeGoalAndGenerateSuggestions(req.user._id, goal._id);
  
  res.status(200).json({
    success: true,
    message: 'Savings added successfully',
    data: goal.getSummary()
  });
});

// Get goal statistics
const getGoalStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const stats = await Goal.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalGoals: { $sum: 1 },
        completedGoals: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        activeGoals: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        totalTargetAmount: { $sum: '$targetAmount' },
        totalSavedAmount: { $sum: '$savedAmount' },
        avgProgress: { $avg: { $multiply: [{ $divide: ['$savedAmount', '$targetAmount'] }, 100] } }
      }
    }
  ]);
  
  const categoryStats = await Goal.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalTarget: { $sum: '$targetAmount' },
        totalSaved: { $sum: '$savedAmount' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  const result = stats[0] || {
    totalGoals: 0,
    completedGoals: 0,
    activeGoals: 0,
    totalTargetAmount: 0,
    totalSavedAmount: 0,
    avgProgress: 0
  };
  
  res.status(200).json({
    success: true,
    data: {
      overview: result,
      categoryBreakdown: categoryStats,
      completionRate: result.totalGoals > 0 ? (result.completedGoals / result.totalGoals) * 100 : 0
    }
  });
});

// Mark AI suggestion as read
const markSuggestionRead = asyncHandler(async (req, res) => {
  const { suggestionIndex } = req.body;
  
  const goal = await Goal.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  
  if (!goal) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Goal not found'
    });
  }
  
  if (suggestionIndex < 0 || suggestionIndex >= goal.aiSuggestions.length) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Invalid suggestion index'
    });
  }
  
  goal.aiSuggestions[suggestionIndex].isRead = true;
  await goal.save();
  
  res.status(200).json({
    success: true,
    message: 'Suggestion marked as read'
  });
});

module.exports = {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  addSavings,
  getGoalStats,
  markSuggestionRead
};