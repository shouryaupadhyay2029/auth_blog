/* BlogAuth V1 routes/articleRoutes.js — Article Endpoints Router */
const express = require('express');
const router = express.Router();

const articleController = require('../controllers/articleController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { upload } = require('../services/mediaService');
const {
  validateCreateArticle,
  validateUpdateArticle
} = require('../validators/articleValidator');

// List articles (supports pagination, sorting, status/category filtering)
// Optional protection allows logged-in authors to query their drafts
router.get('/', optionalProtect, articleController.list);

// Full-text search (only queries published posts)
router.get('/search', articleController.search);

// View unpublished article using preview token
router.get('/preview/:token', articleController.previewArticle);

// Get single article by ID (increments views; optionally checks token for drafts)
router.get('/:id', optionalProtect, articleController.getById);

// Create new Article / Save Draft (requires auth)
router.post('/', protect, validateCreateArticle, articleController.create);

// Update existing Article (requires auth + author checks)
router.put('/:id', protect, validateUpdateArticle, articleController.update);

// Delete existing Article (requires auth + author checks)
router.delete('/:id', protect, articleController.deleteArticle);

// --- Editorial Studio Extended Endpoints ---

// Duplicate an article
router.post('/:id/duplicate', protect, articleController.duplicate);

// Archive article
router.post('/:id/archive', protect, articleController.archive);

// Restore archived article to draft
router.post('/:id/restore', protect, articleController.restore);

// Submit draft for review
router.post('/:id/review', protect, articleController.submitForReview);

// Publish article immediately
router.post('/:id/publish', protect, articleController.publish);

// Schedule publishing
router.post('/:id/schedule', protect, articleController.schedule);

// Autosave endpoint (Optimistic locking conflict protection)
router.post('/:id/autosave', protect, articleController.autosave);

// Generate private preview token
router.post('/:id/preview', protect, articleController.generatePreviewToken);

// Version history list
router.get('/:id/versions', protect, articleController.listVersions);

// Restore specific version
router.post('/:id/versions/:versionId/restore', protect, articleController.restoreVersion);

// Upload cover image directly to article
router.post('/:id/cover', protect, upload.single('image'), articleController.uploadCoverImage);

module.exports = router;
