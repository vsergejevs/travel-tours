const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1. MIDDLEWARES
// The process.env property returns an object containing the user environment.
//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Method - a built-in middleware function in Express. It parses incoming requests with JSON payloads
app.use(express.json());

// Method - a built-in middleware function in Express. It serves static files
app.use(express.static(`${__dirname}/public`));

// Middleware that runs everytime a request to the server is made
app.use((req, res, next) => {
  console.log('hello from middleware');
  next();
});

// Middleware to log request time in controllers
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3. ROUTES
//the below now acts as middleware
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

// router to handle all unhandled routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`
  // });
  const err = new Error(`Can't find ${req.originalUrl} on this server`);
  err.status = 'fail';
  err.statusCode = 404;

  next(err); // whenever an argument is passed into next(); function, express will know there was an error
  // all other middlewares then will get skipped and we will receive the error
});

// when specifiyng 4 parameters, express knows this is a
// error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

// 4. START SERVER
module.exports = app;
