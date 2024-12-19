import { AppError } from '../../utils/AppError';

describe('AppError', () => {
  it('should create an error with status and statusCode', () => {
    const error = new AppError('Test error', 400);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
    expect(error.message).toBe('Test error');
  });

  it('should set status to "error" for 500 level errors', () => {
    const error = new AppError('Server error', 500);

    expect(error.status).toBe('error');
  });
});
