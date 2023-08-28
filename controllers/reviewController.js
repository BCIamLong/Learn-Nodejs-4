const Review = require('../models/reviewModel');
const catchSync = require('../utils/catchSync');

const getAllReviews = catchSync(async (req, res, next) => {
  const reviews = await Review.find({ tour: req.params.id });
  res.json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

const createReview = catchSync(async (req, res, next) => {
  //   const idTour = req.params.id;
  //   const idUser = req.user.id;
  const { review, rating } = req.body;
  const reviewed = await Review.create({
    tour: req.params.id,
    user: req.user.id,
    review,
    rating,
  });

  res.status(201).json({
    status: 'success',
    data: {
      reviewed,
    },
  });
});

module.exports = { createReview, getAllReviews };
