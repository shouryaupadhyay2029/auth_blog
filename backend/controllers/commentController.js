/* BlogAuth V1 controllers/commentController.js — Comment Operations Controller */
const { Comment, Article, Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Create a new comment or threaded reply
 */
const createComment = catchAsync(async (req, res, next) => {
  const { article: articleId, content, parentComment } = req.body;
  const userId = req.user.id;

  if (!articleId || !content) {
    return next(new AppError('Article ID and comment content are required.', 400));
  }

  const articleObj = await Article.findById(articleId);
  if (!articleObj) {
    return next(new AppError('Article not found.', 404));
  }

  // Create comment
  const comment = await Comment.create({
    user: userId,
    article: articleId,
    content,
    parentComment: parentComment || null
  });

  // Populate user data
  await comment.populate('user', 'username email avatar');

  // Trigger Notification to Article Author (if someone else comments)
  if (articleObj.author.toString() !== userId.toString()) {
    await Notification.create({
      recipient: articleObj.author,
      sender: userId,
      type: 'comment',
      article: articleId,
      message: `${req.user.username} commented on your article: "${articleObj.title}"`
    });
  }

  res.status(201).json({
    success: true,
    message: 'Comment posted successfully.',
    data: { comment }
  });
});

/**
 * Get all comments for a specific article
 */
const getCommentsByArticle = catchAsync(async (req, res, next) => {
  const { articleId } = req.params;

  const comments = await Comment.find({ article: articleId })
    .populate('user', 'username email avatar')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: comments.length,
    data: { comments }
  });
});

/**
 * Delete a comment
 */
const deleteComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);

  if (!comment) {
    return next(new AppError('Comment not found.', 404));
  }

  // Authorized user is either the comment poster, or article author, or admin
  const articleObj = await Article.findById(comment.article);
  const isCommentOwner = comment.user.toString() === req.user.id;
  const isArticleOwner = articleObj && articleObj.author.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCommentOwner && !isArticleOwner && !isAdmin) {
    return next(new AppError('You are not authorized to delete this comment.', 403));
  }

  await Comment.deleteOne({ _id: id });

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully.'
  });
});

module.exports = {
  createComment,
  getCommentsByArticle,
  deleteComment
};
