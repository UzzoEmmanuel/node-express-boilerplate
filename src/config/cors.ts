import { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',')
      : true,

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
