//!! now this is seperate with app.js fil
//!! you can say this is sub applation: tour app
//!! you can connect with app.js file by import this sub app and use it as middleware
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

//*IMPLEMENTS NESTED ROUTES WITH AVANCED EXPRESS FEATURE: MERGE PARAMS

//so we have review in tour because we need tour id for implements review and review also belong to tour becaue when we click to tour we always see reviews in reviews feature right
//! but now the problem is the our code is a bit messy(lon xon) because we put the review controller to the tour route and it can create some confusing between tour and review, and in review route we also have code for route create review /reviews right and the code is also repeat
//! if the code repeat but maintain two different place so when we want change anything we must change two place and it's also bad in here
// router
//   .route('/:tourId/reviews') //--! so to clean we should call id of tour is tourId
//   .get(reviewController.getAllReviewsOfTour)
//   .post(
//     authController.protectManually,
//     authController.restrictTo('user'),
//     reviewController.createReviewOfTour,
//   );

//* so now we basically say this tour router should use review router in case it ever encounters a route like this
//?the router here just is a middleware and so we can use use() method on it if we have link like this we user review router
// * like this we tour router and review router nicely seperated and decoupled from one another
router.use('/:tourId/reviews', reviewRouter);

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
  .patch(
    authController.protectManually,
    authController.restrictTo('admin'),
    tourController.updateTour,
  )
  .delete(
    authController.protectManually,
    authController.restrictTo('admin', 'leading-guide'),
    tourController.deleteTour,
  );

module.exports = router;
