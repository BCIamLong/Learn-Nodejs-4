const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
// const User = require('../models/userModel');
const catchSync = require('../utils/catchSync');
// const jwt = require('jsonwebtoken');

const updateUserData = catchSync(async (req, res, next) => {
  // console.log(req.body);
  const { email, name } = req.body;
  // * we can also use findByIdAndUpdate with req.user.id
  const user = await User.findOne({ email });
  if (!user) return next(new AppError(400, 'Please enter the correct data'));

  user.email = email;
  user.name = name;
  await user.save({ validateBeforeSave: false });

  // * we can use render or redirect
  // res.status(200).render('account', { user });
  res.redirect('me');
});

const getAccount = (req, res) => {
  res.status(200).render('account');
};

const getLoginForm = (req, res) => {
  res.status(200).render('login');
};

const getSignupForm = (req, res) => {
  res.status(200).render('signup');
};

const getHomepage = (req, res) => {
  res.status(200).render('base', {
    tour: 'The Amazing tour',
    user: 'longhoang',
  });
};

const getOverview = catchSync(async (req, res, next) => {
  //1 get tours data from collection
  const tours = await Tour.find();
  // console.log(tours);
  //2 building template for tour card
  //3 render tour card template with tour data
  // const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
  // const user = await User.findById(decoded.id);
  // console.log(user);
  res.status(200).render('overview', { title: 'All tours', tours });
});

const getTour = catchSync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate('reviews');
  // const tour = await Tour.findOne({ slug: req.params.slug }).populate({
  //   path: 'reviews',
  //   fields: 'review rating user',
  // });
  // console.log(req.cookies);
  if (!tour) return next(new AppError(404, 'No tour found'));
  res.status(200).render('tour', { tour });
});

module.exports = {
  getHomepage,
  getOverview,
  getTour,
  getLoginForm,
  getSignupForm,
  getAccount,
  updateUserData,
};
