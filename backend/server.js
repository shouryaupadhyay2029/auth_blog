const { logger } = require('./utils/logger');

// Capture early startup uncaught crash vectors
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION SYSTEM CRASH: Shutting down process...', err);
  process.exit(1);
});

const { validateEnv } = require('./config/env');
// Run env asserts validation before importing application packages
validateEnv();

const app = require('./app');
const { connectDB, closeDB } = require('./config/db');
const schedulerService = require('./services/schedulerService');

// Compile all Mongoose models
require('./models');

// Connect database client and start background jobs
connectDB().then(() => {
  schedulerService.startScheduler();
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`BlogAuth Server online in [${process.env.NODE_ENV}] mode on port: ${PORT}`);
});

// Capture unhandled asynchronous rejections (e.g. unhandled Promise rejections)
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION SYSTEM SHUTDOWN: Closing active servers...', err);
  server.close(async () => {
    await closeDB();
    process.exit(1);
  });
});

// Helper for graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received. Initiating graceful server close-down...`);
  schedulerService.stopScheduler();
  server.close(async () => {
    await closeDB();
    logger.info('Server process terminated safely.');
    process.exit(0);
  });
};

// Capture system shutdown flags
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

