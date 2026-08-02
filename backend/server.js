/* BlogAuth V1 server.js — Server Entry Coordinator */

// Capture early startup uncaught crash vectors
process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION SYSTEM CRASH: Shutting down process...');
  console.error(err.name, err.message);
  process.exit(1);
});

const { validateEnv } = require('./config/env');
// Run env asserts validation before importing application packages
validateEnv();

const app = require('./app');
const connectDB = require('./config/db');
// Compile all Mongoose models
require('./models');

// Connect database client
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`BlogAuth Server online in [${process.env.NODE_ENV}] mode on port: ${PORT}`);
});

// Capture unhandled asynchronous rejections (e.g. unhandled Promise rejections)
process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION SYSTEM SHUTDOWN: Closing active servers...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Capture system shutdown flags
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Initiating graceful server close-down...');
  server.close(() => {
    console.log('Server process terminated safely.');
  });
});
