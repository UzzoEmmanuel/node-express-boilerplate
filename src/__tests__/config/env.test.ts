import {
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  NODE_ENV,
  ALLOWED_ORIGINS,
} from '../../config/env';

describe('Environment Configuration', () => {
  it('should have all required environment variables', () => {
    expect(PORT).toBeDefined();
    expect(DATABASE_URL).toBeDefined();
    expect(JWT_SECRET).toBeDefined();
  });

  it('should have correct types for variables', () => {
    expect(typeof PORT).toBe('number');
    expect(typeof DATABASE_URL).toBe('string');
    expect(typeof JWT_SECRET).toBe('string');
  });

  it('should have correct PORT value', () => {
    expect(PORT).toBe(3000);
  });

  it('should have ALLOWED_ORIGINS as array', () => {
    expect(Array.isArray(ALLOWED_ORIGINS)).toBe(true);
    expect(ALLOWED_ORIGINS).toContain('http://localhost:3000');
  });

  it('should have correct NODE_ENV', () => {
    expect(NODE_ENV).toBe('test');
  });
});
