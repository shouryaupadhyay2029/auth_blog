/* BlogAuth V1 config/env.js — Environment Validations */
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables early
dotenv.config({ path: path.join(__dirname, '../.env') });

const REQUIRED_ENV_VARS = ['PORT', 'MONGO_URI', 'JWT_SECRET'];

function validateEnv() {
  const missing = [];
  
  REQUIRED_ENV_VARS.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('──────────────────────────────────────────────────');
    console.error('CRITICAL STARTUP FAILURE: Missing configuration keys');
    console.error(`Missing items: ${missing.join(', ')}`);
    console.error('Please configure your .env file inside backend/ directory.');
    console.error('──────────────────────────────────────────────────');
    process.exit(1);
  }

  // Fallback defaults
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.PORT = process.env.PORT || '5000';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
}

module.exports = {
  validateEnv
};
