/* BlogAuth V1 controllers/adminController.js — Admin Dashboard Controller */
const { User, Report, Article, Comment } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * List all users in system (admin check enforced by middleware)
 */
const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password').sort('-createdAt');

  res.status(200).json({
    success: true,
    count: users.length,
    data: { users }
  });
});

/**
 * Change a user role
 */
const updateUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['user', 'writer', 'admin'].includes(role)) {
    return next(new AppError('Please provide a valid user role classification.', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User role updated to ${role} successfully.`,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  });
});

/**
 * List all filed reports
 */
const getAllReports = catchAsync(async (req, res, next) => {
  const reports = await Report.find()
    .populate('reporter', 'username email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reports.length,
    data: { reports }
  });
});

/**
 * Resolve or update status of a report
 */
const updateReportStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'reviewed', 'resolved'].includes(status)) {
    return next(new AppError('Please specify reviewed or resolved status.', 400));
  }

  const report = await Report.findById(id);
  if (!report) {
    return next(new AppError('Report not found.', 404));
  }

  report.status = status;
  await report.save();

  res.status(200).json({
    success: true,
    message: `Report status updated to ${status} successfully.`,
    data: { report }
  });
});

module.exports = {
  getAllUsers,
  updateUserRole,
  getAllReports,
  updateReportStatus
};
