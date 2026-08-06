/* BlogAuth V1 config/db.js — MongoDB Client Manager */
const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

async function connectDB() {
  const connUri = process.env.MONGO_URI;

  try {
    const conn = await mongoose.connect(connUri);
    logger.info(`MongoDB connection established: ${conn.connection.host}`);
    
    // Wire up connection event handlers
    mongoose.connection.on('error', err => {
      logger.error(`MongoDB persistent connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Reconnecting client...');
    });
  } catch (error) {
    logger.error(`CRITICAL: MongoDB connection startup failed: ${error.message}`);
    process.exit(1);
  }
}

async function closeDB() {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully.');
  } catch (error) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
  }
}

module.exports = {
  connectDB,
  closeDB
};

