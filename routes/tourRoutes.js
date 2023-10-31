//!! now this is seperate with app.js fil
//!! you can say this is sub applation: tour app
//!! you can connect with app.js file by import this sub app and use it as middleware
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRouter');
const bookingRouter = require('./bookingRouter');
const bookmarkROuter = require('./bookmarkRouter');

const router = express.Router();

//?IMPLEMENTS ROUTER GEOSPATIAL QUERIES FINDING TOURS WITHIN RADIUS
// *Use geospatial queries to implements seach functionality for tour within a certain distance of sepecified point
// *For example: you live in certain point and wanna know which tour start at a certain distance from you like 250 miles because you don’t drive futher than that in order start your tour experience
// *So this’s really nice use case of geospatial queries
// ---distance is distance from your live point to tours
// ---center is the point where you lived
// ---latlng is basically coordinates of the place where you are
// ---unit is unit of distance kilometers or miles
//? so why we put all parameters on URL? of course we can make it so that user should specify all these option using query string but this way looks way cleaner and it's also kind of a standard way of specifying URLs which contain a lot of option
//--!1, user should specify all these option using query
//!: /tours-within?distance=100&center=-56,15&unit=km

//--!2,use more options URL
//!: /tours-within/100/center/-56,15/unit/km
//* and this way look cleaner right, and it's also a standard of specifying URLs more options like this

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

//* IMPLEMENTS GEOSPATIAL AGGREGATION CACULATING DISTANCE
// --! now we're not searching for certain radius, we're really calculate the distance from a certain point to all the tours that we have in collenction in DB
//!https://www.mongodb.com/docs/manual/reference/operator/aggregation/geoNear/
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.use('/:tourId/bookmarks', bookmarkROuter);
router.use('/:tourId/reviews', reviewRouter);
router.use('/:tourId/bookings', bookingRouter);

// router.post('/:id/reviews', authController.protectManually, reviewController.createReview);
// router.get('/:id/reviews', reviewController.getAllReviews);

router
  .route('/top-3-quality-cheap-tours')
  .get(tourController.aliasTop3CheapTours, tourController.getAllTours);
router.route('/tours-stats').get(tourController.getTourStats);
router.route('/').get(tourController.getAllTours);
router.route('/:id').get(tourController.getTour);

router.use(authController.protectManually); //!

//Bussiness problem: get busiest month of tours, in that month we have many(max) tours in a sepecify year
router
  .route('/monthly-plan/:year')
  .get(authController.restrictTo('admin', 'leading-guide', 'guide'), tourController.getMonthlyPlan);

router.use(authController.restrictTo('admin', 'leading-guide')); //!

router
  .route('/')
  //get don't need any thing authorization for this get all tour because we want expose all tours as part of API to everyone
  .post(tourController.createTour);
router
  .route('/:id')
  //.get(tourController.setReivews, tourController.getTour)
  .patch(
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(tourController.deleteTour);

module.exports = router;
