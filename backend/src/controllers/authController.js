const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Google OAuth authentication
const googleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Google token is required'
    });
  }
  
  try {
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    // Check if user exists or create new user
    const result = await authService.googleAuth({
      googleId,
      email,
      name,
      picture
    });
    
    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      user: result.user,
      token: result.token
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({
      error: 'Authentication error',
      message: 'Invalid Google token'
    });
  }
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const User = require('../models/User');
  const user = await User.findByEmail(email);
  
  if (!user) {
    // Don't reveal if email exists for security
    return res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
  
  // Save reset token to user
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpiry;
  await user.save();
  
  // Send reset email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'GoalArc - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your GoalArc account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });
    
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      error: 'Email error',
      message: 'Failed to send password reset email'
    });
  }
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Token and new password are required'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Password must be at least 6 characters long'
    });
  }
  
  const User = require('../models/User');
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    return res.status(400).json({
      error: 'Invalid token',
      message: 'Password reset token is invalid or has expired'
    });
  }
  
  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

// Register new user
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Name, email, and password are required'
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Invalid email format'
    });
  }
  
  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Password must be at least 6 characters long'
    });
  }
  
  const result = await authService.registerUser({ name, email, password });
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Email and password are required'
    });
  }
  
  const result = await authService.loginUser(email, password);
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

// Google OAuth callback
const googleCallback = asyncHandler(async (req, res) => {
  // This would typically be handled by passport middleware
  // For now, we'll return a success response
  res.status(200).json({
    success: true,
    message: 'Google OAuth callback handled'
  });
});

// Get current user profile
const getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getUserProfile(req.user._id);
  
  res.status(200).json({
    success: true,
    data: profile
  });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = ['name', 'email', 'preferences'];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });
  
  const updatedUser = await authService.updateProfile(req.user._id, updates);
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Current password and new password are required'
    });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'New password must be at least 6 characters long'
    });
  }
  
  const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
  
  res.status(200).json({
    success: true,
    message: result.message
  });
});

// Refresh JWT token
const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshToken(req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result
  });
});

// Logout user (client-side token removal)
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please remove token from client.'
  });
});

// Verify token endpoint
const verifyToken = asyncHandler(async (req, res) => {
  // If this endpoint is reached, the token is valid (due to auth middleware)
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user.getSummary()
    }
  });
});

// Deactivate account
const deactivateAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  
  // Verify password for local users
  if (req.user.authProvider === 'local') {
    if (!password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password is required to deactivate account'
      });
    }
    
    const isPasswordValid = await req.user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: 'Authentication error',
        message: 'Invalid password'
      });
    }
  }
  
  const result = await authService.deactivateAccount(req.user._id);
  
  res.status(200).json({
    success: true,
    message: result.message
  });
});

// Check email availability
const checkEmailAvailability = asyncHandler(async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Email is required'
    });
  }
  
  const User = require('../models/User');
  const existingUser = await User.findByEmail(email);
  
  res.status(200).json({
    success: true,
    data: {
      available: !existingUser,
      email
    }
  });
});

module.exports = {
  register,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  googleCallback,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  verifyToken,
  deactivateAccount,
  checkEmailAvailability
};