const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Product, User } = require('../models');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get products with filtering and pagination
// @access  Private
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Category must be at least 2 characters'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'discontinued', 'recalled'])
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
    
    // Non-admin users see only active products or their own products
    if (req.user.role !== 'admin') {
      const { Op } = require('sequelize');
      whereClause[Op.or] = [
        { status: 'active' },
        { manufacturer_id: req.user.id }
      ];
    }
    
    if (req.query.category) {
      whereClause.category = req.query.category;
    }
    
    if (req.query.status && req.user.role === 'admin') {
      whereClause.status = req.query.status;
    }
    
    if (req.query.search) {
      const { Op } = require('sequelize');
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { sku: { [Op.iLike]: `%${req.query.search}%` } },
        { brand: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'manufacturer',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      message: 'Products retrieved successfully',
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Retrieval Failed',
      message: 'Unable to retrieve products'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Supplier, Admin)
router.post('/', [
  authorize('supplier', 'admin'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('sku')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  body('base_price')
    .isFloat({ min: 0 })
    .withMessage('Base price must be 0 or greater'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be 0 or greater'),
  body('unit')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('Unit must be between 1 and 20 characters')
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
      name,
      sku,
      description,
      category,
      subcategory,
      brand,
      base_price,
      currency = 'IDR',
      unit = 'pcs',
      weight,
      dimensions,
      barcode,
      batch_number,
      production_date,
      expiry_date,
      shelf_life,
      storage_conditions,
      certifications,
      ingredients,
      safety_warnings,
      origin_country = 'Indonesia',
      origin_location,
      tags
    } = req.body;
    
    // Check if SKU already exists
    const existingProduct = await Product.findOne({ where: { sku } });
    if (existingProduct) {
      return res.status(409).json({
        error: 'SKU Already Exists',
        message: 'A product with this SKU already exists'
      });
    }
    
    // Create product
    const product = await Product.create({
      name,
      sku,
      description,
      category,
      subcategory,
      brand,
      manufacturer_id: req.user.id,
      base_price,
      currency,
      unit,
      weight,
      dimensions,
      barcode,
      batch_number,
      production_date,
      expiry_date,
      shelf_life,
      storage_conditions,
      certifications: certifications || [],
      ingredients: ingredients || [],
      safety_warnings: safety_warnings || [],
      origin_country,
      origin_location,
      tags: tags || [],
      status: 'active'
    });
    
    // Generate QR code
    await product.generateQRCode();
    
    // Calculate sustainability score
    product.calculateSustainabilityScore();
    await product.save();
    
    // Load product with manufacturer info
    const fullProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: User,
          as: 'manufacturer',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        }
      ]
    });
    
    res.status(201).json({
      message: 'Product created successfully',
      data: fullProduct
    });
    
    // Emit real-time event
    if (req.io) {
      req.io.emit('product_created', {
        product: fullProduct,
        timestamp: new Date()
      });
    }
    
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: 'Unable to create product'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'manufacturer',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role', 'email']
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({
        error: 'Product Not Found',
        message: 'The specified product does not exist'
      });
    }
    
    res.json({
      message: 'Product retrieved successfully',
      data: product
    });
    
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Retrieval Failed',
      message: 'Unable to retrieve product'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Owner or Admin)
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('base_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be 0 or greater'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'discontinued', 'recalled'])
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
    
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        error: 'Product Not Found',
        message: 'The specified product does not exist'
      });
    }
    
    // Check permissions - only manufacturer or admin can update
    if (req.user.role !== 'admin' && product.manufacturer_id !== req.user.id) {
      return res.status(403).json({
        error: 'Access Forbidden',
        message: 'You do not have permission to update this product'
      });
    }
    
    const allowedUpdates = [
      'name', 'description', 'category', 'subcategory', 'brand',
      'base_price', 'currency', 'unit', 'weight', 'dimensions',
      'storage_conditions', 'certifications', 'ingredients',
      'safety_warnings', 'tags', 'status'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    await product.update(updates);
    
    // Recalculate sustainability score if relevant fields changed
    if (updates.certifications || updates.carbon_footprint || updates.recyclability) {
      product.calculateSustainabilityScore();
      await product.save();
    }
    
    // Load updated product with manufacturer info
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: User,
          as: 'manufacturer',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        }
      ]
    });
    
    res.json({
      message: 'Product updated successfully',
      data: updatedProduct
    });
    
    // Emit real-time event
    if (req.io) {
      req.io.emit('product_updated', {
        product: updatedProduct,
        updatedBy: req.user.first_name + ' ' + req.user.last_name,
        timestamp: new Date()
      });
    }
    
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'Unable to update product'
    });
  }
});

// @route   GET /api/products/verify/:identifier
// @desc    Verify product by QR code, barcode, or SKU
// @access  Public
router.get('/verify/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { Op } = require('sequelize');
    
    const product = await Product.findOne({
      where: {
        [Op.or]: [
          { qr_code: identifier },
          { barcode: identifier },
          { sku: identifier }
        ]
      },
      include: [
        {
          model: User,
          as: 'manufacturer',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'role']
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({
        error: 'Product Not Found',
        message: 'No product found with the provided identifier',
        verified: false
      });
    }
    
    // Basic verification info
    const verificationInfo = {
      verified: true,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        brand: product.brand,
        category: product.category,
        manufacturer: product.manufacturer,
        production_date: product.production_date,
        expiry_date: product.expiry_date,
        certifications: product.certifications,
        sustainability_score: product.sustainability_score,
        status: product.status,
        blockchain_registered: product.blockchain_registered
      },
      verification_timestamp: new Date(),
      verification_method: identifier === product.qr_code ? 'QR Code' : 
                          identifier === product.barcode ? 'Barcode' : 'SKU'
    };
    
    res.json({
      message: 'Product verification successful',
      data: verificationInfo
    });
    
    // Log verification attempt (could be stored in database)
    console.log(`✅ Product verified: ${product.name} (${product.sku}) via ${verificationInfo.verification_method}`);
    
  } catch (error) {
    console.error('Product verification error:', error);
    res.status(500).json({
      error: 'Verification Failed',
      message: 'Unable to verify product',
      verified: false
    });
  }
});

// @route   GET /api/products/stats/summary
// @desc    Get product statistics
// @access  Private
router.get('/stats/summary', async (req, res) => {
  try {
    const { Op } = require('sequelize');
    
    // Build where clause based on user role
    let whereClause = {};
    if (req.user.role !== 'admin') {
      whereClause.manufacturer_id = req.user.id;
    }
    
    // Get basic counts
    const totalProducts = await Product.count({ where: whereClause });
    const activeProducts = await Product.count({ 
      where: { ...whereClause, status: 'active' } 
    });
    const inactiveProducts = await Product.count({ 
      where: { ...whereClause, status: 'inactive' } 
    });
    
    // Get category distribution
    const categoryStats = await Product.findAll({
      where: whereClause,
      attributes: [
        'category',
        [require('sequelize').fn('COUNT', require('sequelize').col('category')), 'count']
      ],
      group: ['category'],
      raw: true
    });
    
    // Get average sustainability score
    const avgSustainabilityScore = await Product.findOne({
      where: {
        ...whereClause,
        sustainability_score: { [Op.not]: null }
      },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('sustainability_score')), 'average']
      ],
      raw: true
    });
    
    // Get recent products
    const recentProducts = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'manufacturer',
          attributes: ['first_name', 'last_name', 'company_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    res.json({
      message: 'Product statistics retrieved successfully',
      data: {
        summary: {
          total: totalProducts,
          active: activeProducts,
          inactive: inactiveProducts,
          categoryDistribution: categoryStats.reduce((acc, item) => {
            acc[item.category] = parseInt(item.count);
            return acc;
          }, {}),
          averageSustainabilityScore: avgSustainabilityScore?.average ? 
            parseFloat(avgSustainabilityScore.average).toFixed(1) : null
        },
        recentProducts
      }
    });
    
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      error: 'Stats Retrieval Failed',
      message: 'Unable to retrieve product statistics'
    });
  }
});

module.exports = router;
