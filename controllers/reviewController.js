// const mongoose = require('mongoose');
const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchSync = require('../utils/catchSync');
const handlerFactory = require('./handlerFactory');

const checkUserBooking = catchSync(async (req, res, next) => {
  const booking = await Booking.findOne({ user: req.user.id, tour: req.params.tourId });
  // const checkDate = booking > Date.now();
  if (!booking)
    return next(
      new AppError(400, 'You only review when you book this tour and complete visited this tour'),
    );
  // req.locals.booked = true;
  next();
});

//* Because in the review we need tour id to get all review of this tour so it's special case so we need to set some logic to get tour id
// ! use for WAY 1: get tour id by use middleware
const setTourIdForNestedReview = catchSync(async (req, res, next) => {
  const { tourId } = req.params;
  if (tourId) {
    const checkTour = await Tour.findById(tourId);
    if (!checkTour) return next(new AppError(404, 'No tour found with this id'));
    // const mongoId = new mongoose.Types.ObjectId(tourId);
    // console.log(mongoId);
    req.body.filter = { tour: tourId };
    //  { tour: mongoose.Schema.ObjectId(tourId) };
    return next();
  }
  req.body.filter = {};
  next();
});
//handlerFactory.getAll(Tour);
const getAllReviewsOfTour = handlerFactory.getAll(Review);
// catchSync(async (req, res, next) => {
//   //* we need to do some logic when we get all review of review collection and when we get all review of sepecific tour, because now when we use nested router for tours/reviews so it's also run in review router
//   const filter = {};
//   if (req.params.tourId) {
//     const { tourId } = req.params;
//     const checkTour = await Tour.findById(tourId);
//     if (!checkTour) return next(new AppError(400, 'Tour id invalid'));
//     filter.tour = tourId;
//   }

//   const reviews = await Review.find(filter);
//   res.json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

const getReview = handlerFactory.getOne(Review);

//* CHECK TOUR ID AND USER ID WHEN WE CREATE REVIEW BECAUSE WE USE FACTORY CREATE ONE SO IT'S LITTLE BIT DIFFERENT SO WE NEED USE MIDDLEWARE TO SUPPORT THIS
// ? and this code also doesn't related to much to review
// const setTourUserIds = catchSync(async (req, res, next) => {
//   const { tourId } = req.params;
//   if (!tourId) return next();
//   const tour = await Tour.findById(tourId);
//   if (!tour) return next(new AppError(404, 'No tour found with this id'));
//   req.body.tour = tourId;

//   req.body.user = req.user.id;
//   next();
// });

const createReviewOfTour = handlerFactory.createOne(Review);

// catchSync(async (req, res, next) => {
//   //   const idTour = req.params.id;
//   //   const idUser = req.user.id;
//   //!why did i need to check tourId because if id has format type of mongoDB it's always pass and mongo don't catch this error despite it's really wrong id
//   //* 64eb5691cf47387f36a6baa1 is true but 64eb5691cf47387f36a6baa2 is wrong id but mongo still pass it because the format is true with type of mongodb it's like error when we handle in error handler part right
//   const { tourId } = req.params;
//   const tour = await Tour.findById(tourId);
//   if (!tour) return next(new AppError(400, 'Tour id invalid'));

//   const { review, rating } = req.body;
//   const newReview = await Review.create({
//     tour: tourId,
//     user: req.user.id,
//     review,
//     rating,
//   });

//   res.status(201).json({
//     status: 'success',
//     data: {
//       reviewe: newReview,
//     },
//   });
// });

const deleteReview = handlerFactory.deleteOne(Review);

const updateReview = handlerFactory.updateOne(Review);

const getAllReviews = catchSync(async (req, res, next) => {
  const reviews = await Review.find();

  res.json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});
const createReview = catchSync(async (req, res, next) => {
  const { user, tour, rating, review } = req.body;
  const newReview = await Review.create({ user, tour, rating, review });

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

module.exports = {
  createReview,
  getAllReviews,
  getAllReviewsOfTour,
  createReviewOfTour,
  deleteReview,
  updateReview,
  // setTourUserIds,
  getReview,
  setTourIdForNestedReview,
  checkUserBooking,
};
