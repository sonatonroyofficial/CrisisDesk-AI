import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { successResponse } from '../utils/ApiResponse';
import { AppError } from '../middlewares/errorHandler';

// POST /api/admin/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError('Username and password are required.', 400);
    }

    if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
      throw new AppError('Unauthorized.', 401);
    }

    // Generate signed JWT
    const token = jwt.sign(
      { username: env.ADMIN_USERNAME, role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json(successResponse({ token }));
  } catch (error) {
    next(error);
  }
}
export default login;
