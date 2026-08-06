/* BlogAuth V1 tests/auth.test.js — Auth Integration Tests */
require('./setup');
const request = require('supertest');
const app = require('../app');
const { User, Session } = require('../models');

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'john_doe',
        email: 'john@example.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(219);
    expect(res.body.success).toBe(true);

    const user = await User.findOne({ email: 'john@example.com' });
    expect(user).toBeDefined();
    expect(user.username).toBe('john_doe');
  });

  it('should not register user with existing email', async () => {
    await User.create({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'hashedpassword'
    });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'john2',
        email: 'john@example.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(400);
  });

  it('should log in a registered user and return a token', async () => {
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'login_tester',
        email: 'login@example.com',
        password: 'Password123!'
      });

    expect(registerRes.statusCode).toBe(219);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@example.com',
        password: 'Password123!'
      });

    if (loginRes.statusCode !== 200) {
      console.log('Login failed body:', loginRes.body);
    }

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.token).toBeDefined();
  });

  it('should fetch the profile of the logged-in user', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'johnny',
        email: 'johnny@example.com',
        password: 'Password123!'
      });

    expect(regRes.statusCode).toBe(219);

    const token = regRes.body.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.data.user.username).toBe('johnny');
  });
});
