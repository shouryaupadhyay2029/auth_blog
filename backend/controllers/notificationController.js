/* BlogAuth V1 controllers/notificationController.js — Notification Operations Controller */
const { Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Get all notifications for the authenticated user
 */
const getMyNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const notifications = await Notification.find({ recipient: userId })
    .populate('sender', 'username email avatar')
    .populate('article', 'title slug')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: { notifications }
  });
});

/**
 * Mark a specific notification as read
 */
const markAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({ _id: id, recipient: userId });

  if (!notification) {
    return next(new AppError('Notification not found or access denied.', 404));
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read.',
    data: { notification }
  });
});

/**
 * Mark all notifications as read for the authenticated user
 */
const markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read.'
  });
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
