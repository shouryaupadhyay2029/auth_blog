/* BlogAuth V1 tests/admin.test.js — Admin Integration Tests */
require('./setup');
const request = require('supertest');
const app = require('../app');
const { User } = require('../models');

describe('Admin Endpoints', () => {
  let adminToken;
  let readerToken;
  let readerUserId;

  beforeAll(async () => {
    await User.deleteMany({});

    // Register reader user directly
    const readerReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'normal_reader',
        email: 'reader@example.com',
        password: 'Password123!'
      });

    readerToken = readerReg.body.token;
    readerUserId = readerReg.body.data.user.id;

    // Register admin user directly
    const adminReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'super_admin',
        email: 'admin@example.com',
        password: 'Password123!'
      });

    adminToken = adminReg.body.token;

    // Elevate admin user to admin since register defaults to reader/writer
    await User.updateOne({ email: 'admin@example.com' }, { role: 'admin' });

    // Since token is signed with the user's role at the time of creation (which was 'user'),
    // we need to re-login the admin to get a token with 'admin' role payload.
    // To prevent duplicate key session error in the same second, we delete the session first!
    const { Session } = require('../models');
    await Session.deleteMany({});

    const logRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Password123!'
      });

    adminToken = logRes.body.token;
  });

  it('should block non-admin users from listing users', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${readerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('should allow admin users to list all registered users', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users.length).toBeGreaterThan(0);
  });

  it('should allow admin users to elevate a reader role to writer', async () => {
    const res = await request(app)
      .put(`/api/v1/admin/users/${readerUserId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        role: 'writer'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('writer');
  });
});
