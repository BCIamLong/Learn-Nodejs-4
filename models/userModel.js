const mongoose = require('mongoose');
const validator = require('validator');

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
    unique: true,
    minLength: [8, 'Password need at least 8 characters'], //!but we also have many rules for password as at least one number, letter, character, special chracter, symbol... but maybe it's not strict, security more cuz usually the best password is the longest ones and not password have crazy symbol, character,... and all that
    //* --> we also set specifics fields for password in manage password in the database
  },
  photo: {
    type: String,
    // required: [true, 'User must have a photo'],phôt not required, because when the first time you register you don't need choose photo(it's in the most applications, webs,...) and then when user logging user cna change the default photo
    // default: do we need to set default? maybe need or not it's depen to you
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Pls confirm your password'],
    //*and to confirm the passowrd confirm maybe we need the validate to compare two password
  },
});

const User = mongoose.model('User', userSchema); // use mongoose.model() is a function to create a model

module.exports = User;
