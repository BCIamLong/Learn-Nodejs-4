//!! now this is seperate with app.js fil
//!! you can say this is sub applation: tour app
//!! you can connect with app.js file by import this sub app and use it as middleware
const express = require('express');
const tourController = require('./../controllers/tourController');
//--> you can use destructor object to do it
// const {
//   getAllTours,
//   getTour,
//   createTour,
//   deleteTour,
//   updatePieceOfTour,
// } = require('./../controllers/tourController');

//>>>>>>>>>>>>IMPLEMENT TOURS RESOURCES
// name simple because you can see this file is tourRouter
const router = express.Router();

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updatePieceOfTour)
  .delete(tourController.deleteTour);

module.exports = router;
