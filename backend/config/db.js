/* BlogAuth V1 config/db.js — MongoDB Client Manager */
const mongoose = require('mongoose');

async function connectDB() {
  const connUri = process.env.MONGO_URI;

  try {
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB connection established: ${conn.connection.host}`);
    
    // Wire up connection event handlers
    mongoose.connection.on('error', err => {
      console.error(`MongoDB persistent connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection lost. Reconnecting client...');
    });
  } catch (error) {
    console.error(`CRITICAL: MongoDB connection startup failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
