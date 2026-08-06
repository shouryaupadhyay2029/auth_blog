/* BlogAuth V1 routes/bookmarkRoutes.js — Bookmark Routes Configuration */
const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All bookmark endpoints require login

router.post('/', bookmarkController.toggleBookmark);
router.get('/', bookmarkController.getMyBookmarks);
router.delete('/:articleId', bookmarkController.deleteBookmarkByArticle);

module.exports = router;
