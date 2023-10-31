const Booking = require('../models/bookingModel');
const Bookmark = require('../models/bookmarkModel');
const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
// const User = require('../models/userModel');
const catchSync = require('../utils/catchSync');
// const jwt = require('jsonwebtoken');

const getMyReviews = catchSync(async (req, res, next) => {
  const reviews = await Review.find({ user: res.locals.user.id });
  const tourPromises = reviews.map(review => Tour.findById(review.tour));
  const tours = await Promise.all(tourPromises);

  res.render('myReviews', { reviews, tours });
});

const getMyFavoriteTours = catchSync(async (req, res, next) => {
  const bookmarks = await Bookmark.find({ user: res.locals.user.id });

  res.render('myFavoriteTours', { bookmarks });
});

const getSignupVerify = (req, res) => {
  res.render('signupVerify');
};

const checkAlert = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert = `Your ${alert} was successful, please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later. `;
  // * because the webhook check and post request to our endpoint maybe take the time longer the time redirect to the success URL
  // * and when payment successful we will redirect to success URL and that time the checkout.session.completed is trigger this action might take a long time right because it post request then check and add data to DB
  // * so therefore it might not complete immediately, and we need to tell our customer about that

  // ! notice that we can also use this check for other endpoint by use other ? alert query, and we will create case when we needed
  // if(alert === 'favorite') ....
  // console.log(res.locals.alert);
  next();
};

const getMyTours = catchSync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user });

  // ! notice that we can use book.tour or book.tour.id, cuz with populate we can use the original value that's tourId and the populate value that tour{id...} okay
  // * if we use book.tour like id value like in findById(), in map(), forEach() it will auto understand that tourId
  // * way1:
  // const tours = await Promise.all(bookings.map(book => Tour.findById(book.tour)));
  // * way2:
  const tourIds = bookings.map(book => book.tour);
  // * so $in is option that find tour with _id has value in tourIds array
  // !https://www.mongodb.com/docs/manual/reference/operator/query/in/
  const tours = await Tour.find({ _id: { $in: tourIds } });

  // * we also can create our page booking with cards contain some relevant information from this bookings
  res.status(200).render('myTours', { tours });
});

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

const setVerifyEmail = catchSync(async (req, res, next) => {
  if (!req.query.verifyEmail) return res.redirect('/');
  const user = await User.findById(res.locals.user.id);
  user.verifyEmail = true;
  await user.save({ validateBeforeSave: false });

  res.redirect('/');
});

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
  const booking = await Booking.findOne({ user: res.locals.user?.id, tour: tour.id });
  const bookmark = await Bookmark.findOne({ user: res.locals.user?.id, tour: tour.id });
  if (booking) res.locals.booked = true;
  if (bookmark) res.locals.bookmarked = bookmark.id;
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
  getMyTours,
  checkAlert,
  setVerifyEmail,
  getSignupVerify,
  getMyFavoriteTours,
  getMyReviews,
};
