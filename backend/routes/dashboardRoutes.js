/* BlogAuth V1 routes/dashboardRoutes.js — Dashboard Data Router */
const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Fetch aggregated dashboard workspace details (requires authentication)
router.get('/', protect, dashboardController.getDashboardData);

module.exports = router;
