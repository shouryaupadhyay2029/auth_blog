/* BlogAuth V1 routes/articleRoutes.js — Article Endpoints Router */
const express = require('express');
const router = express.Router();

const articleController = require('../controllers/articleController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const {
  validateCreateArticle,
  validateUpdateArticle
} = require('../validators/articleValidator');

// List articles (supports pagination, sorting, status/category filtering)
// Optional protection allows logged-in authors to query their drafts
router.get('/', optionalProtect, articleController.list);

// Full-text search (only queries published posts)
router.get('/search', articleController.search);

// Get single article by ID (increments views; optionally checks token for drafts)
router.get('/:id', optionalProtect, articleController.getById);

// Create new Article / Save Draft (requires auth)
router.post('/', protect, validateCreateArticle, articleController.create);

// Update existing Article (requires auth + author checks)
router.put('/:id', protect, validateUpdateArticle, articleController.update);

// Delete existing Article (requires auth + author checks)
router.delete('/:id', protect, articleController.deleteArticle);

module.exports = router;
