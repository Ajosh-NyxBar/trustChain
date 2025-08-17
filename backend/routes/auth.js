const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
  
  return { accessToken, refreshToken };
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .isIn(['supplier', 'distributor', 'retailer', 'consumer'])
    .withMessage('Invalid role selected'),
  body('company_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input data',
        details: errors.array()
      });
    }
    
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      role,
      company_name,
      company_address,
      company_type,
      business_license,
      tax_id
    } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'User Already Exists',
        message: 'An account with this email already exists'
      });
    }
    
    // Create new user
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      phone,
      role,
      company_name,
      company_address,
      company_type: company_type || 'individual',
      business_license,
      tax_id,
      status: 'active' // For demo purposes, auto-activate
    });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Update login info
    await user.updateLastLogin();
    
    res.status(201).json({
      message: 'User registered successfully',
      user: user.getPublicProfile(),
      tokens: {
        access: accessToken,
        refresh: refreshToken
      }
    });
    
    // Emit real-time event
    if (req.io) {
      req.io.emit('user_registered', {
        userId: user.id,
        role: user.role,
        company_name: user.company_name
      });
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input data',
        details: validationErrors
      });
    }
    
    // Handle unique constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'User Already Exists',
        message: 'An account with this email already exists'
      });
    }
    
    // Handle enum errors
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('enum')) {
      return res.status(400).json({
        error: 'Invalid Data',
        message: 'Please select valid options for all fields'
      });
    }
    
    res.status(500).json({
      error: 'Registration Failed',
      message: 'Unable to create account. Please try again.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input data',
        details: errors.array()
      });
    }
    
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'Account Inactive',
        message: 'Your account is not active. Please contact support.'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Update login info
    await user.updateLastLogin();
    
    res.json({
      message: 'Login successful',
      user: user.getPublicProfile(),
      tokens: {
        access: accessToken,
        refresh: refreshToken
      }
    });
    
    // Emit real-time event
    if (req.io) {
      req.io.emit('user_login', {
        userId: user.id,
        role: user.role,
        timestamp: new Date()
      });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login Failed',
      message: 'Unable to process login. Please try again.'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', [
  body('refresh_token')
    .notEmpty()
    .withMessage('Refresh token is required')
], async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    // Verify refresh token
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Invalid refresh token'
      });
    }
    
    // Check if user exists
    const user = await User.findByPk(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'User not found or inactive'
      });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    res.json({
      message: 'Tokens refreshed successfully',
      tokens: {
        access: accessToken,
        refresh: refreshToken
      }
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Invalid or expired refresh token'
      });
    }
    
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token Refresh Failed',
      message: 'Unable to refresh token. Please login again.'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      message: 'User profile retrieved successfully',
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Profile Retrieval Failed',
      message: 'Unable to retrieve user profile'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    res.json({
      message: 'Logout successful',
      instruction: 'Please remove tokens from client storage'
    });
    
    // Emit real-time event
    if (req.io) {
      req.io.emit('user_logout', {
        userId: req.user.id,
        timestamp: new Date()
      });
    }
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout Failed',
      message: 'Unable to process logout'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authMiddleware,
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('company_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input data',
        details: errors.array()
      });
    }
    
    const allowedUpdates = [
      'first_name', 'last_name', 'phone', 'company_name', 
      'company_address', 'company_type', 'business_license', 
      'tax_id', 'preferences'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    await req.user.update(updates);
    
    res.json({
      message: 'Profile updated successfully',
      user: req.user.getPublicProfile()
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Profile Update Failed',
      message: 'Unable to update profile'
    });
  }
});

module.exports = router;
