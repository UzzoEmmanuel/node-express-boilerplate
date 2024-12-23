import winston from 'winston';
import path from 'path';
import { NODE_ENV } from '../config/env';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, statusCode } = info;
    return `${timestamp} [${level}] ${
      statusCode ? `(${statusCode})` : ''
    }: ${message}`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
  }),
];

if (NODE_ENV !== 'production') {
  transports.push(new winston.transports.Console());
}

const logger = winston.createLogger({
  level: NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
});

export default logger;
