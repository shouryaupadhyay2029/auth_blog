/* BlogAuth V1 routes/authRoutes.js — Authentication Endpoints Router */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} = require('../validators/authValidator');

// Get current user profile info
router.get('/me', protect, authController.getMe);

// User Registration
router.post('/register', validateRegister, authController.register);

// User Authentication
router.post('/login', validateLogin, authController.login);

// User Logout
router.post('/logout', authController.logout);

// Refresh Access Token
router.post('/refresh', authController.refresh);

// Verify Email Query Route (GET /verify-email?token=...)
router.get('/verify-email', authController.verifyEmail);

// Request Password Reset
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

// Perform Password Reset
router.post('/reset-password', validateResetPassword, authController.resetPassword);

module.exports = router;
