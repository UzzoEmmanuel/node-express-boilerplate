import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/auth/auth';
import prisma from '../db';
import logger from '../config/logger';
import { AppError } from '../utils/AppError';
import { JWT_SECRET } from '../config/env';

export const auth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      logger.warn(
        `Authentication failed: No token provided - ${req.method} ${req.url}`
      );
      throw new AppError('Authentication required', 401);
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as {
        id: number;
        email: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        logger.warn(
          `Authentication failed: User not found - ${req.method} ${req.url}`
        );
        throw new AppError('Authentication failed', 401);
      }

      req.user = user;
      next();
    } catch {
      logger.warn(
        `Authentication failed: Invalid token - ${req.method} ${req.url}`
      );
      throw new AppError('Authentication failed', 401);
    }
  } catch (error) {
    next(error);
  }
};
