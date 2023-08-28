const Review = require('../models/reviewModel');
const catchSync = require('../utils/catchSync');

const getAllReviewsOfTour = catchSync(async (req, res, next) => {
  const reviews = await Review.find({ tour: req.params.id });
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
  const { review, rating } = req.body;
  const newReview = await Review.create({
    tour: req.params.id,
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
module.exports = { createReview, getAllReviews, getAllReviewsOfTour, createReviewOfTour };
