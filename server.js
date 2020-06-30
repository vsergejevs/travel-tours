const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION Shutting down'); // friendly message
  console.log(`${err.name}: ${err.message}`); // printing what's the error
  process.exit(1); //shutting down app
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  'PASSWORD',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful'));

// 1. STARTS SERVER

// console.log(process.env);

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handle unhandled rejections
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION Shutting down'); // friendly message
  console.log(`${err.name}: ${err.message}`); // printing what's the error
  server.close(() => {
    process.exit(1); //shutting down app
  });
});
