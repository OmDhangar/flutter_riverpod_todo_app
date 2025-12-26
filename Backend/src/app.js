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
// Trust Proxy (important for rate limit + IP)
// ===========================================
app.set('trust proxy', 1);

// ===========================================
// Security Middleware
// ===========================================
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// ===========================================
// CORS – Allow ALL origins (DEV / TEST friendly)
// ===========================================
app.use(
  cors({
    origin: true, // reflect request origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['Content-Length', 'X-Request-Id']
  })
);

// Explicit preflight handling
app.options('*', cors());

// ===========================================
// Body Parsing
// ===========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// Compression
// ===========================================
app.use(compression());

// ===========================================
// Request Logging
// ===========================================
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
      ip: req.ip,
      origin: req.get('origin'),
      userAgent: req.get('user-agent')
    });
  });

  next();
});

// ===========================================
// Rate Limiting
// Disable in TEST mode
// ===========================================
if (process.env.NODE_ENV !== 'test') {
  app.use('/api', rateLimiter);
}

// ===========================================
// Health Check
// ===========================================
app.get('/health', async (req, res) => {
  const dbHealthy = await testConnection();

  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: dbHealthy ? 'connected' : 'disconnected'
  });
});

// ===========================================
// Test Endpoint (NO AUTH)
// ===========================================
app.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is reachable from any origin 🚀',
    headers: req.headers,
    ip: req.ip
  });
});

// ===========================================
// Root Info
// ===========================================
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Smart Task Manager API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      health: 'GET /health',
      test: 'GET /test',
      tasks: '/api/tasks'
    }
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
      message: `${req.method} ${req.originalUrl} not found`
    }
  });
});

// ===========================================
// Global Error Handler
// ===========================================
app.use(errorHandler);

// ===========================================
// Start Server
// ===========================================
const startServer = async () => {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.error('Database connection failed. Exiting.');
    process.exit(1);
  }

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });
  }
};

startServer();

// ===========================================
// Process Safety
// ===========================================
process.on('unhandledRejection', err => {
  logger.error('Unhandled Rejection', err);
  process.exit(1);
});

process.on('uncaughtException', err => {
  logger.error('Uncaught Exception', err);
  process.exit(1);
});

module.exports = app;
