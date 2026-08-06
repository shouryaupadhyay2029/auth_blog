/* BlogAuth V1 tests/setup.js — Global Test Setup & DB Coordinator */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Construct test database URI dynamically from dev URI to avoid hardcoding credentials
const devUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogAuth';
const testMongoUri = process.env.MONGO_URI_TEST || 
  (devUri.includes('?') 
    ? devUri.replace(/\/blogAuth\?/, '/blogAuth_test?') 
    : devUri.replace(/\/blogAuth$/, '/blogAuth_test')
  );

beforeAll(async () => {
  process.env.MONGO_URI = testMongoUri;
  process.env.JWT_SECRET = 'test-secret-key-123';
  process.env.NODE_ENV = 'test';

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testMongoUri);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    // Drop test database to keep things clean
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  }
});
