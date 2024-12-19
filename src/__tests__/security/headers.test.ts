import request from 'supertest';
import app from '../../app';

describe('Security Headers', () => {
  it('should have CORS headers', async () => {
    const response = await request(app)
      .get('/auth/me')
      .set('Origin', 'http://localhost:3000');

    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000'
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should have security headers from Helmet', async () => {
    const response = await request(app).get('/auth/me');

    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['strict-transport-security']).toBeDefined();
    expect(response.headers['x-xss-protection']).toBeDefined();
  });

  it('should allow configured HTTP methods', async () => {
    const response = await request(app)
      .options('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST');

    expect(response.headers['access-control-allow-methods']).toBe(
      'GET,POST,PUT,DELETE,PATCH'
    );
  });
});
