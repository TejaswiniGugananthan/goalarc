const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token or user not found'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }
    
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const authenticateOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Don't fail on invalid token for optional auth
    next();
  }
};

// Check if user owns the resource
const checkResourceOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    const resourceUserId = req.params.userId || req.body[resourceField] || req.query.userId;
    
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own resources'
      });
    }
    
    next();
  };
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
  next();
};

// Rate limiting for specific endpoints
const createRateLimit = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Specific rate limits
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later'
);

const apiRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  60, // limit each IP to 60 requests per minute
  'Too many API requests, please slow down'
);

// Validate request body middleware
const validateRequestBody = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(field => {
      return !req.body.hasOwnProperty(field) || req.body[field] === undefined || req.body[field] === null;
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Missing required fields',
        missingFields
      });
    }
    
    next();
  };
};

// Sanitize user input
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove potential XSS characters
      return value.replace(/<script[^>]*>.*?<\/script>/gi, '')
                  .replace(/<[\/\!]*?[^<>]*?>/gi, '')
                  .replace(/<[^<>]*?>/gi, '');
    }
    return value;
  };
  
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        } else {
          obj[key] = sanitizeValue(obj[key]);
        }
      }
    }
  };
  
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  
  next();
};

// Error handling wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Log requests in development
const logRequests = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  }
  next();
};

module.exports = {
  authenticateToken,
  authenticateOptional,
  checkResourceOwnership,
  requireAdmin,
  authRateLimit,
  apiRateLimit,
  validateRequestBody,
  sanitizeInput,
  asyncHandler,
  logRequests
};