import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { AppError } from '../utils/AppError';

export const validateRequest = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const validationError = new AppError('Validation Error', 400);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (validationError as any).errors = errors.array();
    next(validationError);
  };
};
