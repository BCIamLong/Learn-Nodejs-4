const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const handlerFactory = require('../controllers/handlerFactory');

const router = express.Router({ mergeParams: true });

router.use(authController.protectManually);

// * so now we will create the route for client to get a checkout session
router.get(
  '/checkout-session/:tourId',
  // ? why we need the tourId?
  // * because we also need the data tour currently booking right, and then get data of tour from this id then fill up the session with the necessary infos like tour name, price...
  bookingController.getCheckoutSession,
);

router.post(
  '/',
  authController.restrictTo('user'),
  handlerFactory.setTourUserIds,
  bookingController.createBooking,
);

// * in this case we only allow the lead guide is watch tour is booking and the admin for watch, update and delete
router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/').get(bookingController.getAllBookings);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

// router.get('/', bookingController.createBookingCheckout);

module.exports = router;
