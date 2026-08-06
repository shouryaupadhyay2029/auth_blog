/* BlogAuth V1 controllers/authController.js — Authentication Controllers Layer */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Sign access JWT token (15 minutes short-lived)
 */
function signAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Sign refresh JWT token (7 days long-lived)
 */
function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Register session, configure HTTP-only cookies, and respond consistently
 */
async function sendTokens(user, statusCode, req, res, message) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // Expiration limits
  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Log session in Database
  await authService.createSession(user._id, refreshToken, {
    ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    userAgent: req.headers['user-agent'] || '',
    expiresAt: refreshExpires
  });

  // Configure httpOnly cookies settings
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax'
  };

  res.cookie('jwt', accessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    expires: refreshExpires
  });

  res.status(statusCode).json({
    success: true,
    message,
    token: accessToken,
    refreshToken: refreshToken,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    }
  });
}

/**
 * Register user controller
 */
const register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  const { user, verificationToken } = await authService.registerUser({
    username,
    email,
    password
  });

  // In development, return the verification token inside JSON response
  const msg = process.env.NODE_ENV === 'development'
    ? `Registration successful. Verify Email token: ${verificationToken}`
    : 'Registration successful. Verification email has been sent.';

  await sendTokens(user, 219, req, res, msg);
});

/**
 * Login user controller
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await authService.loginUser({ email, password });

  await sendTokens(user, 200, req, res, 'Authentication successful.');
});

/**
 * Logout user controller
 */
const logout = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Delete session from DB
    await authService.deleteSession(refreshToken);
  }

  // Clear HTTP-only cookies
  res.clearCookie('jwt');
  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

/**
 * Refresh Access Token controller
 */
const refresh = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError('No refresh token credentials provided.', 401));
  }

  // 1. Verify refresh token signature
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (error) {
    return next(new AppError('Refresh token credentials expired or invalid.', 401));
  }

  // 2. Assert session exists in database
  const activeSession = await authService.findSession(refreshToken);
  if (!activeSession) {
    return next(new AppError('Active session not found. Please re-authenticate.', 401));
  }

  // 3. Find user and issue a new short access token
  const { User } = require('../models');
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User belonging to this token no longer exists.', 401));
  }

  const newAccessToken = signAccessToken(user);

  res.cookie('jwt', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax',
    expires: new Date(Date.now() + 15 * 60 * 1000)
  });

  res.status(200).json({
    success: true,
    message: 'Access token refreshed.',
    token: newAccessToken,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    }
  });
});

/**
 * Verify Email controller
 */
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return next(new AppError('Verification token query param is required.', 400));
  }

  await authService.verifyEmail(token);

  res.status(200).json({
    success: true,
    message: 'Email address verified successfully.'
  });
});

/**
 * Forgot Password controller
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const { resetToken } = await authService.generateResetToken(email);

  // In development, return the token in JSON payload
  const responseData = process.env.NODE_ENV === 'development'
    ? { resetToken }
    : undefined;

  res.status(200).json({
    success: true,
    message: 'Password reset instructions have been dispatched.',
    data: responseData
  });
});

/**
 * Reset Password controller
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError('Token and password parameters are required.', 400));
  }

  const user = await authService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. Please sign in.'
  });
});

/**
 * Get current authenticated user profile
 */
const getMe = catchAsync(async (req, res, next) => {
  const { User } = require('../models');
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User belonging to this token no longer exists.', 404));
  }
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe
};
