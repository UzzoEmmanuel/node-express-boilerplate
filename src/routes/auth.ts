import express, {
  Response,
  Router,
  RequestHandler,
  Request,
  NextFunction,
} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import prisma from '../db';
import { auth } from '../middlewares/auth';
import {
  AuthenticatedRequest,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  ErrorResponse,
  UserResponse,
} from '../types/auth/auth';
import {
  registerValidator,
  loginValidator,
} from '../validators/auth.validator';
import { validateRequest } from '../middlewares/validate';
import {
  createAuthenticationError,
  createNotFoundError,
  AppError,
} from '../utils/AppError';

const router: Router = express.Router();

type AuthRequestHandler<T = any> = RequestHandler<
  Record<string, never>,
  AuthResponse | ErrorResponse,
  T
>;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *           description: Auto-generated ID
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (unique)
 *         password:
 *           type: string
 *           nullable: true
 *           description: Hashed password (null for OAuth users)
 *         name:
 *           type: string
 *           nullable: true
 *           description: User's name
 *         googleId:
 *           type: string
 *           nullable: true
 *           description: Google OAuth ID (unique)
 *         accessToken:
 *           type: string
 *           nullable: true
 *           description: OAuth access token
 *         refreshToken:
 *           type: string
 *           nullable: true
 *           description: OAuth refresh token
 *         tokenExpiry:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: OAuth token expiration date
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       required:
 *         - id
 *         - email
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [fail, error]
 *           description: Error status (fail for 4xx, error for 5xx)
 *         message:
 *           type: string
 *           description: Error message
 *         errors:
 *           type: array
 *           description: Detailed validation errors
 *           items:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *               path:
 *                 type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Must be a valid email address
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Must be at least 6 characters long
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Must be between 2 and 50 characters
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Le mot de passe doit contenir au moins 6 caractères"
 *                       path:
 *                         type: string
 *                         example: "password"
 */

const registerHandler: AuthRequestHandler<RegisterRequest> = async (
  req,
  res,
  next
) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Must be a valid email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password is required
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Email invalide"
 *                       path:
 *                         type: string
 *                         example: "email"
 */

const loginHandler: AuthRequestHandler<LoginRequest> = async (
  req,
  res,
  next
) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new AppError('Invalid credentials', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 400);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

const getMeHandler = async (
  req: AuthenticatedRequest,
  res: Response<UserResponse | ErrorResponse>,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw createAuthenticationError();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    res.json(user as UserResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth2 authentication
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google login
 *
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth2 callback URL
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects with authentication token
 */

// Google routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }) as RequestHandler,
  (async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.redirect('/auth/login?error=Google authentication failed');
      }

      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );

      res.redirect(`/auth/success?token=${token}`);
    } catch {
      res.redirect('/auth/login?error=Something went wrong');
    }
  }) as RequestHandler
);

router.get('/success', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token;
    if (!token) {
      throw new AppError('No token provided', 400);
    }
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

// Local routes
router.post('/register', validateRequest(registerValidator), registerHandler);
router.post('/login', validateRequest(loginValidator), loginHandler);
router.get('/me', auth as RequestHandler, getMeHandler as RequestHandler);

export default router;
