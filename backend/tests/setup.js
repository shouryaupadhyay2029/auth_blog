/* BlogAuth V1 tests/setup.js — Global Test Setup & DB Coordinator */
const mongoose = require('mongoose');

// Point to test database on Atlas to avoid polluting development collections
const testMongoUri = 'mongodb+srv://upadhyayshourya352_dbuser:shouryaprojectPlacement0718@suplacement.qfdxoap.mongodb.net/blogAuth_test';

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
