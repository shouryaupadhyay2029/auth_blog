/* BlogAuth V1 app.js — Express App Pipeline Configuration */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorMiddleware');
const apiRouter = require('./routes/api');

const app = express();

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// 3. Payload size optimizations & JSON parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 4. Response payload compression
app.use(compression());

// 5. Development Request Logging (Morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 6. Global Request Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP addresses. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// 7. Mount API v1 Routers
app.use('/api/v1', apiRouter);

// 8. Capture unregistered endpoint paths
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint route ${req.originalUrl} on this server index.`, 404));
});

// 9. Centralized Operational Error Handler
app.use(globalErrorHandler);

module.exports = app;
