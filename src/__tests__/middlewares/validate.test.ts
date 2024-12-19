import { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../../middlewares/validate';
import { AppError } from '../../utils/AppError';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  const testValidation = [
    body('email').isEmail().withMessage('Email invalide'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Mot de passe trop court'),
  ];

  it('should pass validation with correct data', async () => {
    mockRequest.body = {
      email: 'test@example.com',
      password: 'password123',
    };

    await validateRequest(testValidation)(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should pass validation error to next for invalid email', async () => {
    mockRequest.body = {
      email: 'invalid-email',
      password: 'password123',
    };

    await validateRequest(testValidation)(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));

    const error = nextFunction.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Validation Error');
    expect(error.errors).toContainEqual(
      expect.objectContaining({
        path: 'email',
        msg: 'Email invalide',
      })
    );
  });

  it('should pass validation error to next for short password', async () => {
    mockRequest.body = {
      email: 'test@example.com',
      password: '123',
    };

    await validateRequest(testValidation)(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));

    const error = nextFunction.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Validation Error');
    expect(error.errors).toContainEqual(
      expect.objectContaining({
        path: 'password',
        msg: 'Mot de passe trop court',
      })
    );
  });

  it('should handle multiple validation errors', async () => {
    mockRequest.body = {
      email: 'invalid-email',
      password: '123',
    };

    await validateRequest(testValidation)(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));

    const error = nextFunction.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Validation Error');
    expect(error.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'email' }),
        expect.objectContaining({ path: 'password' }),
      ])
    );
  });
});
