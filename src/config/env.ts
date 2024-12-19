import { config } from 'dotenv';
import path from 'path';

// Load the appropriate .env file according to the environment
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({ path: path.resolve(process.cwd(), envFile) });

// Checks for required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];

// Check that all required variables are defined
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`La variable d'environnement ${envVar} est requise`);
  }
});

// Export typed variables
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
  ],
};
