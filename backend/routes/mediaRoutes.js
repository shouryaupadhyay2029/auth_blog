/* BlogAuth V1 routes/mediaRoutes.js — Media Endpoints Router */
const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../services/mediaService');

// Upload cover image
router.post('/upload-cover', protect, upload.single('image'), mediaController.uploadCover);

// Upload inline writing images
router.post('/upload-inline', protect, upload.single('image'), mediaController.uploadInline);

// Get list of user uploads
router.get('/', protect, mediaController.listMedia);

// Delete user upload
router.delete('/:id', protect, mediaController.deleteMedia);

// Garbage collection cleanup orphaned uploads manually
router.post('/cleanup', protect, mediaController.cleanup);

module.exports = router;
