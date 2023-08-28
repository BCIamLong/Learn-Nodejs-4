const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//* IMPLEMENTS CREATING AND GETTING REVIEW BUT IT'S MANUALLY BECAUSE WE NEED TO ENTER THE TOUR ID AND USER ID WITH OURSELF
const router = express.Router();

router.route('/').get(reviewController.getAllReviews).post(
  authController.protectManually,
  authController.restrictTo('user'), // !the admin and tour guides, lead guide don't reviews, if they want reviews maybe they need create new user account not admin and tour guide, lead guide accout because it's also belong the companny
  reviewController.createReview,
);

module.exports = router;
