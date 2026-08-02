/* BlogAuth V1 services/articleService.js — Article Business Service Layer */
const { Article } = require('../models');
const AppError = require('../utils/appError');

/**
 * Create a new Article / Save Draft
 */
async function createArticle(articleData) {
  return await Article.create(articleData);
}

/**
 * Find Article by ID with populated references
 */
async function getArticleById(id) {
  return await Article.findById(id).populate('author category tags');
}

/**
 * Increment views counter on read
 */
async function incrementViews(id) {
  return await Article.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  );
}

/**
 * Update an existing Article (triggers schema hooks)
 */
async function updateArticle(id, updateData) {
  const article = await Article.findById(id);
  if (!article) {
    throw new AppError('Article not found.', 404);
  }

  // Assign update parameters
  Object.keys(updateData).forEach(key => {
    article[key] = updateData[key];
  });

  // Saving triggers Mongoose pre-validate and pre-save hooks (for readTime)
  return await article.save();
}

/**
 * Delete Article from DB
 */
async function deleteArticle(id) {
  const result = await Article.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new AppError('Article not found or already deleted.', 404);
  }
  return true;
}

/**
 * Fetch a paginated list of Articles based on filters and sorting options
 */
async function listArticles(filters = {}, options = {}) {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const sort = options.sort || '-createdAt';

  const totalResults = await Article.countDocuments(filters);
  const totalPages = Math.ceil(totalResults / limit);

  const results = await Article.find(filters)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .populate('author', 'username email avatar role')
    .populate('category', 'name slug icon')
    .populate('tags', 'name slug');

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults
  };
}

/**
 * Perform MongoDB full-text search against indexed fields (title, content, excerpt)
 */
async function searchArticles(searchQuery, options = {}) {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Query using full-text search constraints
  const filters = {
    $text: { $search: searchQuery },
    status: 'published' // Restrict search discovery to published articles
  };

  const totalResults = await Article.countDocuments(filters);
  const totalPages = Math.ceil(totalResults / limit);

  // Return matching documents sorted by text score relevance
  const results = await Article.find(filters, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
    .populate('author', 'username email avatar')
    .populate('category', 'name slug')
    .populate('tags', 'name slug');

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults
  };
}

module.exports = {
  createArticle,
  getArticleById,
  incrementViews,
  updateArticle,
  deleteArticle,
  listArticles,
  searchArticles
};
