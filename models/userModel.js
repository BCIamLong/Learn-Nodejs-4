const crypto = require('crypto');
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
    required: [true, 'Please fill your password'],
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
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password invalid, please enter password you just fill ',
    },
  },
  passwordChangedAt: Date,
  //?Create reset password fields
  passwordResetToken: String,
  //!we also need the password expipres to who when the password expires and maybe in 3 min, 5 min, 10 min,... to reset yout password
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  //--! this.isNew check if create document => next() because we only want for update(in this case we use save() as update)
  if (this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; //* so we  fix that with minus for 1000 miliseconds to set timestamp of passwordChangedAt  always always create after (<) timestamp of json web token

  //! so it's really working good but sometime maybe it's can occurs problem, and that problem is that sometime saving to the DB is little slower than oupputing the json web token so the password timestamp(dau thoi gian) change is sometimes set a bit later after the json web token created so that the user can't login using the new token that does it
  //? and becasue we use timestamp of passwordChangedAt to compare with timestamp of json web token that's mean this time timestamp of passwordChangedAt  always > timestamp of json web token
  //* and if timestamp of passwordChangedAt  always > timestamp of json web token => this doesn't allow use login because we set validator for this
  next();
});

userSchema.methods.passwordCorrect = async function (cadidatePassword, userPassword) {
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

//?IMPLEMENTS INSTANCE CREATE TOKEN IN RESET PASSWORD

userSchema.methods.createResetPasswordToken = function () {
  //this random token should will be a random string and don't need crypt too strong as we create the json web token before
  //--> therefore we will use crypt built-in in nodejs
  const resetToken = crypto.randomBytes(32).toString('hex');
  //---this is a token we will send to user and so it's like a reset password that the user then can use to create a new password and of course only the user will have access to this token
  //--> so in fact it's really work like a password and it's means that if the hacker can get access to or database well then that's going to allow the hacker to gain access to the account by setting new password
  //--! if we would just simply store this reset token in our database now then if some hackes gains access to the database then use that's token and create new password and control your account
  //--> just like a password we should never store a plain(simple) reset token in the DB
  //--! with password we use strong encrypt but with this reset token which less get attack from hacker we can use not strong encrypt
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  //--! so we should save this encrypt reset token in database then we can compare it with the token that user provides
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //* reset password in 10 minutes
  console.log(resetToken, this.passwordResetToken);
  return resetToken; //* it's one part we send to email, and because we wil use this to compare with the encrypt reset password in DB when user send
  //? we send one token via email and then we have the encrypted version in our DB and that encrypted one is then bassically useless(vo dung) to change the password it's just like when we're saving only the encrypted password itself to the DB, look like when we create password we need to save it based on encrypted in DB and then when we need login we compare two version via bcrypt modules, right
};

const User = mongoose.model('User', userSchema); // use mongoose.model() is a function to create a model

module.exports = User;
