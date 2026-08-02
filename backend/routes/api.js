/* BlogAuth V1 routes/api.js — API Endpoint Router */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const authRoutes = require('./authRoutes');

// Uptime health checks
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BlogAuth systems operational.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const articleRoutes = require('./articleRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Authentication Routes
router.use('/auth', authRoutes);

// Article Management Routes
router.use('/posts', articleRoutes);

// Dashboard Metrics Routes
router.use('/dashboard', dashboardRoutes);

router.get('/categories', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Simulated endpoint: fetch taxonomy data active.'
  });
});

module.exports = router;
