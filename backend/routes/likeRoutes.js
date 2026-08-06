/* BlogAuth V1 routes/likeRoutes.js — Like Routes Configuration */
const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, likeController.toggleLike);
router.get('/article/:articleId', likeController.getLikesByArticle);

module.exports = router;
