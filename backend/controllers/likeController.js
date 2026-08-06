/* BlogAuth V1 controllers/likeController.js — Like Operations Controller */
const { Like, Article, Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Toggle like status for an article
 */
const toggleLike = catchAsync(async (req, res, next) => {
  const { article: articleId } = req.body;
  const userId = req.user.id;

  if (!articleId) {
    return next(new AppError('Article ID is required.', 400));
  }

  const articleObj = await Article.findById(articleId);
  if (!articleObj) {
    return next(new AppError('Article not found.', 404));
  }

  const existingLike = await Like.findOne({ user: userId, article: articleId });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    
    // Decrement likes count on Article
    articleObj.likesCount = Math.max(0, (articleObj.likesCount || 0) - 1);
    await articleObj.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'Article unliked.',
      isLiked: false,
      likesCount: articleObj.likesCount
    });
  }

  const like = await Like.create({ user: userId, article: articleId });
  
  // Increment likes count on Article
  articleObj.likesCount = (articleObj.likesCount || 0) + 1;
  await articleObj.save({ validateBeforeSave: false });

  // Create notification for the author (if someone else liked)
  if (articleObj.author.toString() !== userId.toString()) {
    await Notification.create({
      recipient: articleObj.author,
      sender: userId,
      type: 'like',
      article: articleId,
      message: `${req.user.username} liked your article: "${articleObj.title}"`
    });
  }

  res.status(201).json({
    success: true,
    message: 'Article liked.',
    isLiked: true,
    likesCount: articleObj.likesCount,
    data: { like }
  });
});

/**
 * Get like status and list for a specific article
 */
const getLikesByArticle = catchAsync(async (req, res, next) => {
  const { articleId } = req.params;

  const likes = await Like.find({ article: articleId })
    .populate('user', 'username email avatar')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: likes.length,
    data: { likes }
  });
});

module.exports = {
  toggleLike,
  getLikesByArticle
};
