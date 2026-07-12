import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/ApiResponse';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    const hasDescOrLocError = err.issues.some(
      issue => issue.path.includes('description') || issue.path.includes('location')
    );

    if (hasDescOrLocError) {
      message = 'Description and location are required.';
    } else {
      message = err.issues[0]?.message || 'Validation error';
    }
  }

  // Under production environment, never leak internal 500 error stack traces or original messages
  if (process.env.NODE_ENV === 'production') {
    if (statusCode === 500) {
      message = 'An unexpected error occurred. Please try again later.';
    }
    console.error(err); // Server-side log only
  } else {
    // In dev environment, log to console
    console.error(err);
  }

  return res.status(statusCode).json(errorResponse(message));
}

export default errorHandler;
