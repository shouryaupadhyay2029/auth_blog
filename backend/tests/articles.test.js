/* BlogAuth V1 tests/articles.test.js — Article Workflow Integration Tests */
require('./setup');
const request = require('supertest');
const app = require('../app');
const { Article, User, Category } = require('../models');

describe('Articles Endpoints', () => {
  let token;
  let userId;
  let categoryId;

  beforeAll(async () => {
    await User.deleteMany({});
    await Article.deleteMany({});
    await Category.deleteMany({});

    // Register user which returns tokens and data directly
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'writer_bob',
        email: 'bob@example.com',
        password: 'Password123!'
      });

    token = regRes.body.token;
    userId = regRes.body.data.user.id;

    // Create a mock category
    const cat = await Category.create({ name: 'Technology', slug: 'technology' });
    categoryId = cat._id.toString();
  });

  it('should create an article draft successfully', async () => {
    const res = await request(app)
      .post('/api/v1/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Jest Testing Guide',
        content: 'This is body content of jest tests.',
        category: categoryId
      });

    expect([200, 201, 219]).toContain(res.statusCode);
    expect(res.body.success).toBe(true);
    expect(res.body.data.article.title).toBe('Jest Testing Guide');
  });

  it('should list articles with public visibility', async () => {
    // Make sure we have a published article to list
    const art = await Article.create({
      title: 'Published Jest Article',
      slug: 'published-jest-article',
      content: 'Some details here...',
      author: userId,
      category: categoryId,
      status: 'published',
      visibility: 'public'
    });

    const res = await request(app).get('/api/v1/articles');

    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBeDefined();
    expect(res.body.results.length).toBeGreaterThan(0);
  });
});
