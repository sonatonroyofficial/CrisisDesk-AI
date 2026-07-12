import express, { Request, Response } from 'express';
import { env } from './config/env';
import { connectDB } from './config/db';
import { successResponse } from './utils/ApiResponse';
import reportRoutes from './routes/report.routes';
import statsRoutes from './routes/stats.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler, AppError } from './middlewares/errorHandler';
import { globalLimiter } from './middlewares/rateLimiter';
import { setupSwagger } from './docs/swagger';

const app = express();

// Set up Swagger docs on /api-docs
setupSwagger(app);

// Middleware for parsing JSON requests
app.use(express.json());

// Apply global rate limiting to all /api routes
app.use('/api', globalLimiter);

// Mount Admin Auth routes
app.use('/api/admin', adminRoutes);

// Mount Stats routes first to avoid route conflicts with /api/reports/:id
app.use('/api/reports/stats', statsRoutes);

// Mount API routes
app.use('/api/reports', reportRoutes);

// GET /health endpoint using standard successResponse format
app.get('/health', (req: Request, res: Response) => {
  res.json(successResponse({ status: 'ok' }));
});

// Catch-all route for unmatched paths
app.use((req: Request, res: Response, next) => {
  next(new AppError('Route not found.', 404));
});

// Centralized error handler registered last
app.use(errorHandler);

// Start database connection and then listen on the port
async function bootstrap() {
  try {
    // Attempt database connection on startup
    await connectDB();
  } catch (error) {
    console.error('[Startup Warning] Database connection failed:', error instanceof Error ? error.message : error);
    console.log('Starting Express server anyway for health check verification...');
  }

  // Bind server to port
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

export default app;
