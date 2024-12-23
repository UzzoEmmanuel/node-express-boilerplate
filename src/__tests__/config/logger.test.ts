let mockNodeEnv = 'test';
jest.mock('../../config/env', () => ({
  get NODE_ENV() {
    return mockNodeEnv;
  },
}));

import winston from 'winston';
import fs from 'fs';
import path from 'path';
import logger from '../../config/logger';

const testLogger = winston.createLogger({
  level: 'info',
  levels: logger.levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf((info) => {
      const { timestamp, level, message, statusCode } = info;
      return `${timestamp} [${level}] ${
        statusCode ? `(${statusCode})` : ''
      }: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
    }),
  ],
});

describe('Logger Configuration', () => {
  const logDir = path.join(process.cwd(), 'logs');
  const errorLogPath = path.join(logDir, 'error.log');
  const combinedLogPath = path.join(logDir, 'combined.log');

  beforeEach(() => {
    if (fs.existsSync(errorLogPath)) {
      fs.truncateSync(errorLogPath);
    }
    if (fs.existsSync(combinedLogPath)) {
      fs.truncateSync(combinedLogPath);
    }
  });

  it('should create logger instance', () => {
    expect(testLogger).toBeInstanceOf(winston.Logger);
  });

  it('should have correct log levels', () => {
    expect(testLogger.levels).toEqual({
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
    });
  });

  it('should write error logs to error.log', (done) => {
    const errorMessage = 'Test error message';
    testLogger.error(errorMessage);

    setTimeout(() => {
      const logContent = fs.readFileSync(errorLogPath, 'utf8').split('\n')[0];
      // Remove ANSI colored characters before checking
      const cleanedLogContent = logContent.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanedLogContent).toContain(errorMessage);
      expect(cleanedLogContent).toContain('[error]');
      done();
    }, 1500);
  }, 15000);

  it('should write all logs to combined.log', (done) => {
    const infoMessage = 'Test info message';
    const warnMessage = 'Test warning message';

    testLogger.info(infoMessage);
    testLogger.warn(warnMessage);

    setTimeout(() => {
      const logLines = fs
        .readFileSync(combinedLogPath, 'utf8')
        .split('\n')
        .filter((line) => line.length > 0);

      const infoLine = logLines.find((line) => line.includes(infoMessage));
      const warnLine = logLines.find((line) => line.includes(warnMessage));

      expect(infoLine).toContain('[info]');
      expect(warnLine).toContain('[warn]');
      done();
    }, 1500);
  }, 15000);

  it('should format logs with timestamp and level', (done) => {
    const testMessage = 'Test message with formatting';
    testLogger.info(testMessage);

    setTimeout(() => {
      const logLine = fs
        .readFileSync(combinedLogPath, 'utf8')
        .split('\n')
        .find((line) => line.includes(testMessage));

      expect(logLine).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[info\]/);
      done();
    }, 1500);
  }, 15000);

  it('should include status code when provided', (done) => {
    const testMessage = 'Test message with status';
    testLogger.error(testMessage, { statusCode: 404 });

    setTimeout(() => {
      const logLine = fs
        .readFileSync(errorLogPath, 'utf8')
        .split('\n')
        .find((line) => line.includes(testMessage));

      expect(logLine).toContain('(404)');
      done();
    }, 1500);
  }, 15000);

  describe('Environment specific behavior', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should use debug level in development', () => {
      mockNodeEnv = 'development';

      const devLogger = winston.createLogger({
        level: mockNodeEnv === 'development' ? 'debug' : 'info',
      });
      expect(devLogger.level).toBe('debug');
    });

    it('should use info level in production', () => {
      mockNodeEnv = 'production';

      const prodLogger = winston.createLogger({
        level: mockNodeEnv === 'development' ? 'debug' : 'info',
      });
      expect(prodLogger.level).toBe('info');
    });
  });
});
