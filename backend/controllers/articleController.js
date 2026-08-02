/* BlogAuth V1 controllers/articleController.js — Article Controllers Layer */
const articleService = require('../services/articleService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Article } = require('../models');

/**
 * Create a new Article / Save Draft
 */
const create = catchAsync(async (req, res, next) => {
  // Bind author ID from the authenticated user token
  req.body.author = req.user.id;

  const article = await articleService.createArticle(req.body);

  res.status(219).json({
    success: true,
    message: 'Article created successfully.',
    data: { article }
  });
});

/**
 * Fetch a single Article by ID (and increment view count)
 */
const getById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await articleService.getArticleById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  // Restrict access to drafts and archives for non-authors
  if (article.status !== 'published') {
    if (!req.user || (article.author._id.toString() !== req.user.id && req.user.role !== 'admin')) {
      return next(new AppError('Access denied: this article has not been published.', 403));
    }
  }

  // Increment view counter dynamically
  const updatedArticle = await articleService.incrementViews(id);

  res.status(200).json({
    success: true,
    data: { article: updatedArticle }
  });
});

/**
 * Update an existing Article (requires ownership check)
 */
const update = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  // Enforce author or administrator ownership permissions
  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied: you are not authorized to update this article.', 403));
  }

  const updatedArticle = await articleService.updateArticle(id, req.body);

  res.status(200).json({
    success: true,
    message: 'Article updated successfully.',
    data: { article: updatedArticle }
  });
});

/**
 * Delete an existing Article (requires ownership check)
 */
const deleteArticle = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  // Enforce author or administrator ownership permissions
  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied: you are not authorized to delete this article.', 403));
  }

  await articleService.deleteArticle(id);

  res.status(200).json({
    success: true,
    message: 'Article deleted successfully.'
  });
});

/**
 * List Articles with optional filters and sorting options
 */
const list = catchAsync(async (req, res, next) => {
  const { page, limit, sort, category, tags, author, status } = req.query;

  const filters = {};

  // Public feeds default to published articles. Admin/Writer can query other statuses.
  if (status) {
    if (status !== 'published') {
      // Require authentication to query drafts/archives
      if (!req.user || (author && author !== req.user.id && req.user.role !== 'admin')) {
        return next(new AppError('Access denied: unauthorized query parameters.', 403));
      }
    }
    filters.status = status;
  } else {
    filters.status = 'published';
  }

  if (category) filters.category = category;
  if (author) filters.author = author;
  if (tags) {
    filters.tags = { $in: tags.split(',') };
  }

  const paginatedResults = await articleService.listArticles(filters, {
    page,
    limit,
    sort
  });

  res.status(200).json({
    success: true,
    ...paginatedResults
  });
});

/**
 * Search Articles based on MongoDB full-text index query q
 */
const search = catchAsync(async (req, res, next) => {
  const { q, page, limit } = req.query;

  if (!q) {
    return next(new AppError('Search query parameter q is required.', 400));
  }

  const searchResults = await articleService.searchArticles(q, {
    page,
    limit
  });

  res.status(200).json({
    success: true,
    ...searchResults
  });
});

module.exports = {
  create,
  getById,
  update,
  deleteArticle,
  list,
  search
};
