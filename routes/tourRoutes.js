//!! now this is seperate with app.js fil
//!! you can say this is sub applation: tour app
//!! you can connect with app.js file by import this sub app and use it as middleware
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.route('/:id/reviews').get(reviewController.getAllReviewsOfTour).post(
  authController.protectManually,
  authController.restrictTo('user'), // !the admin and tour guides, lead guide don't reviews, if they want reviews maybe they need create new user account not admin and tour guide, lead guide accout because it's also belong the companny
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

//!PROTECT IS CHECK USER LOGGED IN ?
//? AND NOW WE WILL CHECK WHEN USER/ADMIN LOGGED IN WHAT CAN THEY DO? WELL IT'S BASSICALLY THEIR ROLE, SO WE WILL WRITE MIDDLEWARE(RESTRICT FUNCTION) TO CHECK ROLE
router
  .route('/')
  .get(authController.protectManually, tourController.getAllTours)
  .post(authController.protectManually, tourController.createTour);

//* so we will use function restrictTo('') and pass some user role which will be authorized to interact with this resources for example, user, guide, leading-guide, admin,... and roles can different with other application
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protectManually, tourController.updateTour)
  .delete(
    //!we also need to check if user/admin login
    authController.protectManually,
    //!only admin and leading-guide can delete data(you can set more it's depen on your application)
    authController.restrictTo('admin', 'leading-guide'),
    //! only roles we sepecify can perform this action( delete action)
    //* --> if the user request pass thought two middleware above now they have permission to do this action
    tourController.deleteTour,
  );

module.exports = router;
