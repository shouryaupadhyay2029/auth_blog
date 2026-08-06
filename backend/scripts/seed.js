/* BlogAuth V1 scripts/seed.js — Production Sandboxing Database Seeder */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const {
  User,
  Category,
  Tag,
  Article,
  Comment,
  Bookmark,
  Like,
  Notification,
  Session
} = require('../models');

// Load environment configuration
dotenv.config({ path: path.join(__dirname, '../.env') });

const categoriesData = [
  { name: 'Technology', description: 'Tech trends, software developments, engineering guides.', icon: 'tech-icon' },
  { name: 'Health & Wellness', description: 'Tips and logs for healthy physical and mental lifestyle.', icon: 'health-icon' },
  { name: 'Business & Finance', description: 'Entrepreneurship, economic indicators, startup operations.', icon: 'business-icon' },
  { name: 'Lifestyle', description: 'Travel details, food recipes, fashion statements.', icon: 'lifestyle-icon' },
  { name: 'Science & Cosmos', description: 'Discoveries, physics theories, cosmic logs.', icon: 'science-icon' }
];

const tagsData = [
  { name: 'javascript' },
  { name: 'node' },
  { name: 'websec' },
  { name: 'fitness' },
  { name: 'nutrition' },
  { name: 'investing' },
  { name: 'startup' },
  { name: 'travel' },
  { name: 'physics' },
  { name: 'astronomy' }
];

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Database connected. Clearing existing collections...');

  await User.deleteMany({});
  await Category.deleteMany({});
  await Tag.deleteMany({});
  await Article.deleteMany({});
  await Comment.deleteMany({});
  await Bookmark.deleteMany({});
  await Like.deleteMany({});
  await Notification.deleteMany({});
  await Session.deleteMany({});

  console.log('Seeding categories and tags...');
  const categories = await Category.create(categoriesData);
  const tags = await Tag.create(tagsData);

  console.log('Seeding users (1 Admin, 3 Authors/Writers, 5 Readers/Users)...');
  // Seed Admin
  const admin = await User.create({
    username: 'admin_boss',
    email: 'admin@blogauth.com',
    password: 'Password123!',
    role: 'admin',
    isVerified: true,
    bio: 'Root system administrator.'
  });

  // Seed Authors (role: writer)
  const authors = [];
  for (let i = 1; i <= 3; i++) {
    const author = await User.create({
      username: `author_writer_${i}`,
      email: `author${i}@blogauth.com`,
      password: 'Password123!',
      role: 'writer',
      isVerified: true,
      bio: `Professional content producer number ${i}.`
    });
    authors.push(author);
  }

  // Seed Readers (role: user)
  const readers = [];
  for (let i = 1; i <= 5; i++) {
    const reader = await User.create({
      username: `reader_user_${i}`,
      email: `reader${i}@blogauth.com`,
      password: 'Password123!',
      role: 'user',
      isVerified: true,
      bio: `Avid blog reader number ${i}.`
    });
    readers.push(reader);
  }

  console.log('Seeding 25 articles...');
  const articles = [];
  const titles = [
    'Exploring Async Hooks in Node.js', 'Introduction to JWT Security Checks',
    'Securing Express Servers with Helmet Headers', 'Modern JavaScript Array Techniques',
    'Docker Compose for Dev Workflows', 'Understanding NoSQL Injection Attacks',
    'A Guide to Clean Architecture in JS', 'Testing API Endpoints with Supertest',
    'Daily Cardio Workouts for Busy Writers', 'Building Core Muscle Groups Safely',
    'Superfoods to Maximize Coding Focus', 'The Science of Rapid Eye Movement Sleep',
    'Startup Funding Lifecycles Explained', 'Evaluating SaaS Metrics for Beginners',
    'Investing Strategies for Bull Markets', 'Remote Work Team Management Guides',
    'Top 10 Hidden Backpacker Destinations', 'Minimalist Packing Tips for Long Travel',
    'A Culinary Tour of Tokyo Side Streets', 'A Beginners Guide to Digital Journaling',
    'Understanding Quantum Entanglement Basics', 'The Evolution of Modern Space Telescopes',
    'Black Hole Event Horizons Explained', 'Exploring Dark Matter Clues in Cosmic Webs',
    'Building Reusable API Integration Suites'
  ];

  for (let i = 0; i < 25; i++) {
    const author = authors[i % authors.length];
    const category = categories[i % categories.length];
    // Assign 2 random tags
    const tag1 = tags[i % tags.length];
    const tag2 = tags[(i + 3) % tags.length];

    const title = titles[i];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const article = await Article.create({
      title,
      slug,
      subtitle: `Subtitle overview detailing "${title}" topic.`,
      content: `This is a comprehensive, production-sandbox article talking about ${title}. We detail its architecture, history, operational steps, and standard engineering guidelines. It is fully formatted and verified.`,
      excerpt: `Brief excerpt overview for ${title}.`,
      author: author._id,
      category: category._id,
      tags: [tag1._id, tag2._id],
      status: i < 22 ? 'published' : 'draft', // 22 published, 3 drafts
      visibility: 'public',
      views: Math.floor(Math.random() * 500) + 10,
      likesCount: 0,
      allowComments: true
    });
    articles.push(article);
  }

  console.log('Seeding comments, bookmarks, and likes...');
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    if (article.status !== 'published') continue;

    // Seed 1-3 comments per published article
    const numComments = Math.floor(Math.random() * 3) + 1;
    for (let c = 0; c < numComments; c++) {
      const commenter = readers[(i + c) % readers.length];
      await Comment.create({
        user: commenter._id,
        article: article._id,
        content: `Very insightful article! I particularly like the sections discussing technical implications.`
      });
    }

    // Seed 1-2 likes per article
    const numLikes = Math.floor(Math.random() * 2) + 1;
    for (let l = 0; l < numLikes; l++) {
      const liker = readers[(i + l + 1) % readers.length];
      await Like.create({
        user: liker._id,
        article: article._id
      });
      article.likesCount += 1;
    }
    await article.save();

    // Seed bookmarks (readers bookmarking random articles)
    if (i % 2 === 0) {
      const bookmarker = readers[i % readers.length];
      await Bookmark.create({
        user: bookmarker._id,
        article: article._id
      });
    }

    // Seed notifications (sent to authors when their posts get liked/commented)
    await Notification.create({
      recipient: article.author,
      sender: readers[i % readers.length]._id,
      type: 'like',
      article: article._id,
      message: `Your article "${article.title}" received a new like.`
    });
  }

  console.log('Database seeded successfully!');
  await mongoose.connection.close();
  console.log('Database connection closed.');
}

seed().catch(err => {
  console.error('Seeding process encountered an error:', err);
  mongoose.connection.close();
});
