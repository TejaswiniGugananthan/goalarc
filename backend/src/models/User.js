const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'local';
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    sparse: true // Allow multiple null values but unique non-null values
  },
  profilePicture: {
    type: String,
    default: ''
  },
  totalIncome: {
    type: Number,
    default: 0
  },
  totalExpenses: {
    type: Number,
    default: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  goals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  preferences: {
    currency: {
      type: String,
      default: 'USD'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    notifications: {
      goalReminders: {
        type: Boolean,
        default: true
      },
      achievementAlerts: {
        type: Boolean,
        default: true
      },
      weeklyReports: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ authProvider: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update financial totals
userSchema.methods.updateFinancialTotals = async function() {
  const Transaction = mongoose.model('Transaction');
  
  const aggregation = await Transaction.aggregate([
    { $match: { user: this._id } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  let totalIncome = 0;
  let totalExpenses = 0;
  
  aggregation.forEach(item => {
    if (item._id === 'income') {
      totalIncome = item.total;
    } else if (item._id === 'expense') {
      totalExpenses = item.total;
    }
  });
  
  this.totalIncome = totalIncome;
  this.totalExpenses = totalExpenses;
  this.currentBalance = totalIncome - totalExpenses;
  
  await this.save();
  return this;
};

// Instance method to get user summary
userSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    authProvider: this.authProvider,
    totalIncome: this.totalIncome,
    totalExpenses: this.totalExpenses,
    currentBalance: this.currentBalance,
    goalsCount: this.goals.length,
    transactionsCount: this.transactions.length,
    lastLogin: this.lastLogin,
    preferences: this.preferences
  };
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user with password (for login)
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// Virtual for full name (if needed for display)
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.googleId;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;