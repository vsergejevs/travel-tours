const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1. GLOAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Development logging The process.env property returns an object containing the user environment.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body. Method - a built-in middleware function in Express. It parses incoming requests with JSON payloads
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Serving static files. Method - a built-in middleware function in Express. It serves static files
app.use(express.static(`${__dirname}/public`));

// Middleware that runs everytime a request to the server is made
app.use((req, res, next) => {
  console.log('hello from middleware');
  next();
});

// Test middleware. Middleware to log request time in controllers
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3. ROUTES
//the below now acts as middleware
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

// router to handle all unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  // whenever an argument is passed into next(); function, express will know there was an error
  // all other middlewares then will get skipped and we will receive the error
});

// when specifiyng 4 parameters, express knows this is a
// error handling middleware
app.use(globalErrorHandler);

// 4. START SERVER
module.exports = app;
