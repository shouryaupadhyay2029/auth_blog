/* BlogAuth V1 controllers/articleController.js — Editorial Studio Article Controller */
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Article, ArticleVersion, Media, Category, Tag, AuditLog } = require('../models');
const seoService = require('../services/seoService');
const mediaService = require('../services/mediaService');

/**
 * Helper: Update media usage associations for an article
 */
async function updateMediaAssociations(articleId, content, coverImageUrl, userId) {
  try {
    const mediaItems = await Media.find({ uploader: userId });
    const urlsInContent = [];

    if (content) {
      // Capture URLs matching uploads
      const imgRegex = /([/]\uploads[/][a-zA-Z0-9.-]+)|(cloudinary\.com[/][a-zA-Z0-9./-]+)/gi;
      let match;
      while ((match = imgRegex.exec(content)) !== null) {
        urlsInContent.push(match[0]);
      }
    }
    if (coverImageUrl) {
      urlsInContent.push(coverImageUrl);
    }

    for (const media of mediaItems) {
      const isUrlInArticle = urlsInContent.some(url => media.url.includes(url) || url.includes(media.url));
      if (isUrlInArticle) {
        if (!media.isUsed || media.article?.toString() !== articleId.toString()) {
          media.isUsed = true;
          media.article = articleId;
          await media.save();
        }
      } else if (media.article?.toString() === articleId.toString()) {
        media.isUsed = false;
        media.article = null;
        await media.save();
      }
    }
  } catch (error) {
    console.error('Error updating media associations:', error);
  }
}

/**
 * Helper: Create an article revision version
 */
async function createRevision(article, userId, summary = 'Revision save', changedFields = []) {
  return await ArticleVersion.create({
    article: article._id,
    editor: userId,
    title: article.title,
    subtitle: article.subtitle,
    content: article.content,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    category: article.category,
    tags: article.tags,
    summary,
    changedFields
  });
}

/**
 * Create new Article / Save Draft
 */
const create = catchAsync(async (req, res, next) => {
  // Bind author ID
  req.body.author = req.user.id;

  // Auto-generate slug and reading time early if not present
  if (req.body.title && !req.body.slug) {
    req.body.slug = seoService.generateSlug(req.body.title);
  }
  if (req.body.content) {
    req.body.readTime = seoService.estimateReadTime(req.body.content);
    if (!req.body.excerpt) {
      req.body.excerpt = seoService.generateExcerpt(req.body.content);
    }
  }

  // Handle defaults
  if (!req.body.status) req.body.status = 'draft';

  const article = await Article.create(req.body);

  // Update media relations
  await updateMediaAssociations(article._id, article.content, article.coverImage, req.user.id);

  // Create initial version
  await createRevision(article, req.user.id, 'Initial Draft Created');

  // Log activity
  await AuditLog.create({
    action: 'Article Created',
    targetType: 'Article',
    targetId: article._id,
    metadata: { details: `Draft article "${article.title}" initialized.` },
    actor: req.user.id
  });

  res.status(219).json({
    success: true,
    message: 'Article draft created successfully.',
    data: { article }
  });
});

/**
 * Fetch single Article by ID (increments views; handles protection/draft checks)
 */
const getById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id).populate('author category tags');
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  // Restrict access to drafts and archives for non-authors
  if (article.status !== 'published') {
    if (!req.user || (article.author._id.toString() !== req.user.id && req.user.role !== 'admin')) {
      return next(new AppError('Access denied: this article is currently unpublished.', 403));
    }
  }

  // Increment views
  article.views += 1;
  await article.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: { article }
  });
});

/**
 * Update existing Article (manual save)
 */
const update = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  // Ownership check
  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied: you are not authorized to update this article.', 403));
  }

  // Detect changed fields for revision logs
  const changedFields = [];
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined && String(article[key]) !== String(req.body[key])) {
      changedFields.push(key);
      article[key] = req.body[key];
    }
  });

  if (changedFields.length > 0) {
    // Regenerate read time/excerpt if content changed
    if (changedFields.includes('content')) {
      article.readTime = seoService.estimateReadTime(article.content);
      if (!req.body.excerpt) {
        article.excerpt = seoService.generateExcerpt(article.content);
      }
    }

    await article.save();
    await updateMediaAssociations(article._id, article.content, article.coverImage, req.user.id);
    await createRevision(article, req.user.id, req.body.versionSummary || 'Manual Update', changedFields);

    await AuditLog.create({
      action: 'Article Updated',
      targetType: 'Article',
      targetId: article._id,
      metadata: { details: `Article "${article.title}" saved. Changed: ${changedFields.join(', ')}` },
      actor: req.user.id
    });
  }

  res.status(200).json({
    success: true,
    message: 'Article saved successfully.',
    data: { article: article }
  });
});

/**
 * Autosave endpoint (Optimistic locking conflict protection, skip saves on no-changes)
 */
const autosave = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { lastSavedAt } = req.body;

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  // Ownership check
  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied.', 403));
  }
  // Conflict Protection
  if (lastSavedAt) {
    const dbTime = new Date(article.updatedAt).getTime();
    const clientTime = new Date(lastSavedAt).getTime();
    if (dbTime - clientTime > 1000) {
      return res.status(409).json({
        success: false,
        message: 'Conflict: This draft was modified in another window. Please reload or merge your work.',
        updatedAt: article.updatedAt
      });
    }
  }

  // Detect differences
  const changedFields = [];
  Object.keys(req.body).forEach(key => {
    if (key !== 'lastSavedAt' && req.body[key] !== undefined && String(article[key]) !== String(req.body[key])) {
      changedFields.push(key);
      article[key] = req.body[key];
    }
  });

  // Save only if changes exist to avoid redundant database writes
  if (changedFields.length > 0) {
    if (changedFields.includes('content')) {
      article.readTime = seoService.estimateReadTime(article.content);
      if (!article.excerpt) {
        article.excerpt = seoService.generateExcerpt(article.content);
      }
    }
    await article.save();
    await updateMediaAssociations(article._id, article.content, article.coverImage, req.user.id);
    await createRevision(article, req.user.id, 'Autosave revision', changedFields);
  }

  res.status(200).json({
    success: true,
    message: changedFields.length > 0 ? 'Draft autosaved successfully.' : 'No changes detected. Save skipped.',
    lastSavedTime: article.updatedAt,
    data: { article }
  });
});

/**
 * Duplicate an existing article
 */
const duplicate = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const original = await Article.findById(id);
  if (!original) {
    return next(new AppError('Article not found.', 404));
  }

  // Clone details
  const cloneData = {
    title: `${original.title} (Copy)`,
    subtitle: original.subtitle,
    content: original.content,
    excerpt: original.excerpt,
    coverImage: original.coverImage,
    author: req.user.id,
    category: original.category,
    tags: original.tags,
    status: 'draft',
    visibility: 'public',
    allowComments: original.allowComments,
    allowSharing: original.allowSharing,
    seoTitle: original.seoTitle,
    seoDescription: original.seoDescription,
    metaKeywords: original.metaKeywords
  };

  cloneData.slug = seoService.generateSlug(cloneData.title);

  const duplicated = await Article.create(cloneData);
  await createRevision(duplicated, req.user.id, 'Duplicated copy created');

  await AuditLog.create({
    action: 'Article Duplicated',
    targetType: 'Article',
    targetId: duplicated._id,
    metadata: { details: `Duplicated article "${original.title}" into copy "${duplicated.title}".` },
    actor: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Draft duplicated successfully.',
    data: { article: duplicated }
  });
});

/**
 * Delete Article
 */
const deleteArticle = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied.', 403));
  }

  // Delete versions & references
  await ArticleVersion.deleteMany({ article: id });
  // Set media usage links back to false
  await Media.updateMany({ article: id }, { isUsed: false, article: null });
  await Article.deleteOne({ _id: id });

  await AuditLog.create({
    action: 'Article Deleted',
    targetType: 'Article',
    targetId: id,
    metadata: { details: `Deleted article "${article.title}".` },
    actor: req.user.id
  });

  res.status(200).json({
    success: true,
    message: 'Article deleted successfully.'
  });
});

/**
 * Archive Article
 */
const archive = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied.', 403));
  }

  article.status = 'archived';
  await article.save();

  await createRevision(article, req.user.id, 'Status changed: archived');

  await AuditLog.create({
    action: 'Article Archived',
    targetType: 'Article',
    targetId: article._id,
    metadata: { details: `Archived article "${article.title}".` },
    actor: req.user.id
  });

  res.status(200).json({
    success: true,
    message: 'Article archived successfully.',
    data: { article }
  });
});

/**
 * Restore Archived Article to Draft
 */
const restore = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied.', 403));
  }

  if (article.status !== 'archived') {
    return next(new AppError('Only archived articles can be restored.', 400));
  }

  article.status = 'draft';
  await article.save();

  await createRevision(article, req.user.id, 'Status restored: draft');

  await AuditLog.create({
    action: 'Article Restored',
    targetType: 'Article',
    targetId: article._id,
    metadata: { details: `Restored article "${article.title}" to draft status.` },
    actor: req.user.id
  });

  res.status(200).json({
    success: true,
    message: 'Article restored to draft successfully.',
    data: { article }
  });
});

/**
 * Submit article for review
 */
const submitForReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied.', 403));
  }

  // Publication validations
  if (!article.title || article.title.length < 5) {
    return next(new AppError('A title of at least 5 characters is required to submit for review.', 400));
  }
  if (!article.content) {
    return next(new AppError('Article content body is required to submit for review.', 400));
  }

  article.status = 'in review';
  await article.save();

  await createRevision(article, req.user.id, 'Status changed: in review');

  await AuditLog.create({
    action: 'Article Review Submission',
    targetType: 'Article',
    targetId: article._id,
    metadata: { details: `Submitted article "${article.title}" for review.` },
    actor: req.user.id
  });

  res.status(200).json({
    success: true,
    message: 'Article submitted for review successfully.',
    data: { article }
  });
});

/**
 * Publish article immediately
 */
const publish = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied.', 403));
  }

  // Enforce metadata requirement for publishing
  if (!article.category) {
    return next(new AppError('Please classify this article with a category before publishing.', 400));
  }
  if (!article.title || article.title.length < 5) {
    return next(new AppError('Article title must contain at least 5 characters.', 400));
  }
  if (!article.content) {
    return next(new AppError('Article content body cannot be empty.', 400));
  }

  article.status = 'published';
  article.publishedAt = new Date();
  article.scheduledAt = null; // Reset schedule
  await article.save();

  await createRevision(article, req.user.id, 'Status changed: published');

  await AuditLog.create({
    action: 'Article Published',
    targetType: 'Article',
    targetId: article._id,
    metadata: { details: `Published article "${article.title}".` },
    actor: req.user.id
  });

  res.status(200).json({
    success: true,
    message: 'Article published successfully.',
    data: { article }
  });
});

/**
 * Schedule article for future publishing
 */
const schedule = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { scheduledAt, timezone } = req.body;

  if (!scheduledAt) {
    return next(new AppError('Please provide a publication scheduledAt timestamp.', 400));
  }

  const publishDate = new Date(scheduledAt);
  if (publishDate <= new Date()) {
    return next(new AppError('Scheduled publication date must be in the future.', 400));
  }

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied.', 403));
  }

  if (!article.category) {
    return next(new AppError('Please classify this article with a category before scheduling.', 400));
  }
  if (!article.title || article.title.length < 5) {
    return next(new AppError('Article title must contain at least 5 characters.', 400));
  }
  if (!article.content) {
    return next(new AppError('Article content body is required for scheduling.', 400));
  }

  article.status = 'scheduled';
  article.scheduledAt = publishDate;
  article.timezone = timezone || 'UTC';
  await article.save();

  await createRevision(article, req.user.id, `Status changed: scheduled to ${publishDate.toISOString()}`);

  await AuditLog.create({
    action: 'Article Scheduled',
    targetType: 'Article',
    targetId: article._id,
    metadata: { details: `Scheduled article "${article.title}" to publish at ${publishDate.toISOString()}.` },
    actor: req.user.id
  });

  res.status(200).json({
    success: true,
    message: `Article scheduled for publication at ${publishDate.toLocaleDateString()} successfully.`,
    data: { article }
  });
});

/**
 * Generate preview token for an article
 */
const generatePreviewToken = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied.', 403));
  }

  const token = crypto.randomBytes(32).toString('hex');
  article.previewToken = token;
  article.previewTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry
  await article.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    token: token,
    url: `/articles/preview/${token}`
  });
});

/**
 * View unpublished article using token
 */
const previewArticle = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const article = await Article.findOne({
    previewToken: token,
    previewTokenExpires: { $gt: Date.now() }
  }).populate('author category tags');

  if (!article) {
    return next(new AppError('Preview link has expired or is invalid.', 404));
  }

  res.status(200).json({
    success: true,
    data: { article }
  });
});

/**
 * List article revision versions
 */
const listVersions = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied.', 403));
  }

  const versions = await ArticleVersion.find({ article: id })
    .populate('editor', 'username email avatar')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    versions
  });
});

/**
 * Restore a specific revision version
 */
const restoreVersion = catchAsync(async (req, res, next) => {
  const { id, versionId } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied.', 403));
  }

  const version = await ArticleVersion.findOne({ _id: versionId, article: id });
  if (!version) {
    return next(new AppError('Revision version not found.', 404));
  }

  // Restore fields
  article.title = version.title;
  article.subtitle = version.subtitle;
  article.content = version.content;
  article.excerpt = version.excerpt;
  article.coverImage = version.coverImage;
  article.category = version.category;
  article.tags = version.tags;

  await article.save();

  // Create version history element reflecting restoration
  await createRevision(article, req.user.id, `Restored to version from ${new Date(version.createdAt).toLocaleString()}`);

  await AuditLog.create({
    action: 'Article Revision Restored',
    targetType: 'Article',
    targetId: article._id,
    metadata: { details: `Restored article "${article.title}" to version: ${versionId}` },
    actor: req.user.id
  });

  res.status(200).json({
    success: true,
    message: 'Article restored to selected version successfully.',
    data: { article: article }
  });
});

/**
 * List Articles (supports filters, search overrides, pagination)
 */
const list = catchAsync(async (req, res, next) => {
  const { page, limit, sort, category, tags, author, status, visibility } = req.query;

  const filters = {};

  // Visibility filters
  if (visibility) {
    filters.visibility = visibility;
  } else {
    filters.visibility = 'public'; // Default only view public items
  }

  // Public feeds default to published articles. Admin/Writer can query other statuses.
  if (status) {
    if (status !== 'published') {
      if (!req.user || (author && author !== req.user.id && req.user.role !== 'admin')) {
        return next(new AppError('Access denied: unauthorized query status parameter.', 403));
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

  const skipPage = parseInt(page, 10) || 1;
  const skipLimit = parseInt(limit, 10) || 10;
  const skip = (skipPage - 1) * skipLimit;
  const sortOption = sort || '-createdAt';

  const totalResults = await Article.countDocuments(filters);
  const totalPages = Math.ceil(totalResults / skipLimit);

  const results = await Article.find(filters)
    .skip(skip)
    .limit(skipLimit)
    .sort(sortOption)
    .populate('author', 'username email avatar role')
    .populate('category', 'name slug icon')
    .populate('tags', 'name slug');

  res.status(200).json({
    success: true,
    results,
    page: skipPage,
    limit: skipLimit,
    totalPages,
    totalResults
  });
});

/**
 * Search Articles based on text index queries
 */
const search = catchAsync(async (req, res, next) => {
  const { q, page, limit } = req.query;

  if (!q) {
    return next(new AppError('Search query parameter q is required.', 400));
  }

  const skipPage = parseInt(page, 10) || 1;
  const skipLimit = parseInt(limit, 10) || 10;
  const skip = (skipPage - 1) * skipLimit;

  const filters = {
    $text: { $search: q },
    status: 'published',
    visibility: 'public'
  };

  const totalResults = await Article.countDocuments(filters);
  const totalPages = Math.ceil(totalResults / skipLimit);

  const results = await Article.find(filters, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(skipLimit)
    .populate('author', 'username email avatar')
    .populate('category', 'name slug')
    .populate('tags', 'name slug');

  res.status(200).json({
    success: true,
    results,
    page: skipPage,
    limit: skipLimit,
    totalPages,
    totalResults
  });
});

/**
 * Upload and set cover image for an article
 */
const uploadCoverImage = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!req.file) {
    return next(new AppError('No cover image file provided.', 400));
  }

  const article = await Article.findById(id);
  if (!article) {
    return next(new AppError('Article not found.', 404));
  }

  // Ownership validation
  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied: you are not authorized to update this article.', 403));
  }

  // 1. Upload new cover image via mediaService (optimized WebP, w_1200 max)
  const media = await mediaService.uploadImage(req.file, req.user.id, 'cover', 'covers');

  // 2. Track new cover usage
  media.isUsed = true;
  media.article = article._id;
  await media.save();

  // 3. Clean up previous cover image if it exists
  if (article.coverImage) {
    const oldMedia = await Media.findOne({ url: article.coverImage, uploader: req.user.id });
    if (oldMedia) {
      await mediaService.deleteImage(oldMedia._id);
    } else if (article.coverImage.startsWith('/uploads')) {
      // Local file fallback cleanup for untracked covers
      const path = require('path');
      const fs = require('fs');
      const filename = path.basename(article.coverImage);
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  // 4. Update Article Model
  article.coverImage = media.url;
  await article.save();

  res.status(200).json({
    success: true,
    message: 'Cover image uploaded and article updated successfully.',
    coverUrl: media.url,
    data: { article }
  });
});

module.exports = {
  create,
  getById,
  update,
  deleteArticle,
  list,
  search,
  autosave,
  duplicate,
  archive,
  restore,
  submitForReview,
  publish,
  schedule,
  generatePreviewToken,
  previewArticle,
  listVersions,
  restoreVersion,
  uploadCoverImage
};
