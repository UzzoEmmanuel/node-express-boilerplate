export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  errors?: any[];

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = [];

    Error.captureStackTrace(this, this.constructor);
  }
}

// common error creation helper functions
export const createNotFoundError = (resource: string) =>
  new AppError(`${resource} not found`, 404);

export const createValidationError = (message: string) =>
  new AppError(message, 400);

export const createAuthenticationError = (
  message: string = 'Not authenticated'
) => new AppError(message, 401);

export const createForbiddenError = (message: string = 'Not authorized') =>
  new AppError(message, 403);
