const Tour = require('../models/tourModel');
const catchSync = require('../utils/catchSync');

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
  res.status(200).render('overview', { title: 'All tours', tours });
});

const getTour = catchSync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate('reviews');
  // const tour = await Tour.findOne({ slug: req.params.slug }).populate({
  //   path: 'reviews',
  //   fields: 'review rating user',
  // });

  res.status(200).render('tour', { tour });
});

module.exports = { getHomepage, getOverview, getTour, getLoginForm, getSignupForm };
