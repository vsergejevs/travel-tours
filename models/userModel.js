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
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on create and save!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match!'
    }
  }
});
const User = mongoose.model('User', userSchema);
module.exports = User;
