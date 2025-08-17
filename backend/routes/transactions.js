const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Transaction, Product, User } = require('../models');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get transactions with filtering and pagination
// @access  Private
router.get('/', [
  authMiddleware,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'in_transit', 'delivered', 'verified', 'rejected', 'cancelled'])
    .withMessage('Invalid status'),
  query('type')
    .optional()
    .isIn(['transfer', 'purchase', 'verification', 'audit'])
    .withMessage('Invalid transaction type')
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
    
    // Build where clause based on user role
    let whereClause = {};
    
    // Non-admin users can only see their own transactions
    if (req.user.role !== 'admin') {
      whereClause = {
        [require('sequelize').Op.or]: [
          { from_user_id: req.user.id },
          { to_user_id: req.user.id }
        ]
      };
    }
    
    // Add filters
    if (req.query.status) {
      whereClause.status = req.query.status;
    }
    
    if (req.query.type) {
      whereClause.transaction_type = req.query.type;
    }
    
    if (req.query.search) {
      whereClause[require('sequelize').Op.or] = [
        { tracking_number: { [require('sequelize').Op.iLike]: `%${req.query.search}%` } },
        { notes: { [require('sequelize').Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'category', 'brand']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      message: 'Transactions retrieved successfully',
      data: transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      error: 'Retrieval Failed',
      message: 'Unable to retrieve transactions'
    });
  }
});

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Private
router.post('/', [
  authMiddleware,
  body('to_user_id')
    .isUUID()
    .withMessage('Valid recipient user ID is required'),
  body('product_id')
    .isUUID()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  body('unit_price')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be 0 or greater'),
  body('transaction_type')
    .optional()
    .isIn(['transfer', 'purchase', 'verification', 'audit'])
    .withMessage('Invalid transaction type'),
  body('shipping_address')
    .optional()
    .isObject()
    .withMessage('Shipping address must be an object'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
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
    
    const {
      to_user_id,
      product_id,
      quantity,
      unit_price,
      transaction_type = 'transfer',
      shipping_address,
      estimated_delivery,
      notes,
      carrier,
      unit = 'pcs',
      currency = 'IDR'
    } = req.body;
    
    // Verify recipient exists
    const recipient = await User.findByPk(to_user_id);
    if (!recipient) {
      return res.status(404).json({
        error: 'Recipient Not Found',
        message: 'The specified recipient does not exist'
      });
    }
    
    // Verify product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        error: 'Product Not Found',
        message: 'The specified product does not exist'
      });
    }
    
    // Calculate total amount
    const total_amount = parseFloat(quantity) * parseFloat(unit_price);
    
    // Generate tracking number
    const tracking_number = `TC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create transaction
    const transaction = await Transaction.create({
      from_user_id: req.user.id,
      to_user_id,
      product_id,
      transaction_type,
      quantity,
      unit,
      unit_price,
      total_amount,
      currency,
      shipping_address,
      estimated_delivery,
      tracking_number,
      carrier,
      notes,
      status: 'pending'
    });
    
    // Load transaction with associations
    const fullTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'category', 'brand', 'images']
        }
      ]
    });
    
    res.status(201).json({
      message: 'Transaction created successfully',
      data: fullTransaction
    });
    
    // Emit real-time event
    if (req.io) {
      req.io.emit('transaction_created', {
        transaction: fullTransaction,
        timestamp: new Date()
      });
      
      // Notify specific users
      req.io.to(`user_${to_user_id}`).emit('transaction_received', {
        transaction: fullTransaction,
        sender: req.user.first_name + ' ' + req.user.last_name
      });
    }
    
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: 'Unable to create transaction'
    });
  }
});

// @route   PUT /api/transactions/:id/status
// @desc    Update transaction status
// @access  Private
router.put('/:id/status', [
  authMiddleware,
  body('status')
    .isIn(['confirmed', 'in_transit', 'delivered', 'verified', 'rejected', 'cancelled'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
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
    
    const { status, notes } = req.body;
    
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction Not Found',
        message: 'The specified transaction does not exist'
      });
    }
    
    // Check permissions - only sender, receiver, or admin can update status
    if (req.user.role !== 'admin' && 
        req.user.id !== transaction.from_user_id && 
        req.user.id !== transaction.to_user_id) {
      return res.status(403).json({
        error: 'Access Forbidden',
        message: 'You do not have permission to update this transaction'
      });
    }
    
    // Update transaction status
    await transaction.updateStatus(status, notes);
    
    // Load updated transaction with associations
    const updatedTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'category', 'brand']
        }
      ]
    });
    
    res.json({
      message: 'Transaction status updated successfully',
      data: updatedTransaction
    });
    
    // Emit real-time event
    if (req.io) {
      req.io.emit('transaction_updated', {
        transaction: updatedTransaction,
        previousStatus: transaction.status,
        newStatus: status,
        timestamp: new Date()
      });
    }
    
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'Unable to update transaction status'
    });
  }
});

// @route   GET /api/transactions/stats/summary
// @desc    Get transaction statistics
// @access  Private
router.get('/stats/summary', authorize('admin', 'supplier', 'distributor', 'retailer'), async (req, res) => {
  try {
    const { Op } = require('sequelize');
    
    // Build where clause based on user role
    let whereClause = {};
    if (req.user.role !== 'admin') {
      whereClause = {
        [Op.or]: [
          { from_user_id: req.user.id },
          { to_user_id: req.user.id }
        ]
      };
    }
    
    // Get basic counts
    const totalTransactions = await Transaction.count({ where: whereClause });
    const pendingTransactions = await Transaction.count({ 
      where: { ...whereClause, status: 'pending' } 
    });
    const deliveredTransactions = await Transaction.count({ 
      where: { ...whereClause, status: 'delivered' } 
    });
    const verifiedTransactions = await Transaction.count({ 
      where: { ...whereClause, status: 'verified' } 
    });
    
    // Get total value
    const totalValue = await Transaction.sum('total_amount', { where: whereClause }) || 0;
    
    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['first_name', 'last_name', 'company_name']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['first_name', 'last_name', 'company_name']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'sku']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    res.json({
      message: 'Transaction statistics retrieved successfully',
      data: {
        summary: {
          total: totalTransactions,
          pending: pendingTransactions,
          delivered: deliveredTransactions,
          verified: verifiedTransactions,
          totalValue,
          currency: 'IDR'
        },
        recentTransactions
      }
    });
    
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      error: 'Stats Retrieval Failed',
      message: 'Unable to retrieve transaction statistics'
    });
  }
});

// @route   GET /api/transactions/search
// @desc    Search transactions by ID, hash, or other criteria
// @access  Private
router.get('/search', [
  authMiddleware,
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1 })
    .withMessage('Search query must be at least 1 character')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { q } = req.query;
    const { Op } = require('sequelize');

    // Build where clause based on user role
    let baseWhere = {};
    if (req.user.role !== 'admin') {
      baseWhere = {
        [Op.or]: [
          { from_user_id: req.user.id },
          { to_user_id: req.user.id }
        ]
      };
    }

    // Search by ID, hash, or product name
    const searchWhere = {
      ...baseWhere,
      [Op.or]: [
        { id: q },
        { transaction_hash: { [Op.iLike]: `%${q}%` } },
        { notes: { [Op.iLike]: `%${q}%` } }
      ]
    };

    const transactions = await Transaction.findAll({
      where: searchWhere,
      include: [
        {
          model: User,
          as: 'FromUser',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        },
        {
          model: User,
          as: 'ToUser', 
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        },
        {
          model: Product,
          as: 'Product',
          attributes: ['id', 'name', 'sku', 'unit']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 20
    });

    res.json({
      message: 'Search completed successfully',
      data: transactions,
      count: transactions.length
    });

  } catch (error) {
    console.error('Transaction search error:', error);
    res.status(500).json({
      error: 'Search Failed',
      message: 'Unable to search transactions'
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get specific transaction by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { Op } = require('sequelize');

    // Build where clause based on user role
    let where = { id };
    if (req.user.role !== 'admin') {
      where = {
        id,
        [Op.or]: [
          { from_user_id: req.user.id },
          { to_user_id: req.user.id }
        ]
      };
    }

    const transaction = await Transaction.findOne({
      where,
      include: [
        {
          model: User,
          as: 'FromUser',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        },
        {
          model: User,
          as: 'ToUser',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        },
        {
          model: Product,
          as: 'Product',
          attributes: ['id', 'name', 'sku', 'unit', 'description']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction Not Found',
        message: 'The requested transaction does not exist or you do not have permission to view it'
      });
    }

    res.json({
      message: 'Transaction retrieved successfully',
      data: transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      error: 'Retrieval Failed',
      message: 'Unable to retrieve transaction'
    });
  }
});

module.exports = router;
