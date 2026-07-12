import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/ApiResponse';

// Global limiter for all /api routes (100 requests per 15 minutes)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in standard headers
  legacyHeaders: false, // Disable legacy headers
  message: errorResponse('Too many requests, please try again later.'),
  statusCode: 429,
});

// Stricter limiter for creating reports (10 requests per 15 minutes)
export const reportCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse('Too many reports created from this IP, please try again after 15 minutes.'),
  statusCode: 429,
});
