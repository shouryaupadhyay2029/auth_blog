/* BlogAuth V1 controllers/userController.js — User Operations Controller */
const { User, Media } = require('../models');
const mediaService = require('../services/mediaService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Upload and set user avatar profile image
 */
const uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No avatar image file provided.', 400));
  }

  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User account not found.', 404));
  }

  // 1. Upload new avatar image via mediaService (optimizes to 300x300 WebP)
  const media = await mediaService.uploadImage(req.file, userId, 'avatar', 'avatars');

  // 2. Track new avatar usage
  media.isUsed = true;
  await media.save();

  // 3. Clean up previous avatar if it exists
  if (user.avatar) {
    // Find the media document tracking the old avatar
    const oldMedia = await Media.findOne({ url: user.avatar, uploader: userId });
    if (oldMedia) {
      await mediaService.deleteImage(oldMedia._id);
    } else if (user.avatar.startsWith('/uploads')) {
      // Local file fallback cleanup for untracked avatars
      const path = require('path');
      const fs = require('fs');
      const filename = path.basename(user.avatar);
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  // 4. Update User Model
  user.avatar = media.url;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded and profile updated successfully.',
    avatarUrl: media.url,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    }
  });
});

module.exports = {
  uploadAvatar
};
