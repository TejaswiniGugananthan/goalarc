const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  authenticateToken, 
  authRateLimit, 
  validateRequestBody, 
  sanitizeInput 
} = require('../middleware/auth');

// Apply sanitization to all routes
router.use(sanitizeInput);

// Public routes (with rate limiting)
router.post('/register', 
  authRateLimit,
  validateRequestBody(['name', 'email', 'password']),
  authController.register
);

router.post('/login', 
  authRateLimit,
  validateRequestBody(['email', 'password']),
  authController.login
);

router.post('/google', 
  authRateLimit,
  authController.googleAuth
);

router.post('/forgot-password', 
  authRateLimit,
  validateRequestBody(['email']),
  authController.forgotPassword
);

router.post('/reset-password', 
  authRateLimit,
  validateRequestBody(['token', 'password']),
  authController.resetPassword
);

router.get('/google/callback', 
  authController.googleCallback
);

router.get('/check-email', 
  authController.checkEmailAvailability
);

// Protected routes
router.use(authenticateToken);

router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/change-password', 
  validateRequestBody(['currentPassword', 'newPassword']),
  authController.changePassword
);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/verify', authController.verifyToken);
router.post('/deactivate', authController.deactivateAccount);

module.exports = router;