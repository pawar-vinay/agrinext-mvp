/**
 * Agrinext Backend Server
 * Express server with TypeScript support
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { testConnection } from './config/database';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Create Express app
const app: Application = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://3.239.184.220:3000"],
      upgradeInsecureRequests: null,
    },
  },
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: env.CORS_ORIGIN.split(','),
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging middleware
if (env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
}

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    services: {
      database: 'unknown',
    },
  };

  try {
    // Check database connectivity
    const dbConnected = await testConnection();
    health.services.database = dbConnected ? 'connected' : 'disconnected';
    
    if (!dbConnected) {
      health.status = 'degraded';
      return res.status(503).json(health);
    }
    
    res.status(200).json(health);
  } catch (error) {
    health.status = 'unhealthy';
    health.services.database = 'error';
    res.status(503).json(health);
  }
});

// API version endpoint
app.get(`/api/${env.API_VERSION}`, (req: Request, res: Response) => {
  res.status(200).json({
    message: `Agrinext API ${env.API_VERSION}`,
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: `/api/${env.API_VERSION}/auth`,
      users: `/api/${env.API_VERSION}/users`,
      diseases: `/api/${env.API_VERSION}/diseases`,
      advisories: `/api/${env.API_VERSION}/advisories`,
      schemes: `/api/${env.API_VERSION}/schemes`,
    },
  });
});

// API Routes
import authRoutes from './routes/auth.routes';
import diseaseRoutes from './routes/disease.routes';
import advisoryRoutes from './routes/advisory.routes';
import userRoutes from './routes/user.routes';
import schemeRoutes from './routes/scheme.routes';
import path from 'path';

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/diseases`, diseaseRoutes);
app.use(`/api/${env.API_VERSION}/advisories`, advisoryRoutes);
app.use(`/api/${env.API_VERSION}/users`, userRoutes);
app.use(`/api/${env.API_VERSION}/schemes`, schemeRoutes);

// Serve static files from web-app/dist (if exists)
const webAppPath = path.join(process.cwd(), '..', 'web-app', 'dist');
app.use(express.static(webAppPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req: Request, res: Response, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return next();
  }
  
  // Serve index.html for SPA routes
  res.sendFile(path.join(webAppPath, 'index.html'), (err) => {
    if (err) {
      next(); // If file doesn't exist, pass to 404 handler
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Test database connection (optional in development)
    try {
      const dbConnected = await testConnection();
      if (!dbConnected) {
        logger.warn('Database connection failed - running in limited mode');
      } else {
        logger.info('Database connected successfully');
      }
    } catch (dbError) {
      logger.warn('Database connection error - running in limited mode:', dbError);
    }

    // Start listening
    app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`🚀 Agrinext server running on port ${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`API Version: ${env.API_VERSION}`);
      logger.info(`Server accessible at: http://0.0.0.0:${env.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if not in test mode
if (env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
