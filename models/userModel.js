const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

//?USERS DATA MODELLING
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
    // unique: true,
  },
  email: {
    // !use the email as username to loggin
    type: String,
    required: [true, 'User must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email must type of email'],
  },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    // unique: true,
    minLength: [8, 'Password need at least 8 characters'],
    select: false,
  },
  photo: {
    type: String,
  },
  //?IMPLEMENTS AUTHORIZATION USERS:
  //-->we need roles to know permission of per user
  //--! and this roles sepecific to the application's domain, if you run a community site it's not going to make much sense to have guide or lead guide
  //* in the other application maybe you will have moderators, contributors, members,... it's depend your type application, and it's must suite with you application
  roles: {
    type: String,
    enum: ['user', 'guide', 'leading-guide', 'admin'],
    default: 'user',
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Pls confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password invalid, please enter password you just fill ',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.passwordCorrect = async function (
  cadidatePassword,
  userPassword,
) {
  return await bcrypt.compare(cadidatePassword, userPassword);
};

//?IMPLEMENTS THE CHECK PASSWORD HAS BEED CHANGED OR NOT METHOD
//!Remember this method is static instance method
//* with parameter: we need jwt timestamp, which give us info when the token was issued
userSchema.methods.checkPasswordChangeAfter = function (JWTTimestamp) {
  //check the user has changed the password after the token was issued? return true if changed and false (not change)
  //--> we also need create a field now in our schema for that day password has changed
  if (this.passwordChangedAt) {
    // console.log(this.passwordChangedAt, JWTTimestamp);
    // console.log(this.passwordChangedAt.getSeconds());
    const changedTime = Math.floor(Date.parse(this.passwordChangedAt) / 1000);
    // console.log(changedTime > JWTTimestamp);
    return changedTime > JWTTimestamp; //time you change password always greater than time you created this account(password), when in 200s you change password but the token issued in 300s so 200 >300 => false=> password no changed
  }

  //if user not change password we return false
  return false;
};

const User = mongoose.model('User', userSchema); // use mongoose.model() is a function to create a model

module.exports = User;
