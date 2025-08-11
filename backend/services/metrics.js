const express = require('express');
const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'trustchain-backend'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register]
});

const databaseConnections = new client.Gauge({
  name: 'database_connections',
  help: 'Number of active database connections',
  registers: [register]
});

const cacheHitRate = new client.Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate percentage',
  registers: [register]
});

const blockchainTransactions = new client.Counter({
  name: 'blockchain_transactions_total',
  help: 'Total number of blockchain transactions',
  labelNames: ['status'],
  registers: [register]
});

// Middleware to track HTTP requests
const httpMetricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
  });
  
  next();
};

// Update active connections
let connectionCount = 0;

const updateConnectionCount = (delta) => {
  connectionCount += delta;
  activeConnections.set(connectionCount);
};

// Database metrics updater
const updateDatabaseMetrics = async (sequelize) => {
  try {
    const pool = sequelize.connectionManager.pool;
    if (pool) {
      databaseConnections.set(pool.used);
    }
  } catch (error) {
    console.error('Error updating database metrics:', error);
  }
};

// Cache metrics updater
const updateCacheMetrics = async (cacheService) => {
  try {
    if (cacheService && cacheService.client) {
      const info = await cacheService.client.info('stats');
      const stats = info.split('\r\n').reduce((acc, line) => {
        const [key, value] = line.split(':');
        if (key && value) acc[key] = value;
        return acc;
      }, {});
      
      const hits = parseInt(stats.keyspace_hits || 0);
      const misses = parseInt(stats.keyspace_misses || 0);
      const total = hits + misses;
      
      if (total > 0) {
        cacheHitRate.set((hits / total) * 100);
      }
    }
  } catch (error) {
    console.error('Error updating cache metrics:', error);
  }
};

// Blockchain metrics updater
const updateBlockchainTransaction = (status) => {
  blockchainTransactions.labels(status).inc();
};

// Health check metrics
const healthChecks = new client.Gauge({
  name: 'health_check_status',
  help: 'Health check status (1 = healthy, 0 = unhealthy)',
  labelNames: ['service'],
  registers: [register]
});

const updateHealthStatus = (service, isHealthy) => {
  healthChecks.labels(service).set(isHealthy ? 1 : 0);
};

// Business metrics
const productsCreated = new client.Counter({
  name: 'products_created_total',
  help: 'Total number of products created',
  registers: [register]
});

const transactionsCreated = new client.Counter({
  name: 'transactions_created_total',
  help: 'Total number of transactions created',
  labelNames: ['type'],
  registers: [register]
});

const usersRegistered = new client.Counter({
  name: 'users_registered_total',
  help: 'Total number of users registered',
  labelNames: ['role'],
  registers: [register]
});

const apiErrors = new client.Counter({
  name: 'api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['error_type', 'endpoint'],
  registers: [register]
});

// Custom metrics router
const createMetricsRouter = () => {
  const router = express.Router();
  
  // Metrics endpoint
  router.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.send(await register.metrics());
    } catch (error) {
      res.status(500).send('Error generating metrics');
    }
  });
  
  // Health endpoint with detailed status
  router.get('/health/detailed', async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unknown',
        cache: 'unknown',
        blockchain: 'unknown'
      },
      metrics: {
        activeConnections: connectionCount,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };
    
    // Check services and update health status
    // This would be implemented based on your actual service checks
    
    res.json(health);
  });
  
  return router;
};

module.exports = {
  register,
  httpMetricsMiddleware,
  updateConnectionCount,
  updateDatabaseMetrics,
  updateCacheMetrics,
  updateBlockchainTransaction,
  updateHealthStatus,
  productsCreated,
  transactionsCreated,
  usersRegistered,
  apiErrors,
  createMetricsRouter
};
