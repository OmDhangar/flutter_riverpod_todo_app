require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const taskRoutes = require('./routes/taskRoutes');
const { errorHandler } = require('./middlewares/errorHandler');
const logger = require('./config/logger');
const rateLimiter = require('./middlewares/rateLimiter');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// Security Middleware
// ===========================================
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));

// ===========================================
// CORS Configuration
// ===========================================
const corsOptions = {
  origin: '*', // allow all origins for now
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ===========================================
// Body Parsing Middleware
// ===========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// Compression Middleware
// ===========================================
app.use(compression());

// ===========================================
// Request Logging
// ===========================================
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
});

// ===========================================
// Rate Limiting (Applied to API routes)
// ===========================================
app.use('/api', rateLimiter);

// ===========================================
// Health Check Endpoint
// ===========================================
app.get('/health', async (req, res) => {
  const dbHealthy = await testConnection();
  
  const health = {
    status: dbHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: dbHealthy ? 'connected' : 'disconnected'
  };

  const statusCode = dbHealthy ? 200 : 503;
  res.status(statusCode).json(health);
});

// ===========================================
// API Documentation Route
// ===========================================
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Smart Task Manager API',
    version: '1.0.0',
    documentation: 'See README.md for complete API documentation',
    endpoints: {
      health: 'GET /health',
      tasks: {
        create: 'POST /api/tasks',
        list: 'GET /api/tasks',
        getById: 'GET /api/tasks/:id',
        update: 'PATCH /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id',
        stats: 'GET /api/tasks/stats'
      }
    },
    authentication: 'All API endpoints require X-API-Key header',
    github: 'https://github.com/yourusername/smart-task-manager'
  });
});

// ===========================================
// API Routes
// ===========================================
app.use('/api/tasks', taskRoutes);

// ===========================================
// 404 Handler
// ===========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      availableEndpoints: [
        'GET /',
        'GET /health',
        'POST /api/tasks',
        'GET /api/tasks',
        'GET /api/tasks/:id',
        'PATCH /api/tasks/:id',
        'DELETE /api/tasks/:id'
      ]
    }
  });
});

// ===========================================
// Global Error Handler (Must be last)
// ===========================================
app.use(errorHandler);

// ===========================================
// Start Server
// ===========================================
const startServer = async () => {
  try {
    // Test database connection before starting
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    // Start listening
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        logger.info('===========================================');
        logger.info('🚀 Server started successfully!');
        logger.info('===========================================');
        logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
        logger.info(`🔗 Server: http://localhost:${PORT}`);
        logger.info(`💚 Health: http://localhost:${PORT}/health`);
        logger.info(`📚 Docs: http://localhost:${PORT}/`);
        logger.info('===========================================');
      });
    }
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();


module.exports = app;
