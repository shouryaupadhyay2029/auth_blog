/* BlogAuth V1 routes/userRoutes.js — User Endpoints Router */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../services/mediaService');

// Upload avatar profile image
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
