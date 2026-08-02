/* BlogAuth V1 validators/authValidator.js — Authentication Validator Middleware */
const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

/**
 * Handle Express Validator results and bubble errors to the centralized middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors
      .array()
      .map(err => err.msg)
      .join(' ');
    
    return next(new AppError(errorMsg, 400));
  }
  next();
};

const validateRegister = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required.')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must contain between 3 and 30 characters.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain alphanumeric characters and underscores.'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email format.')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must contain at least 8 characters.'),

  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email format.')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),

  handleValidationErrors
];

const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email format.')
    .normalizeEmail(),

  handleValidationErrors
];

const validateResetPassword = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required.'),
  
  body('password')
    .notEmpty()
    .withMessage('New password is required.')
    .isLength({ min: 8 })
    .withMessage('New password must contain at least 8 characters.'),

  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
};
