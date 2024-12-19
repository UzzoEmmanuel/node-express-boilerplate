import express from 'express';
import passport from 'passport';
import helmetConfig from './config/helmet';
import cors from 'cors';
import corsOptions from './config/cors';
import swaggerUi from 'swagger-ui-express';
import specs from './docs/swagger';
import authRoutes from './routes/auth';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error';
import morganMiddleware from './middlewares/morgan';
import logger from './config/logger';

const app = express();
const port = env.PORT;

// Security Middlewares
app.use(helmetConfig);
app.use(cors(corsOptions));

// Logging middleware
app.use(morganMiddleware);

// Others middlewares
app.use(express.json());
app.use(passport.initialize());

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/auth', authRoutes);

// Error handling
app.all('*', notFoundHandler);
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
  });
}

export default app;
