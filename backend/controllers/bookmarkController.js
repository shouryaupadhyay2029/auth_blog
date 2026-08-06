/* BlogAuth V1 controllers/bookmarkController.js — Bookmark Operations Controller */
const { Bookmark, Article } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Toggle bookmark status for an article
 */
const toggleBookmark = catchAsync(async (req, res, next) => {
  const { article: articleId } = req.body;
  const userId = req.user.id;

  if (!articleId) {
    return next(new AppError('Article ID is required.', 400));
  }

  const articleObj = await Article.findById(articleId);
  if (!articleObj) {
    return next(new AppError('Article not found.', 404));
  }

  const existingBookmark = await Bookmark.findOne({ user: userId, article: articleId });

  if (existingBookmark) {
    await Bookmark.deleteOne({ _id: existingBookmark._id });
    return res.status(200).json({
      success: true,
      message: 'Article removed from bookmarks.',
      isBookmarked: false
    });
  }

  const bookmark = await Bookmark.create({ user: userId, article: articleId });

  res.status(201).json({
    success: true,
    message: 'Article added to bookmarks.',
    isBookmarked: true,
    data: { bookmark }
  });
});

/**
 * List all bookmarks of the authenticated user
 */
const getMyBookmarks = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const bookmarks = await Bookmark.find({ user: userId })
    .populate({
      path: 'article',
      populate: { path: 'author', select: 'username email avatar' }
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookmarks.length,
    data: { bookmarks }
  });
});

/**
 * Remove a bookmark by article ID directly
 */
const deleteBookmarkByArticle = catchAsync(async (req, res, next) => {
  const { articleId } = req.params;
  const userId = req.user.id;

  const bookmark = await Bookmark.findOne({ user: userId, article: articleId });
  if (!bookmark) {
    return next(new AppError('Bookmark not found.', 404));
  }

  await Bookmark.deleteOne({ _id: bookmark._id });

  res.status(200).json({
    success: true,
    message: 'Bookmark removed successfully.'
  });
});

module.exports = {
  toggleBookmark,
  getMyBookmarks,
  deleteBookmarkByArticle
};
