const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

//?USERS DATA MODELLING
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please fill your name'],
    // unique: true,
  },
  email: {
    // !use the email as username to loggin
    type: String,
    required: [true, 'Please fill your email'],
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
    default: 'default.jpg',
  },
  role: {
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

  passwordResetToken: String,

  passwordResetExpires: Date,
  verifyEmail: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  if (this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.passwordCorrect = async function (cadidatePassword, userPassword) {
  return await bcrypt.compare(cadidatePassword, userPassword);
};

userSchema.methods.checkPasswordChangeAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTime = Math.floor(Date.parse(this.passwordChangedAt) / 1000);

    return changedTime > JWTTimestamp;
  }

  return false;
};

//?IMPLEMENTS INSTANCE CREATE TOKEN IN RESET PASSWORD

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //* reset password in 10 minutes
  // console.log(resetToken, this.passwordResetToken);
  return resetToken;
};

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }).select('-__v');
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
