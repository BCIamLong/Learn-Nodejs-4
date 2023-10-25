const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

// * so now we will create the route for client to get a checkout session
router.get(
  '/checkout-session/:tourId',
  // ? why we need the tourId?
  // * because we also need the data tour currently booking right, and then get data of tour from this id then fill up the session with the necessary infos like tour name, price...
  authController.protectManually,
  bookingController.getCheckoutSession,
);

module.exports = router;
