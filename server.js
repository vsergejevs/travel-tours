const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

const port = 3000 || process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Subscribing to unhandledRejection object
process.on('unhandledRejection', err => {
  console.log(err.name, err.message); // printing what's the error
  console.log('UNHANDLED REJECTION Shutting down'); // friendly message
  server.close(() => {
    process.exit(1); //shutting down app
  });
});
