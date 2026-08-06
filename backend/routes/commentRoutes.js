/* BlogAuth V1 routes/commentRoutes.js — Comment Routes Configuration */
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, commentController.createComment);
router.get('/article/:articleId', commentController.getCommentsByArticle);
router.delete('/:id', protect, commentController.deleteComment);

module.exports = router;
