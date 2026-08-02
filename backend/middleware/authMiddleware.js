/* BlogAuth V1 middleware/authMiddleware.js — JWT Verification Middleware */
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Assert header schema validation
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('No token credentials found. Access denied.', 401));
  }

  // 2. Token verification
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Bind token details directly onto request object (e.g. userId)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user'
    };

    next();
  } catch (error) {
    return next(new AppError('Authentication failed. Invalid or expired token.', 401));
  }
});

// Role-based auth utility
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Access denied: insufficient workspace privileges.', 403));
    }
    next();
  };
};

const optionalProtect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user'
      };
    } catch (error) {
      // Ignore token validation issues for optional routes
    }
  }
  next();
});

module.exports = {
  protect,
  authorize,
  optionalProtect
};
