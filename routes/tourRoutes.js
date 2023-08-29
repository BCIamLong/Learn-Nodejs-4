//!! now this is seperate with app.js fil
//!! you can say this is sub applation: tour app
//!! you can connect with app.js file by import this sub app and use it as middleware
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

//*IMPLEMENTS NESTED ROUTES IN EXPRESS
// --- so it might litle bit weight when we use reviewController in tourRoute because we need id tour so we need go though tour router and it's must to implements like this in this case but we can fix that by use some features of express

router
  .route('/:tourId/reviews') //--! so to clean we should call id of tour is tourId
  .get(reviewController.getAllReviewsOfTour)
  .post(
    authController.protectManually,
    authController.restrictTo('user'),
    reviewController.createReviewOfTour,
  );
// router.post('/:id/reviews', authController.protectManually, reviewController.createReview);
// router.get('/:id/reviews', reviewController.getAllReviews);

router
  .route('/top-3-quality-cheap-tours')
  .get(tourController.aliasTop3CheapTours, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getTourStats);

//Bussiness problem: get busiest month of tours, in that month we have many(max) tours in a sepecify year
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protectManually, tourController.getAllTours)
  .post(authController.protectManually, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protectManually, tourController.updateTour)
  .delete(
    authController.protectManually,
    authController.restrictTo('admin', 'leading-guide'),
    tourController.deleteTour,
  );

module.exports = router;
