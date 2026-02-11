const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }
  
  // Register new user with email/password
  async registerUser(userData) {
    const { name, email, password } = userData;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      authProvider: 'local'
    });
    
    await user.save();
    
    // Generate token
    const token = this.generateToken(user._id);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    return {
      user: user.getSummary(),
      token
    };
  }
  
  // Login user with email/password
  async loginUser(email, password) {
    // Find user with password field
    const user = await User.findByEmailWithPassword(email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    if (!user.isActive) {
      throw new Error('Account has been deactivated');
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Generate token
    const token = this.generateToken(user._id);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    return {
      user: user.getSummary(),
      token
    };
  }

  // Google OAuth authentication with JWT token
  async googleAuth(googleData) {
    const { googleId, email, name, picture } = googleData;
    
    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // Check if user exists with this email but different auth provider
      user = await User.findByEmail(email);
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.authProvider = 'google';
        if (picture) user.profilePicture = picture;
        await user.save();
      } else {
        // Create new user
        user = new User({
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          googleId,
          authProvider: 'google',
          profilePicture: picture || null
        });
        await user.save();
      }
    }
    
    if (!user.isActive) {
      throw new Error('Account has been deactivated');
    }
    
    // Generate token
    const token = this.generateToken(user._id);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    return {
      user: user.getSummary(),
      token
    };
  }

  // Google OAuth user handling (legacy method for passport)
  async handleGoogleAuth(profile) {
    const { id: googleId, displayName, emails } = profile;
    const email = emails[0].value;
    
    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // Check if user exists with this email but different auth provider
      user = await User.findByEmail(email);
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save();
      } else {
        // Create new user
        user = new User({
          name: displayName || email.split('@')[0],
          email: email.toLowerCase(),
          googleId,
          authProvider: 'google'
        });
        await user.save();
      }
    }
    
    if (!user.isActive) {
      throw new Error('Account has been deactivated');
    }
    
    // Generate token
    const token = this.generateToken(user._id);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    return {
      user: user.getSummary(),
      token
    };
  }
  
  // Update user profile
  async updateProfile(userId, updates) {
    const allowedUpdates = ['name', 'email', 'preferences'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    if (filteredUpdates.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({
        email: filteredUpdates.email.toLowerCase(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        throw new Error('Email is already taken');
      }
      
      filteredUpdates.email = filteredUpdates.email.toLowerCase();
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user.getSummary();
  }
  
  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.authProvider !== 'local') {
      throw new Error('Cannot change password for Google OAuth users');
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    return { message: 'Password updated successfully' };
  }
  
  // Verify JWT token
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('Invalid token or user not found');
      }
      
      return user;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
  
  // Get user profile
  async getUserProfile(userId) {
    const user = await User.findById(userId)
      .populate('goals', 'name targetAmount savedAmount status')
      .populate('transactions', 'type amount description date', null, { 
        sort: { date: -1 }, 
        limit: 5 
      });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      ...user.getSummary(),
      recentGoals: user.goals.slice(0, 3),
      recentTransactions: user.transactions
    };
  }
  
  // Deactivate account
  async deactivateAccount(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: false } },
      { new: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return { message: 'Account deactivated successfully' };
  }
  
  // Refresh token
  async refreshToken(userId) {
    const user = await User.findById(userId);
    
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }
    
    const token = this.generateToken(user._id);
    
    return {
      user: user.getSummary(),
      token
    };
  }
}

module.exports = new AuthService();