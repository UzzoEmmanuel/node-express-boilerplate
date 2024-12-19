/// <reference types="jest" />
import request from 'supertest';
import app from '../../app';
import prisma from '../../db';
import { Server } from 'http';

describe('Auth Routes', () => {
  let server: Server;

  beforeAll(() => {
    server = app.listen(0); // Random port for testing
  });

  // Clean the base before each test
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany(); // Final cleaning of the base
    await prisma.$disconnect(); // Disconnect from Prisma
    server.close(); // Server shutdown
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');

      // Check that the user is in the database
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });
      expect(user).toBeTruthy();
      expect(user?.name).toBe('Test User');
    });

    it('should return validation error for invalid email', async () => {
      const response = await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return error for existing email', async () => {
      // First create a user
      await request(app).post('/auth/register').send({
        name: 'First User',
        email: 'test@example.com',
        password: 'password123',
      });

      // Try to create another user with the same email
      const response = await request(app).post('/auth/register').send({
        name: 'Second User',
        email: 'test@example.com',
        password: 'password456',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    it('should return error for password too short', async () => {
      const response = await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123', // Password too short
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'password',
            msg: 'Le mot de passe doit contenir au moins 6 caractères',
          }),
        ])
      );
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app).post('/auth/register').send({
        name: 'Test User',
        // email and password missing
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'email' }),
          expect.objectContaining({ path: 'password' }),
        ])
      );
    });

    it('should handle empty request body', async () => {
      const response = await request(app).post('/auth/register').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a user for testing
      await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /auth/me', () => {
    let token: string;

    beforeEach(async () => {
      // Create a user and get the token
      const response = await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      token = response.body.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).not.toHaveProperty('password'); // Check that the password is not returned
    });

    it('should fail with no token provided', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty(
        'message',
        'Authentication required'
      );
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Authentication failed');
    });
  });
});
