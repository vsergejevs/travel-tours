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

// 4. START SERVER
module.exports = app;
