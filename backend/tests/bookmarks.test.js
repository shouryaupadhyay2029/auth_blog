/* BlogAuth V1 tests/bookmarks.test.js — Bookmarks and Media Integration Tests */
require('./setup');
const request = require('supertest');
const app = require('../app');
const { User, Article, Bookmark, Category } = require('../models');

describe('Bookmarks Endpoints', () => {
  let token;
  let userId;
  let articleId;
  let categoryId;

  beforeAll(async () => {
    await User.deleteMany({});
    await Article.deleteMany({});
    await Bookmark.deleteMany({});
    await Category.deleteMany({});

    // Register user which returns tokens and data directly
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'bookmark_tom',
        email: 'tommy@example.com',
        password: 'Password123!'
      });

    token = regRes.body.token;
    userId = regRes.body.data.user.id;

    const cat = await Category.create({ name: 'Tutorials', slug: 'tutorials' });
    categoryId = cat._id;

    const art = await Article.create({
      title: 'Bookmarks API Article',
      slug: 'bookmarks-api-article',
      content: 'Learning backend development is cool...',
      author: userId,
      category: categoryId,
      status: 'published'
    });
    articleId = art._id.toString();
  });

  it('should toggle bookmark on an article', async () => {
    const res = await request(app)
      .post('/api/v1/bookmarks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        article: articleId
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.isBookmarked).toBe(true);
  });

  it('should retrieve a list of user bookmarks', async () => {
    const res = await request(app)
      .get('/api/v1/bookmarks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookmarks.length).toBeGreaterThan(0);
  });
});
