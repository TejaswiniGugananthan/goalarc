const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null // Null for general income/expenses, set for goal-specific transactions
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'goal_contribution', 'goal_withdrawal'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      // Income categories
      'salary',
      'freelance',
      'business',
      'investment',
      'gift',
      'bonus',
      'other_income',
      // Expense categories
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
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters'],
    default: ''
  },
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'digital_wallet', 'other'],
    default: 'cash'
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters'],
    default: ''
  },
  merchant: {
    type: String,
    trim: true,
    maxlength: [100, 'Merchant name cannot exceed 100 characters'],
    default: ''
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    endDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['manual', 'import', 'recurring', 'auto'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Indexes for better performance
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1, date: -1 });
transactionSchema.index({ goal: 1, date: -1 });
transactionSchema.index({ date: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.amount);
});

// Virtual for month/year for grouping
transactionSchema.virtual('monthYear').get(function() {
  const date = new Date(this.date);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
});

// Pre-save middleware to update user totals
transactionSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    if (user) {
      await user.updateFinancialTotals();
    }
  } catch (error) {
    console.error('Error updating user financial totals:', error);
  }
});

// Pre-remove middleware to update user totals
transactionSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(doc.user);
      if (user) {
        await user.updateFinancialTotals();
      }
    } catch (error) {
      console.error('Error updating user financial totals after deletion:', error);
    }
  }
});

// Instance method to get transaction summary
transactionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    type: this.type,
    amount: this.amount,
    formattedAmount: this.formattedAmount,
    description: this.description,
    category: this.category,
    subcategory: this.subcategory,
    date: this.date,
    monthYear: this.monthYear,
    paymentMethod: this.paymentMethod,
    location: this.location,
    merchant: this.merchant,
    tags: this.tags,
    goal: this.goal,
    isRecurring: this.isRecurring,
    isVerified: this.isVerified,
    source: this.source
  };
};

// Static method to get user transactions with filters
transactionSchema.statics.getUserTransactions = function(userId, filters = {}) {
  const query = { user: userId };
  
  // Apply filters
  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.goal) query.goal = filters.goal;
  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  if (filters.minAmount || filters.maxAmount) {
    query.amount = {};
    if (filters.minAmount) query.amount.$gte = filters.minAmount;
    if (filters.maxAmount) query.amount.$lte = filters.maxAmount;
  }
  
  return this.find(query)
    .populate('goal', 'name category')
    .sort({ date: -1 });
};

// Static method to get monthly summary
transactionSchema.statics.getMonthlySummary = function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        categories: {
          $push: {
            category: '$category',
            amount: '$amount'
          }
        }
      }
    }
  ]);
};

// Static method to get category breakdown
transactionSchema.statics.getCategoryBreakdown = function(userId, type, startDate, endDate) {
  const matchQuery = {
    user: new mongoose.Types.ObjectId(userId),
    type: type
  };
  
  if (startDate && endDate) {
    matchQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
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
};

// Static method to get timeline data for charts
transactionSchema.statics.getTimelineData = function(userId, startDate, endDate, groupBy = 'day') {
  const matchQuery = {
    user: new mongoose.Types.ObjectId(userId)
  };
  
  if (startDate && endDate) {
    matchQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  let groupFormat;
  switch (groupBy) {
    case 'day':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
      break;
    case 'week':
      groupFormat = { $dateToString: { format: '%Y-%U', date: '$date' } };
      break;
    case 'month':
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$date' } };
      break;
    default:
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          date: groupFormat,
          type: '$type'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
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
    { $sort: { _id: 1 } }
  ]);
};

transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;