/* BlogAuth V1 tests/dashboard.test.js — Dashboard Integration Tests */
require('./setup');
const request = require('supertest');
const app = require('../app');
const { User } = require('../models');

describe('Dashboard Endpoint', () => {
  let token;

  beforeAll(async () => {
    await User.deleteMany({});

    // Register user which returns token directly
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'dash_user',
        email: 'dash@example.com',
        password: 'Password123!'
      });

    token = regRes.body.token;
  });

  it('should fetch user specific dashboard stats', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile).toBeDefined();
    expect(res.body.publishedCount).toBeDefined();
  });
});
