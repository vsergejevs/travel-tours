const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name']
  },
  email: {
    type: String,
    required: [true, 'Email is mandatory'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid e-mail']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'User must enter a password'],
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password']
  }
});
const User = mongoose.model('User', userSchema);
module.exports = User;
