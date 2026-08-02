/* BlogAuth V1 services/authService.js — Authentication Business Service Layer */
const crypto = require('crypto');
const { User, Session } = require('../models');
const AppError = require('../utils/appError');

/**
 * Register a new User account
 */
async function registerUser({ username, email, password }) {
  // 1. Assert unique conflicts
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new AppError('Email address already registered.', 400);
  }

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    throw new AppError('Username is already taken.', 400);
  }

  // 2. Generate email verification details
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // 3. Create user document (mongoose pre-save hashes the password)
  const user = await User.create({
    username,
    email,
    password,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires
  });

  return { user, verificationToken };
}

/**
 * Authenticate a user credentials, tracking attempts and lockouts
 */
async function loginUser({ email, password }) {
  // 1. Find user with password selected explicitly
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password credentials.', 401);
  }

  // 2. Assert lockout status
  if (user.isLocked()) {
    const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
    throw new AppError(`Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.`, 403);
  }

  // 3. Verify password match
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    
    // Check if lockout was triggered by this failure
    if (user.isLocked()) {
      throw new AppError('Too many failed attempts. Your account is now locked for 15 minutes.', 403);
    }
    
    throw new AppError('Invalid email or password credentials.', 401);
  }

  // 4. Successful login: clear attempts trackers
  await user.resetLoginAttempts();
  return user;
}

/**
 * Register a user session metadata log in database
 */
async function createSession(userId, token, { ipAddress, userAgent, expiresAt }) {
  return await Session.create({
    user: userId,
    token,
    ipAddress,
    userAgent,
    expiresAt
  });
}

/**
 * Delete session record from DB
 */
async function deleteSession(token) {
  return await Session.deleteOne({ token });
}

/**
 * Find session record by token
 */
async function findSession(token) {
  return await Session.findOne({ token });
}

/**
 * Generate password reset token
 */
async function generateResetToken(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('No user account registered with that email address.', 404);
  }

  // Generate crypto hex token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token to store safely in DB
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  await user.save();

  return { user, resetToken };
}

/**
 * Reset password using token check
 */
async function resetPassword(token, newPassword) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid token and not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Password reset token is invalid or has expired.', 400);
  }

  // Update password details (hashing will run in pre-save)
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  // Clear any active locks just in case
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  await user.save();
  return user;
}

/**
 * Verify User email using token
 */
async function verifyEmail(token) {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Verification token is invalid or has expired.', 400);
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return user;
}

module.exports = {
  registerUser,
  loginUser,
  createSession,
  deleteSession,
  findSession,
  generateResetToken,
  resetPassword,
  verifyEmail
};
