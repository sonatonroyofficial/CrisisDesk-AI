import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import '../config/firebase'; // ensure Firebase app is initialized
import { getAuth } from 'firebase-admin/auth';
import { AppError } from './errorHandler';

export interface AdminRequest extends Request {
  admin?: any;
}

export async function requireAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Unauthorized.', 401));
    }

    const token = authHeader.split(' ')[1];

    // Mock bypass using local JWT validation for Jest integration tests
    if (process.env.NODE_ENV === 'test') {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.admin = decoded;
        return next();
      } catch (err) {
        return next(new AppError('Unauthorized.', 401));
      }
    }

    // Verify token with Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token);

    // Enforce that UID must match authorized admin UID
    if (decodedToken.uid !== 'rxiVG15KuRTtYitVvcbHKwvj1kt1') {
      return next(new AppError('Forbidden: Unauthorized administrator access.', 403));
    }

    req.admin = decodedToken;
    next();
  } catch (error) {
    next(new AppError('Unauthorized.', 401));
  }
}
