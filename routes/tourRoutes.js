//!! now this is seperate with app.js fil
//!! you can say this is sub applation: tour app
//!! you can connect with app.js file by import this sub app and use it as middleware
const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// -->so you don't need check id in mongo
// router.param('id', tourController.checkId);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkReqBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updatePieceOfTour)
  .delete(tourController.deleteTour);

module.exports = router;
