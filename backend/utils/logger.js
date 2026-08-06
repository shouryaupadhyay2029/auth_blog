/* BlogAuth V1 utils/logger.js — Winston Production Logging Setup */
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logDirectory = path.join(__dirname, '../logs');

// Define log level styling & formatting
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(
    info => `[${info.timestamp}] ${info.level}: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
  )
);

// Define Logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: { service: 'blogauth-service' },
  transports: [
    // Write all logs with level 'error' and below to error-%DATE%.log
    new DailyRotateFile({
      filename: path.join(logDirectory, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error'
    }),
    // Write all logs with level 'info' and below to combined-%DATE%.log
    new DailyRotateFile({
      filename: path.join(logDirectory, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// If in development mode, log to the Console with colored format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

// Dedicated transport log for API HTTP requests
const requestLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: path.join(logDirectory, 'request-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

module.exports = {
  logger,
  requestLogger
};
