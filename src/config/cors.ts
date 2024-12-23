import { CorsOptions } from 'cors';
import { NODE_ENV, ALLOWED_ORIGINS } from '../config/env';

const corsOptions: CorsOptions = {
  origin: NODE_ENV === 'production' ? ALLOWED_ORIGINS : true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],

  // Allowed headers
  allowedHeaders: ['Content-Type', 'Authorization'],

  // Allows sending of cookies
  credentials: true,

  // Duration of pre-flight results caching
  maxAge: 86400, // 24 hours

  // Headers exposed to the client
  exposedHeaders: ['X-Total-Count'],
};

export default corsOptions;
