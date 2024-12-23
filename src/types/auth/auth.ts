import { Request } from 'express';
import { Profile } from 'passport-google-oauth20';
import { User } from '@prisma/client';

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Response Types
export interface AuthResponse {
  token: string;
}

export interface ErrorResponse {
  error: string;
}

export interface UserResponse {
  id: number;
  name: string | null;
  email: string;
  googleId?: string | null;
}

// JWT & Passport Types
export interface JwtPayload {
  id: number;
  email: string;
}

export type PassportDone = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  user?: User | false,
  info?: { message: string }
) => void;

export interface GoogleProfile extends Profile {
  emails?: { value: string; verified: boolean }[];
}
