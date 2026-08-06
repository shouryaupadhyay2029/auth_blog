/* BlogAuth V1 controllers/mediaController.js — Media Operations Controller */
const { Media } = require('../models');
const mediaService = require('../services/mediaService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Upload cover image
 */
const uploadCover = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No image file provided.', 400));
  }

  const media = await mediaService.uploadImage(req.file, req.user.id, 'cover', 'covers');

  res.status(200).json({
    success: true,
    message: 'Cover image uploaded successfully.',
    url: media.url,
    mediaId: media._id
  });
});

/**
 * Upload inline writing image
 */
const uploadInline = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No image file provided.', 400));
  }

  const media = await mediaService.uploadImage(req.file, req.user.id, 'inline', 'inline');

  res.status(200).json({
    success: true,
    message: 'Inline image uploaded successfully.',
    url: media.url,
    mediaId: media._id
  });
});

/**
 * Fetch list of uploaded media assets for the authenticated user
 */
const listMedia = catchAsync(async (req, res, next) => {
  const { type, search, sort, page, limit } = req.query;

  // By default, query own uploads unless admin lists all
  const filters = {};
  if (req.user.role !== 'admin') {
    filters.uploader = req.user.id;
  }

  // Filter by media usage type
  if (type) {
    filters.type = type;
  }

  // Handle Search parameter (regex on publicId or url)
  if (search) {
    filters.$or = [
      { publicId: { $regex: search, $options: 'i' } },
      { url: { $regex: search, $options: 'i' } }
    ];
  }

  // Handle Sorting parameter
  let sortOption = '-createdAt';
  if (sort) {
    if (sort === 'size') sortOption = '-bytes';
    else if (sort === 'size-asc') sortOption = 'bytes';
    else if (sort === 'type') sortOption = 'type';
    else if (sort === 'date') sortOption = '-createdAt';
    else if (sort === 'date-asc') sortOption = 'createdAt';
    else if (sort === 'owner') sortOption = 'uploader';
  }

  // Pagination parameters
  const skipPage = parseInt(page, 10) || 1;
  const skipLimit = parseInt(limit, 10) || 12;
  const skip = (skipPage - 1) * skipLimit;

  const totalResults = await Media.countDocuments(filters);
  const totalPages = Math.ceil(totalResults / skipLimit);

  const results = await Media.find(filters)
    .skip(skip)
    .limit(skipLimit)
    .sort(sortOption)
    .populate('uploader', 'username email avatar')
    .populate('article', 'title slug');

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
 * Delete a media upload asset
 */
const deleteMedia = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const media = await Media.findById(id);
  if (!media) {
    return next(new AppError('Media asset not found.', 404));
  }

  // Assert ownership (uploader only or admin)
  if (media.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Access denied: you are not authorized to delete this asset.', 403));
  }

  // Enforce usage checks to prevent broken assets on published articles
  if (media.isUsed || media.article) {
    return next(new AppError('Cannot delete media asset because it is currently attached to an active article.', 400));
  }

  // Delete from storage and database log
  await mediaService.deleteImage(media._id);

  res.status(200).json({
    success: true,
    message: 'Media asset deleted successfully.'
  });
});

/**
 * Trigger background cleanup manually
 */
const cleanup = catchAsync(async (req, res, next) => {
  const count = await mediaService.cleanupUnusedMedia();
  res.status(200).json({
    success: true,
    message: `Cleanup completed. Removed ${count} orphaned images.`
  });
});

module.exports = {
  uploadCover,
  uploadInline,
  listMedia,
  deleteMedia,
  cleanup
};
