import { env } from '../../config/env';

describe('Environment Configuration', () => {
  it('should have all required environment variables', () => {
    expect(env.PORT).toBeDefined();
    expect(env.DATABASE_URL).toBeDefined();
    expect(env.JWT_SECRET).toBeDefined();
  });

  it('should have correct types for variables', () => {
    expect(typeof env.PORT).toBe('number');
    expect(typeof env.DATABASE_URL).toBe('string');
    expect(typeof env.JWT_SECRET).toBe('string');
  });

  it('should have correct PORT value', () => {
    expect(env.PORT).toBe(3000);
  });

  it('should have ALLOWED_ORIGINS as array', () => {
    expect(Array.isArray(env.ALLOWED_ORIGINS)).toBe(true);
    expect(env.ALLOWED_ORIGINS).toContain('http://localhost:3000');
  });

  it('should have correct NODE_ENV', () => {
    expect(env.NODE_ENV).toBe('test');
  });
});
