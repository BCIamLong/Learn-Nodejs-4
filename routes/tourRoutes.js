//!! now this is seperate with app.js fil
//!! you can say this is sub applation: tour app
//!! you can connect with app.js file by import this sub app and use it as middleware
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

// -->so you don't need check id in mongo
// router.param('id', tourController.checkId);

//Alias route: top-3-quality-cheap-tours
// router
//   .route('/top-3-quality-cheap-tours')
//   .get(tourController.getTop3CheapTours);
router
  .route('/top-3-quality-cheap-tours')
  .get(tourController.aliasTop3CheapTours, tourController.getAllTours);

//Tour statistics route: we shouldn't set /get-tours-stats because we have get is http verbs => tours-stats(good)
router.route('/tours-stats').get(tourController.getTourStats);

//Bussiness problem: get busiest month of tours, in that month we have many(max) tours in a sepecify year
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

//! WE ALSO CAN USE THE asyncCatch() in here insteand do in controller: asyncCatch(tourController.getAllTours) but the result is the same and maybe in this case when we have the sync function we need to remember or know what the method is sync or async cuz if it's sync you use asyncCatch(syncFuntion) => not working and even it's not anoucce your error so it's really hard to find so you should use it in controller

//* So we will use authetication protect to check the user has the valid token to access this route
router
  .route('/')
  .get(authController.protectManually, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
