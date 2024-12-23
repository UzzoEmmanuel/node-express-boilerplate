import { config } from 'dotenv';
import path from 'path';

// Load the appropriate .env file according to the environment
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({ path: path.resolve(process.cwd(), envFile) });

// Checks for required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`La variable d'environnement ${envVar} est requise`);
  }
});

// Environment variables with their initial values
const envVars = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
  ],
};

// Export individual variables
export const {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  ALLOWED_ORIGINS,
} = envVars;
