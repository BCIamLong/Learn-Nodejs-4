const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//* IMPLEMENTS nested router with avanced express feature called: merge params
//! because we have code: router.use('/:tourId/reviews', reviewRouter); in tour route and by default each router obly has access to parameter of their sepecific routes
//!--> so now how can we access to tourId param from review route because it's totaly different router
//*--> so we will use merge params of Express to solve this problem
const router = express.Router({ mergeParams: true }); // mergeParams: true help we can access param with different the router
//get(reviewController.setTourIdForNestedReview, reviewController.getAllReviewsOfTour) use for //!WAY 1: get tour id with middleware
router.route('/').get(reviewController.getAllReviewsOfTour).post(
  authController.protectManually,
  authController.restrictTo('user'), // !the admin and tour guides, lead guide don't reviews, if they want reviews maybe they need create new user account not admin and tour guide, lead guide accout because it's also belong the companny
  reviewController.setTourUserIds,
  reviewController.createReviewOfTour,
);

router
  .route('/:id')
  .get(reviewController.updateReview)
  .patch(
    authController.protectManually,
    authController.restrictTo('user'),
    reviewController.updateReview,
  )
  .delete(
    authController.protectManually,
    authController.restrictTo('admin'),
    reviewController.deleteReview,
  );

module.exports = router;
