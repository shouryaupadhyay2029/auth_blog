/* BlogAuth V1 routes/notificationRoutes.js — Notification Routes Configuration */
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All notification endpoints require login

router.get('/', notificationController.getMyNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;
