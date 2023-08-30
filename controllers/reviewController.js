const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchSync = require('../utils/catchSync');
const handlerFactory = require('./handlerFactory');

const getAllReviewsOfTour = catchSync(async (req, res, next) => {
  //* we need to do some logic when we get all review of review collection and when we get all review of sepecific tour, because now when we use nested router for tours/reviews so it's also run in review router
  const filter = {};
  if (req.params.tourId) {
    const { tourId } = req.params;
    const checkTour = await Tour.findById(tourId);
    if (!checkTour) return next(new AppError(400, 'Tour id invalid'));
    filter.tour = tourId;
  }

  const reviews = await Review.find(filter);
  res.json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

const createReviewOfTour = catchSync(async (req, res, next) => {
  //   const idTour = req.params.id;
  //   const idUser = req.user.id;
  //!why did i need to check tourId because if id has format type of mongoDB it's always pass and mongo don't catch this error despite it's really wrong id
  //* 64eb5691cf47387f36a6baa1 is true but 64eb5691cf47387f36a6baa2 is wrong id but mongo still pass it because the format is true with type of mongodb it's like error when we handle in error handler part right
  const { tourId } = req.params;
  const tour = await Tour.findById(tourId);
  if (!tour) return next(new AppError(400, 'Tour id invalid'));

  const { review, rating } = req.body;
  const newReview = await Review.create({
    tour: tourId,
    user: req.user.id,
    review,
    rating,
  });

  res.status(201).json({
    status: 'success',
    data: {
      reviewe: newReview,
    },
  });
});

const deleteReview = handlerFactory.deleteOne(Review);

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
};
