const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    minlength: 8,
    select: false
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

userSchema.pre('save', async function(next) {
  // only run this function if password was modified
  if (!this.isModified('password')) return next();

  // password is being encrypted with a bcrypt hash function, with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
