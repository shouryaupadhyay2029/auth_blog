const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorMiddleware');
const apiRouter = require('./routes/api');
const { logger, requestLogger } = require('./utils/logger');

const app = express();

// 1. Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false
}));

// 2. Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// 3. Payload size optimizations & JSON parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 4. Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Custom XSS Sanitizer Middleware (replacing html entities/dangerous tags)
app.use((req, res, next) => {
  const sanitize = (val) => {
    if (typeof val === 'string') {
      return val.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    if (val !== null && typeof val === 'object') {
      for (const key in val) {
        val[key] = sanitize(val[key]);
      }
    }
    return val;
  };
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
});

// 5. Serve static uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Response payload compression
app.use(compression());

// 7. Request Logging (Morgan + Winston)
const morganStream = {
  write: (message) => requestLogger.info(message.trim())
};

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: morganStream }));
}

// 7. Global Request Rate Limiting (100 requests per 15 minutes per IP)
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

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// 8. Mount API v1 Routers & Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', apiRouter);

// 9. Capture unregistered endpoint paths
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint route ${req.originalUrl} on this server index.`, 404));
});

// 10. Centralized Operational Error Handler
app.use(globalErrorHandler);

module.exports = app;
