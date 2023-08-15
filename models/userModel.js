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
    //*HANDLE PASSWORDCONFIRM === CONFIRM?
    validate: {
      validator: function (val) {
        //!this function only work when we use for creation ( create and save method) but if you use for update you need notice it's not work and you implements other way to confirm this two password are in the same? infact we can use save() for update that's a way to do that
        return val === this.password;
      },
      message: 'Password invalid, please enter password you just fill ',
    },
  },
});

//!ENCRYPT PASSWORD: this is useful when we use pre save hook middleware, because we can't encrypt password in schema, and we can encrypt in controller but we need to keep the bussiness logic(data) seperate with app logic
userSchema.pre('save', async function (next) {
  //?We have prolem with here: that's when we update as the user update the email and this hook(middleware) also run => it's crypt password again but we only want crypt password when we create new user, change password
  if (!this.isModified('password')) return next();
  //* isModified() is on all the document and we can check the field modify = if the password modify

  //? encrypt password we can say to hash password(hash or hashing use popuplar)
  //? and to hash the password we have a hashing algorithm called b-crypt: solved and hasing password do the pasword to strong and protect, security
  //?b-crypt will salt all password that's mean add random string to password
  //* https://bcrypt.online/

  //--> so to use b-crypt  we need install b-crypt packages on npm
  // 1, geneting the salt so that random string and added to our password and use that salt in this hash function but  instead do it
  // 2,we can pass a cost parameter that’s bassically measure  how cpu instensive this operation and the cost value is depen your cpu on your computer, more cpu use the password maybe will be better and stronger but cost is hight => the time to hash is very long
  // We have async and sync hash function: but we should use async because sync  will block event loop and can block all the user are using this application
  //* https://www.npmjs.com/package/bcrypt

  this.password = await bcrypt.hash(this.password, 12); //?cost 12 is enough to do password strong and also don't lost more time to hash password(if you want stronger than you can change higher const but it's lost more time)
  // this.passwordConfirm = await bcrypt.hash(this.passwordConfirm, 12);
  // ! so this time we don't need the password comfirm in our application because it's not nessecary
  // delete this.passwordConfirm;
  //* you can use:
  this.passwordConfirm = undefined; // we can remove the field in mongo if it's not exits => set undefined
  // --> this password confirm only for confirm user fill password again true?
  //! --> required is for schema check required input not required for save value to database

  //* ==> SO NOW WE SAVED THE SECURE PASSWORD TO DATABASE, YOU CAN SEE THE PASSWORD IS DEFIRENT WHEN SAVE DATABASE AND IT'S POWER SALTING THE PASSWORD BEFORE HASHING IT
  //* SO USE PRE SAVE HOOK(MIDDEWARE) MONGOOSE AND B-CRYPT ALGORITHM IS A GOOD WAY TO MANAGE PASSWORD
  next();
});

const User = mongoose.model('User', userSchema); // use mongoose.model() is a function to create a model

module.exports = User;
