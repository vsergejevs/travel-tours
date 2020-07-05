const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy');

// Setup pug engine for frontend rendering
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1. GLOAL MIDDLEWARES

// Implement CORS - cross origin resource sharing
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors()); // browser prefligt phase

// Serving static files. Method - a built-in middleware function in Express. It serves static files
app.use(express.static(path.join(__dirname, 'public')));

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
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent paramter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Middleware that runs everytime a request to the server is made
app.use((req, res, next) => {
  //console.log('hello from middleware');
  next();
});

app.use(compression());

// Test middleware. Middleware to log request time in controllers
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

// 3. ROUTES
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

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
