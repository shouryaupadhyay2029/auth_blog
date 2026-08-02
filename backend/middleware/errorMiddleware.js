/* BlogAuth V1 middleware/errorMiddleware.js — Centralized Operational Boundary */
const AppError = require('../utils/appError');

// MongoDB Cast Error (invalid ObjectIds)
const handleCastErrorDB = err => {
  const message = `Invalid data format: ${err.path} matches value '${err.value}'.`;
  return new AppError(message, 400);
};

// MongoDB Duplicate Fields (11000 codes)
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate resource entry: field value ${value} already exists. Please choose another.`;
  return new AppError(message, 400);
};

// Mongoose Validation Error
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid data inputs: ${errors.join(' ')}`;
  return new AppError(message, 400);
};

// JWT Authentication Signings
const handleJWTError = () => new AppError('Invalid token credentials. Please authenticate again.', 401);
const handleJWTExpiredError = () => new AppError('Token expired. Please re-authenticate.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    stack: err.stack,
    error: err
  });
};

const sendErrorProd = (err, res) => {
  // 1. Operational, trusted errors: send messages details safely to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } else {
    // 2. Programming/third-party bugs: log internally, respond generic message
    console.error('CRITICAL INTERNAL FAILURE:', err);
    res.status(500).json({
      success: false,
      message: 'An unexpected internal configuration error occurred. Please contact systems admin.'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.errmsg = err.errmsg;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
