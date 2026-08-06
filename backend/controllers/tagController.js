/* BlogAuth V1 controllers/tagController.js — Tag Controller */
const { Tag } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const searchTags = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
  const tags = await Tag.find(filter).limit(10);
  res.status(200).json({
    success: true,
    results: tags
  });
});

const createTag = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return next(new AppError('Tag name is required.', 400));
  }

  const cleanName = name.trim().toLowerCase();
  // Reuse existing tag to limit duplicates
  let tag = await Tag.findOne({ name: cleanName });
  if (!tag) {
    tag = await Tag.create({ name: cleanName });
  }

  res.status(201).json({
    success: true,
    data: tag
  });
});

module.exports = {
  searchTags,
  createTag
};
