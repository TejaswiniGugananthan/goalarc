const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: [100, 'Goal name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be at least 1']
  },
  savedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Saved amount cannot be negative']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'Target date must be after start date'
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: [
      'emergency_fund',
      'electronics',
      'travel',
      'education',
      'home',
      'vehicle',
      'investment',
      'health',
      'entertainment',
      'clothing',
      'gift',
      'other'
    ],
    default: 'other'
  },
  autoContribution: {
    enabled: {
      type: Boolean,
      default: false
    },
    amount: {
      type: Number,
      min: [0, 'Auto contribution amount cannot be negative'],
      default: 0
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'monthly'
    }
  },
  milestones: [{
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    amount: {
      type: Number,
      required: true
    },
    achieved: {
      type: Boolean,
      default: false
    },
    achievedDate: {
      type: Date
    },
    description: {
      type: String,
      trim: true
    }
  }],
  aiSuggestions: [{
    suggestion: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['saving_tip', 'expense_reduction', 'income_boost', 'timeline_adjustment', 'category_advice'],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    impact: {
      type: Number, // Estimated monthly savings impact
      default: 0
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for better performance
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, category: 1 });
goalSchema.index({ user: 1, targetDate: 1 });

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount <= 0) return 0;
  const progress = (this.savedAmount / this.targetAmount) * 100;
  return Math.min(Math.round(progress * 100) / 100, 100); // Round to 2 decimal places, max 100%
});

// Virtual for remaining amount
goalSchema.virtual('remainingAmount').get(function() {
  return Math.max(this.targetAmount - this.savedAmount, 0);
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const target = new Date(this.targetDate);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
});

// Virtual for monthly savings required
goalSchema.virtual('monthlyRequiredSavings').get(function() {
  const remainingAmount = this.remainingAmount;
  const daysRemaining = this.daysRemaining;
  
  if (daysRemaining <= 0) return 0;
  
  const monthsRemaining = daysRemaining / 30.44; // Average days per month
  return remainingAmount / monthsRemaining;
});

// Virtual for completion status
goalSchema.virtual('isCompleted').get(function() {
  return this.savedAmount >= this.targetAmount;
});

// Virtual for is overdue
goalSchema.virtual('isOverdue').get(function() {
  return new Date() > this.targetDate && !this.isCompleted;
});

// Pre-save middleware to auto-complete goal
goalSchema.pre('save', async function(next) {
  // Auto-complete goal if saved amount reaches target
  if (this.savedAmount >= this.targetAmount && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  // Auto-generate milestones if not set
  if (this.milestones.length === 0) {
    const percentages = [25, 50, 75, 100];
    percentages.forEach(percentage => {
      this.milestones.push({
        percentage,
        amount: (this.targetAmount * percentage) / 100,
        description: `${percentage}% of goal achieved`
      });
    });
  }
  
  next();
});

// Instance method to add savings
goalSchema.methods.addSavings = async function(amount, description = '') {
  if (amount <= 0) {
    throw new Error('Savings amount must be positive');
  }
  
  this.savedAmount += amount;
  
  // Check milestones
  this.milestones.forEach(milestone => {
    if (!milestone.achieved && this.savedAmount >= milestone.amount) {
      milestone.achieved = true;
      milestone.achievedDate = new Date();
    }
  });
  
  await this.save();
  
  // Create a transaction record
  const Transaction = mongoose.model('Transaction');
  const transaction = new Transaction({
    user: this.user,
    goal: this._id,
    type: 'goal_contribution',
    amount: amount,
    description: description || `Contribution to ${this.name}`,
    category: 'savings'
  });
  
  await transaction.save();
  return this;
};

// Instance method to get goal summary
goalSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    targetAmount: this.targetAmount,
    savedAmount: this.savedAmount,
    progressPercentage: this.progressPercentage,
    remainingAmount: this.remainingAmount,
    daysRemaining: this.daysRemaining,
    monthlyRequiredSavings: this.monthlyRequiredSavings,
    status: this.status,
    category: this.category,
    priority: this.priority,
    isCompleted: this.isCompleted,
    isOverdue: this.isOverdue,
    targetDate: this.targetDate,
    startDate: this.startDate,
    completedAt: this.completedAt
  };
};

// Static method to get user goals with summary
goalSchema.statics.getUserGoalsWithSummary = function(userId, status = null) {
  const query = { user: userId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ priority: -1, targetDate: 1 })
    .populate('user', 'name email');
};

// Static method to get goals by category
goalSchema.statics.getGoalsByCategory = function(userId, category) {
  return this.find({ user: userId, category })
    .sort({ targetDate: 1 });
};

goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;