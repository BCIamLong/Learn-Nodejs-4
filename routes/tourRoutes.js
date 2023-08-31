//!! now this is seperate with app.js fil
//!! you can say this is sub applation: tour app
//!! you can connect with app.js file by import this sub app and use it as middleware
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

// router.post('/:id/reviews', authController.protectManually, reviewController.createReview);
// router.get('/:id/reviews', reviewController.getAllReviews);

router
  .route('/top-3-quality-cheap-tours')
  .get(tourController.aliasTop3CheapTours, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getTourStats);

//Bussiness problem: get busiest month of tours, in that month we have many(max) tours in a sepecify year
router
  .route('/monthly-plan/:year')
  .get(
    authController.protectManually,
    authController.restrictTo('admin', 'leading-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/')
  //get don't need any thing authorization for this get all tour because we want expose all tours as part of API to everyone
  .get(tourController.getAllTours)
  .post(
    authController.protectManually,
    authController.restrictTo('leading-guide', 'admin'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour) //.get(tourController.setReivews, tourController.getTour)
  .patch(
    authController.protectManually,
    authController.restrictTo('admin', 'leading-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protectManually,
    authController.restrictTo('admin', 'leading-guide'),
    tourController.deleteTour,
  );

module.exports = router;
