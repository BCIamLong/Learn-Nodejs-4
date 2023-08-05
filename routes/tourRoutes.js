//!! now this is seperate with app.js fil
//!! you can say this is sub applation: tour app
//!! you can connect with app.js file by import this sub app and use it as middleware
const express = require('express');
const tourController = require('../controllers/tourController');
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

//>>>>>>>>>>>>>>>>>>>>>>>>CREATE PARAM MIDDLEWARE<<<<<<<<<<<<<<<<<<<<<<<<<<<
// ---parammidlleware is only run for certain parameters in url(url has param)
// ---for example we have id in url of tours and users

//--> this is a param middleware function
//---(name_pram, (request, respose, nextFuntion, valueOfPram)=>{
//--> this format of param middleware
// })
// --> and of course this param middleware only apply for tourRouter and indeed in local mini application
// --> each routers is a sub application for each resources
// router.param('id', (req, res, next, val) => {
//   console.log(`Tour id is ${val}`);
//--> of course this is also a part of middleware start
//   next(); //very important, if you don't have this middleware stack will be stuck
// });
router.param('id', tourController.checkId); // !! this validation(id) data before you actually go to tour controller and update controller
// !! so it's a one part in our pipelin middleware
// !! you can also image that we create checkId() and call in per function handle tour but it's go opposite with express
//!! -->EXPRESS ALWAYS WORK WITH THE MIDDLEWARE STACK WITH THIS PINEPLINE AS MUCH AS WE CAN
// * FUNTIONS HANDLE DON'T NEED CARE ABOUT VALIDATION AND FOCUS HANDLE MAIN WORK
//--> THAT HOW EXPRESS APP WORK

//--->create checkReqBody for post request
//!!HOW TO RUN MUTILPE MIDDLEWARE: post(tourController.checkReqBody, tourController.createTour);
// --> THE MIDDLEWARE BEFORE WILL RUN THE FIRST NOTICE THAT(VERY IMPORTANT) BECAUSE ORDER IN MIDDLEWARE IS IMPORTANT

//? so in real project we use mupilte many time as we check user logging, check user has permission to buy something, to create new tours,....
// --> so you need use mupilte middleware more time but NOTICE THE ORDER OF THEM BECAUSE IT'S VERY IMPORTANT IN MIDDLEWARE STACK , AND IF YOU PUT IT AFTER ENPOIT(ROUTE, CONTROLLER) MAYBE IT'LL NOT WORKING AS YOU WANT
//--> WE CHECK ALL LOGIC BEFORE WE CREATE NEW TOUR
// ? And you can't put middleware out side post method why? because maybe it's effect to another route not only post so mupilte very important, it's can use middlewares for one certian route
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
