import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { Prisma } from '@prisma/client';
import { ErrorResponse } from '../types/error/error';
import logger from '../config/logger';
import { NODE_ENV } from '../config/env';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  const response: ErrorResponse = {
    status: 'error',
    message: 'Internal server error',
  };

  // AppError handling
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.status = err.status;
    response.message = err.message;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any).errors) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.errors = (err as any).errors;
    }
  }

  // Prisma Error Handling
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    switch (err.code) {
      case 'P2002':
        response.message = 'Duplicate field value entered';
        break;
      default:
        response.message = 'Database error';
    }
  }

  // Errors logs
  logger.error(`${req.method} ${req.url} - ${response.message}`, {
    statusCode,
    error: err,
    requestBody: req.body,
    requestQuery: req.query,
  });

  // Add stack trace in development
  if (NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
    statusCode: 404,
    path: req.originalUrl,
    method: req.method,
  });

  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(error);
};
