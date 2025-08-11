const express = require('express');
const { query, validationResult } = require('express-validator');
const { Transaction, Product, User } = require('../models');
const { authorize } = require('../middleware/auth');

// Import cache middleware with fallback
let cacheMiddleware, invalidateCache;
try {
  const cacheModule = require('../services/cache');
  cacheMiddleware = cacheModule.cacheMiddleware;
  invalidateCache = cacheModule.invalidateCache;
} catch (error) {
  // Fallback middleware if cache service is not available
  cacheMiddleware = (ttl, keyGenerator) => (req, res, next) => next();
  invalidateCache = (patterns) => (req, res, next) => next();
}

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics data
// @access  Private
router.get('/dashboard', 
  cacheMiddleware(300, (req) => `dashboard:${req.user.id}:${req.user.role}`), 
  async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const sequelize = require('../config/database');
    
    // Build where clause based on user role
    let transactionWhere = {};
    let productWhere = {};
    
    if (req.user.role !== 'admin') {
      transactionWhere = {
        [Op.or]: [
          { from_user_id: req.user.id },
          { to_user_id: req.user.id }
        ]
      };
      
      if (req.user.role === 'supplier') {
        productWhere.manufacturer_id = req.user.id;
      }
    }
    
    // Get total metrics
    const totalTransactions = await Transaction.count({ where: transactionWhere });
    const totalProducts = await Product.count({ where: productWhere });
    const totalUsers = req.user.role === 'admin' ? await User.count() : null;
    
    // Calculate total revenue
    const revenueResult = await Transaction.findOne({
      where: {
        ...transactionWhere,
        status: { [Op.in]: ['delivered', 'verified'] }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue']
      ],
      raw: true
    });
    
    const totalRevenue = revenueResult?.total_revenue || 0;
    
    // Get transaction status distribution
    const statusDistribution = await Transaction.findAll({
      where: transactionWhere,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    
    // Calculate compliance rate
    const totalCompletedTransactions = await Transaction.count({
      where: {
        ...transactionWhere,
        status: { [Op.in]: ['delivered', 'verified'] }
      }
    });
    
    const compliantTransactions = await Transaction.count({
      where: {
        ...transactionWhere,
        status: 'verified',
        compliance_status: 'compliant'
      }
    });
    
    const complianceRate = totalCompletedTransactions > 0 
      ? (compliantTransactions / totalCompletedTransactions * 100).toFixed(1)
      : 0;
    
    // Get monthly transaction trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyTrends = await Transaction.findAll({
      where: {
        ...transactionWhere,
        created_at: { [Op.gte]: twelveMonthsAgo }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transaction_count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']],
      raw: true
    });
    
    // Get recent activity
    const recentTransactions = await Transaction.findAll({
      where: transactionWhere,
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
          attributes: ['name', 'sku', 'category']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    // Get top products by transaction volume
    const topProducts = await Transaction.findAll({
      where: transactionWhere,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'category', 'brand']
        }
      ],
      attributes: [
        'product_id',
        [sequelize.fn('COUNT', sequelize.col('product_id')), 'transaction_count'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_value']
      ],
      group: ['product_id', 'product.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('product_id')), 'DESC']],
      limit: 5,
      raw: false
    });
    
    res.json({
      message: 'Dashboard analytics retrieved successfully',
      data: {
        summary: {
          totalTransactions,
          totalProducts,
          totalUsers,
          totalRevenue: parseFloat(totalRevenue),
          complianceRate: parseFloat(complianceRate),
          currency: 'IDR'
        },
        statusDistribution: statusDistribution.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        monthlyTrends: monthlyTrends.map(item => ({
          month: item.month,
          transactionCount: parseInt(item.transaction_count),
          totalAmount: parseFloat(item.total_amount || 0)
        })),
        recentTransactions,
        topProducts: topProducts.map(item => ({
          product: item.product,
          transactionCount: parseInt(item.dataValues.transaction_count),
          totalQuantity: parseFloat(item.dataValues.total_quantity),
          totalValue: parseFloat(item.dataValues.total_value)
        }))
      }
    });
    
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      error: 'Analytics Retrieval Failed',
      message: 'Unable to retrieve dashboard analytics'
    });
  }
});

// @route   GET /api/analytics/supply-chain
// @desc    Get supply chain analytics
// @access  Private
router.get('/supply-chain', [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Invalid period. Use 7d, 30d, 90d, or 1y')
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
    const sequelize = require('../config/database');
    
    // Calculate date range
    const period = req.query.period || '30d';
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays[period]);
    
    // Build where clause based on user role
    let whereClause = {
      created_at: { [Op.gte]: startDate }
    };
    
    if (req.user.role !== 'admin') {
      whereClause[Op.or] = [
        { from_user_id: req.user.id },
        { to_user_id: req.user.id }
      ];
    }
    
    // Get supply chain flow data
    const supplyChainFlow = await Transaction.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'role', 'company_name', 'company_address']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'role', 'company_name', 'company_address']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['category', 'origin_country']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Calculate delivery performance
    const deliveredTransactions = await Transaction.findAll({
      where: {
        ...whereClause,
        status: 'delivered',
        estimated_delivery: { [Op.not]: null },
        actual_delivery: { [Op.not]: null }
      },
      attributes: ['estimated_delivery', 'actual_delivery'],
      raw: true
    });
    
    let onTimeDeliveries = 0;
    let totalDeliveries = deliveredTransactions.length;
    
    deliveredTransactions.forEach(transaction => {
      const estimated = new Date(transaction.estimated_delivery);
      const actual = new Date(transaction.actual_delivery);
      if (actual <= estimated) {
        onTimeDeliveries++;
      }
    });
    
    const onTimeDeliveryRate = totalDeliveries > 0 
      ? (onTimeDeliveries / totalDeliveries * 100).toFixed(1)
      : 0;
    
    // Get geographic distribution
    const geographicDistribution = {};
    supplyChainFlow.forEach(transaction => {
      const senderAddress = transaction.sender?.company_address;
      const receiverAddress = transaction.receiver?.company_address;
      
      if (senderAddress) {
        // Extract city/region from address (simplified)
        const senderRegion = senderAddress.split(',').slice(-2, -1)[0]?.trim() || 'Unknown';
        geographicDistribution[senderRegion] = (geographicDistribution[senderRegion] || 0) + 1;
      }
    });
    
    // Calculate role-based transaction flows
    const roleFlows = {};
    supplyChainFlow.forEach(transaction => {
      const flow = `${transaction.sender.role}_to_${transaction.receiver.role}`;
      roleFlows[flow] = (roleFlows[flow] || 0) + 1;
    });
    
    // Get category performance
    const categoryPerformance = await Transaction.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['category']
        }
      ],
      attributes: [
        [sequelize.col('product.category'), 'category'],
        [sequelize.fn('COUNT', sequelize.col('Transaction.id')), 'transaction_count'],
        [sequelize.fn('AVG', sequelize.col('quality_score')), 'avg_quality'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_value']
      ],
      group: [sequelize.col('product.category')],
      raw: true
    });
    
    res.json({
      message: 'Supply chain analytics retrieved successfully',
      data: {
        period,
        summary: {
          totalTransactions: supplyChainFlow.length,
          onTimeDeliveryRate: parseFloat(onTimeDeliveryRate),
          totalDeliveries,
          onTimeDeliveries
        },
        geographicDistribution,
        roleFlows,
        categoryPerformance: categoryPerformance.map(item => ({
          category: item.category,
          transactionCount: parseInt(item.transaction_count),
          averageQuality: item.avg_quality ? parseFloat(item.avg_quality).toFixed(1) : null,
          totalValue: parseFloat(item.total_value || 0)
        })),
        supplyChainFlow: supplyChainFlow.slice(0, 50) // Limit for performance
      }
    });
    
  } catch (error) {
    console.error('Get supply chain analytics error:', error);
    res.status(500).json({
      error: 'Analytics Retrieval Failed',
      message: 'Unable to retrieve supply chain analytics'
    });
  }
});

// @route   GET /api/analytics/performance
// @desc    Get performance analytics
// @access  Private
router.get('/performance', authorize('admin', 'supplier', 'distributor'), async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const sequelize = require('../config/database');
    
    // Get user-specific performance metrics
    let userWhere = {};
    if (req.user.role !== 'admin') {
      userWhere = {
        [Op.or]: [
          { from_user_id: req.user.id },
          { to_user_id: req.user.id }
        ]
      };
    }
    
    // Calculate average processing time
    const processingTimes = await Transaction.findAll({
      where: {
        ...userWhere,
        status: { [Op.in]: ['delivered', 'verified'] },
        created_at: { [Op.not]: null },
        actual_delivery: { [Op.not]: null }
      },
      attributes: [
        'created_at',
        'actual_delivery',
        [sequelize.literal('EXTRACT(EPOCH FROM (actual_delivery - created_at))/86400'), 'days_to_deliver']
      ],
      raw: true
    });
    
    const avgProcessingTime = processingTimes.length > 0
      ? (processingTimes.reduce((sum, t) => sum + parseFloat(t.days_to_deliver), 0) / processingTimes.length).toFixed(1)
      : 0;
    
    // Get quality metrics
    const qualityMetrics = await Transaction.findOne({
      where: {
        ...userWhere,
        quality_score: { [Op.not]: null }
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('quality_score')), 'avg_quality'],
        [sequelize.fn('MIN', sequelize.col('quality_score')), 'min_quality'],
        [sequelize.fn('MAX', sequelize.col('quality_score')), 'max_quality'],
        [sequelize.fn('COUNT', sequelize.col('quality_score')), 'rated_transactions']
      ],
      raw: true
    });
    
    // Get monthly performance trends
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyPerformance = await Transaction.findAll({
      where: {
        ...userWhere,
        created_at: { [Op.gte]: sixMonthsAgo }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_transactions'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'verified' THEN 1 END")), 'verified_transactions'],
        [sequelize.fn('AVG', sequelize.col('quality_score')), 'avg_quality']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']],
      raw: true
    });
    
    // Get error/rejection analysis
    const errorAnalysis = await Transaction.findAll({
      where: {
        ...userWhere,
        status: { [Op.in]: ['rejected', 'cancelled'] }
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    
    res.json({
      message: 'Performance analytics retrieved successfully',
      data: {
        summary: {
          averageProcessingTime: parseFloat(avgProcessingTime),
          averageQuality: qualityMetrics?.avg_quality ? parseFloat(qualityMetrics.avg_quality).toFixed(1) : null,
          ratedTransactions: parseInt(qualityMetrics?.rated_transactions || 0),
          qualityRange: {
            min: qualityMetrics?.min_quality || null,
            max: qualityMetrics?.max_quality || null
          }
        },
        monthlyTrends: monthlyPerformance.map(item => ({
          month: item.month,
          totalTransactions: parseInt(item.total_transactions),
          verifiedTransactions: parseInt(item.verified_transactions),
          successRate: item.total_transactions > 0 
            ? ((item.verified_transactions / item.total_transactions) * 100).toFixed(1)
            : 0,
          averageQuality: item.avg_quality ? parseFloat(item.avg_quality).toFixed(1) : null
        })),
        errorAnalysis: errorAnalysis.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        processingTimeDistribution: processingTimes.map(t => ({
          daysToDeliver: parseFloat(t.days_to_deliver).toFixed(1),
          createdAt: t.created_at,
          deliveredAt: t.actual_delivery
        })).slice(0, 100) // Limit for performance
      }
    });
    
  } catch (error) {
    console.error('Get performance analytics error:', error);
    res.status(500).json({
      error: 'Analytics Retrieval Failed',
      message: 'Unable to retrieve performance analytics'
    });
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private
router.get('/export', [
  query('type')
    .isIn(['dashboard', 'supply-chain', 'performance', 'transactions'])
    .withMessage('Invalid export type'),
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Invalid format. Use json or csv')
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
    
    const { type, format = 'json' } = req.query;
    
    // Get data based on type
    let data;
    switch (type) {
      case 'transactions':
        const { Op } = require('sequelize');
        let whereClause = {};
        
        if (req.user.role !== 'admin') {
          whereClause = {
            [Op.or]: [
              { from_user_id: req.user.id },
              { to_user_id: req.user.id }
            ]
          };
        }
        
        data = await Transaction.findAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['company_name', 'role']
            },
            {
              model: User,
              as: 'receiver',
              attributes: ['company_name', 'role']
            },
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'sku', 'category']
            }
          ],
          order: [['created_at', 'DESC']],
          limit: 1000 // Limit for performance
        });
        break;
        
      default:
        return res.status(400).json({
          error: 'Invalid Export Type',
          message: 'Unsupported export type'
        });
    }
    
    if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csvData = data.map(item => ({
        id: item.id,
        created_at: item.created_at,
        status: item.status,
        sender: item.sender?.company_name,
        receiver: item.receiver?.company_name,
        product: item.product?.name,
        amount: item.total_amount
      }));
      
      const csvHeaders = Object.keys(csvData[0] || {}).join(',');
      const csvRows = csvData.map(row => Object.values(row).join(','));
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        export_type: type,
        export_date: new Date().toISOString(),
        user_id: req.user.id,
        data
      });
    }
    
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      error: 'Export Failed',
      message: 'Unable to export analytics data'
    });
  }
});

module.exports = router;
