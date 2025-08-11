const express = require('express');
const { query, validationResult } = require('express-validator');
const { User } = require('../models');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin, Supplier, Distributor, Retailer)
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['admin', 'supplier', 'distributor', 'retailer', 'auditor', 'consumer'])
    .withMessage('Invalid role'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'suspended'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Build where clause
    let whereClause = {};
    
    if (req.query.role) {
      whereClause.role = req.query.role;
    }
    
    if (req.query.status) {
      whereClause.status = req.query.status;
    }
    
    if (req.query.search) {
      const { Op } = require('sequelize');
      whereClause[Op.or] = [
        { first_name: { [Op.iLike]: `%${req.query.search}%` } },
        { last_name: { [Op.iLike]: `%${req.query.search}%` } },
        { email: { [Op.iLike]: `%${req.query.search}%` } },
        { company_name: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { 
        exclude: ['password', 'email_verification_token', 'password_reset_token'] 
      },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Retrieval Failed',
      message: 'Unable to retrieve users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { 
        exclude: ['password', 'email_verification_token', 'password_reset_token'] 
      }
    });
    
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'The specified user does not exist'
      });
    }
    
    // Non-admin users can only view their own profile or basic info of others
    if (req.user.role !== 'admin' && req.user.id !== user.id) {
      const publicInfo = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        company_name: user.company_name,
        role: user.role,
        status: user.status
      };
      
      return res.json({
        message: 'User profile retrieved successfully',
        data: publicInfo
      });
    }
    
    res.json({
      message: 'User profile retrieved successfully',
      data: user
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Retrieval Failed',
      message: 'Unable to retrieve user'
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', [
  authorize('admin'),
  require('express-validator').body('status')
    .isIn(['active', 'inactive', 'pending', 'suspended'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }
    
    const { status } = req.body;
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'The specified user does not exist'
      });
    }
    
    // Prevent admin from changing their own status
    if (user.id === req.user.id) {
      return res.status(400).json({
        error: 'Invalid Operation',
        message: 'You cannot change your own status'
      });
    }
    
    await user.update({ status });
    
    res.json({
      message: 'User status updated successfully',
      data: user.getPublicProfile()
    });
    
    // Emit real-time event
    if (req.io) {
      req.io.emitToUser(user.id, 'status_updated', {
        newStatus: status,
        updatedBy: req.user.first_name + ' ' + req.user.last_name,
        timestamp: new Date()
      });
      
      req.io.emitToRole('admin', 'user_status_changed', {
        userId: user.id,
        userName: user.first_name + ' ' + user.last_name,
        newStatus: status,
        changedBy: req.user.id,
        timestamp: new Date()
      });
    }
    
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'Unable to update user status'
    });
  }
});

// @route   GET /api/users/stats/summary
// @desc    Get user statistics
// @access  Private (Admin)
router.get('/stats/summary', authorize('admin'), async (req, res) => {
  try {
    const { Op } = require('sequelize');
    
    // Get user counts by role
    const roleStats = await User.findAll({
      attributes: [
        'role',
        [require('sequelize').fn('COUNT', require('sequelize').col('role')), 'count']
      ],
      group: ['role'],
      raw: true
    });
    
    // Get user counts by status
    const statusStats = await User.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    
    // Get total users
    const totalUsers = await User.count();
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    
    // Get active users (logged in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = await User.count({
      where: {
        last_login: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });
    
    // Get recent users
    const recentUsers = await User.findAll({
      attributes: { 
        exclude: ['password', 'email_verification_token', 'password_reset_token'] 
      },
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    res.json({
      message: 'User statistics retrieved successfully',
      data: {
        summary: {
          total: totalUsers,
          active: activeUsers,
          recentRegistrations,
          roleDistribution: roleStats.reduce((acc, item) => {
            acc[item.role] = parseInt(item.count);
            return acc;
          }, {}),
          statusDistribution: statusStats.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count);
            return acc;
          }, {})
        },
        recentUsers
      }
    });
    
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Stats Retrieval Failed',
      message: 'Unable to retrieve user statistics'
    });
  }
});

// @route   GET /api/users/search/partners
// @desc    Search for potential business partners
// @access  Private
router.get('/search/partners', [
  query('role')
    .optional()
    .isIn(['supplier', 'distributor', 'retailer'])
    .withMessage('Invalid role for partner search'),
  query('location')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Location must be at least 2 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }
    
    const { Op } = require('sequelize');
    let whereClause = {
      status: 'active',
      id: { [Op.ne]: req.user.id } // Exclude current user
    };
    
    if (req.query.role) {
      whereClause.role = req.query.role;
    } else {
      // Only show business roles
      whereClause.role = {
        [Op.in]: ['supplier', 'distributor', 'retailer']
      };
    }
    
    if (req.query.location) {
      whereClause.company_address = {
        [Op.iLike]: `%${req.query.location}%`
      };
    }
    
    if (req.query.search) {
      whereClause[Op.or] = [
        { company_name: { [Op.iLike]: `%${req.query.search}%` } },
        { first_name: { [Op.iLike]: `%${req.query.search}%` } },
        { last_name: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    const partners = await User.findAll({
      where: whereClause,
      attributes: [
        'id', 'first_name', 'last_name', 'company_name', 
        'role', 'company_address', 'company_type', 'created_at'
      ],
      order: [['company_name', 'ASC']],
      limit: 50
    });
    
    res.json({
      message: 'Partners retrieved successfully',
      data: partners
    });
    
  } catch (error) {
    console.error('Search partners error:', error);
    res.status(500).json({
      error: 'Search Failed',
      message: 'Unable to search for partners'
    });
  }
});

module.exports = router;
