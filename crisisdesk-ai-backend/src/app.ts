import express, { Request, Response } from 'express';
import { env } from './config/env';
import { connectDB } from './config/db';
import { successResponse } from './utils/ApiResponse';
import reportRoutes from './routes/report.routes';

const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

// Mount API routes
app.use('/api/reports', reportRoutes);

// GET /health endpoint using standard successResponse format
app.get('/health', (req: Request, res: Response) => {
  res.json(successResponse({ status: 'ok' }));
});

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

bootstrap();

export default app;
