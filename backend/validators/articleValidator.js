/* BlogAuth V1 validators/articleValidator.js — Article Validator Middleware */
const { body, param, validationResult } = require('express-validator');
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

const validateCreateArticle = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Article title is required.')
    .isLength({ min: 5, max: 120 })
    .withMessage('Title must contain between 5 and 120 characters.'),
  
  body('content')
    .optional(),
  
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Excerpt cannot exceed 400 characters.'),
  
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid Mongoose Category ObjectId.'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be provided as an array format.'),
  
  body('tags.*')
    .optional()
    .isMongoId()
    .withMessage('Each tag element must be a valid Mongoose Tag ObjectId.'),

  body('status')
    .optional()
    .isIn(['draft', 'in review', 'scheduled', 'published', 'archived', 'rejected'])
    .withMessage('Status must match draft, in review, scheduled, published, archived, or rejected.'),

  handleValidationErrors
];

const validateUpdateArticle = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid Mongoose Article ObjectId inside request params.'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 120 })
    .withMessage('Title must contain between 5 and 120 characters.'),
  
  body('content')
    .optional(),
  
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Excerpt cannot exceed 400 characters.'),
  
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid Mongoose Category ObjectId.'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be provided as an array format.'),
  
  body('tags.*')
    .optional()
    .isMongoId()
    .withMessage('Each tag element must be a valid Mongoose Tag ObjectId.'),

  body('status')
    .optional()
    .isIn(['draft', 'in review', 'scheduled', 'published', 'archived', 'rejected'])
    .withMessage('Status must match draft, in review, scheduled, published, archived, or rejected.'),

  handleValidationErrors
];

module.exports = {
  validateCreateArticle,
  validateUpdateArticle
};
