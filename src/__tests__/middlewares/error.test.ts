import { Request, Response } from 'express';
import { errorHandler, notFoundHandler } from '../../middlewares/error';
import { AppError } from '../../utils/AppError';
import { Prisma } from '@prisma/client';
import logger from '../../config/logger';

jest.mock('../../config/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/test',
      body: {},
      query: {},
      originalUrl: '/test',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError('Test error', 400);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Test error',
        errors: [],
      });
      expect(logger.error).toHaveBeenCalledWith(
        'GET /test - Test error',
        expect.objectContaining({
          statusCode: 400,
          error: error,
          requestBody: {},
          requestQuery: {},
        })
      );
    });

    it('should handle Prisma duplicate error', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Duplicate field value',
        { code: 'P2002', clientVersion: '5.0.0' }
      );

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Duplicate field value entered',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle validation errors with details', () => {
      const error = new AppError('Validation Error', 400);
      error.errors = [{ path: 'email', msg: 'Invalid email' }];

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Validation Error',
        errors: [{ path: 'email', msg: 'Invalid email' }],
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should include stack trace in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      error.stack = 'Test stack trace';

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: 'Test stack trace',
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Test error');
      error.stack = 'Test stack trace';

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('notFoundHandler', () => {
    it('should log warning and pass 404 error to next middleware', () => {
      mockRequest.originalUrl = '/unknown-route';

      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(logger.warn).toHaveBeenCalledWith(
        'Route not found: GET /unknown-route',
        {
          statusCode: 404,
          path: '/unknown-route',
          method: 'GET',
        }
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: "Can't find /unknown-route on this server!",
        })
      );
    });
  });
});
