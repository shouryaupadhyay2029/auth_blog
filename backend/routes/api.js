/* BlogAuth V1 routes/api.js — API Endpoint Router */
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const articleRoutes = require('./articleRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const mediaRoutes = require('./mediaRoutes');
const userRoutes = require('./userRoutes');
const commentRoutes = require('./commentRoutes');
const bookmarkRoutes = require('./bookmarkRoutes');
const likeRoutes = require('./likeRoutes');
const notificationRoutes = require('./notificationRoutes');
const reportRoutes = require('./reportRoutes');
const adminRoutes = require('./adminRoutes');

const categoryController = require('../controllers/categoryController');
const tagController = require('../controllers/tagController');
const { protect } = require('../middleware/authMiddleware');

// Uptime health checks
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BlogAuth systems operational.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication Routes
router.use('/auth', authRoutes);

// User Operations Routes
router.use('/users', userRoutes);

// Article Management Routes (Support both /posts and /articles for frontend compatibility)
router.use('/posts', articleRoutes);
router.use('/articles', articleRoutes);

// Dashboard Metrics Routes
router.use('/dashboard', dashboardRoutes);

// Media Upload Routes
router.use('/media', mediaRoutes);

// Community & Admin Routes
router.use('/comments', commentRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/likes', likeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

// Taxonomy: Categories Endpoints
router.get('/categories', categoryController.listCategories);

// Taxonomy: Tags Endpoints
router.get('/tags', tagController.searchTags);
router.post('/tags', protect, tagController.createTag);

module.exports = router;
