/* BlogAuth V1 controllers/reportController.js — Report Operations Controller */
const { Report, Article, Comment } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * File a new report against an article or comment
 */
const createReport = catchAsync(async (req, res, next) => {
  const { type, targetId, reason } = req.body;
  const userId = req.user.id;

  if (!type || !targetId || !reason) {
    return next(new AppError('Type, target ID, and reason are required parameters.', 400));
  }

  // Validate target existence
  if (type === 'article') {
    const article = await Article.findById(targetId);
    if (!article) return next(new AppError('Target article not found.', 404));
  } else if (type === 'comment') {
    const comment = await Comment.findById(targetId);
    if (!comment) return next(new AppError('Target comment not found.', 404));
  } else {
    return next(new AppError('Invalid report target type.', 400));
  }

  const report = await Report.create({
    reporter: userId,
    type,
    targetId,
    reason
  });

  res.status(201).json({
    success: true,
    message: 'Report filed successfully and queued for review.',
    data: { report }
  });
});

module.exports = {
  createReport
};
