const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const handlerFactory = require('../controllers/handlerFactory');

//* IMPLEMENTS MISSING AUTHETICATION AND AUTHORIZATION FOR REVIEW

//! authetication is related to like check login,....
//! authorization is related to  authorize for user or admin can perform any features
const router = express.Router({ mergeParams: true });

//* so we don't want anyone who is not autheticated to get, post, update, delete reviews
router.use(authController.protectManually);
//* so now if not autheticated wanna get access to watch review maybe they will go to getTour and getAllTour but in here they can watch some review if they want watch paticular review or all review they also need to login to autheticated

//! admin, lead-guide and guide don't review tour why? because they is people in companny so it's wreid if they can review tour,(maybe if they can, they also reivew with good way, if bad way maybe they can be fired :))
router
  .route('/')
  .get(reviewController.getAllReviewsOfTour)
  .post(
    authController.restrictTo('user'),
    reviewController.checkUserBooking,
    handlerFactory.setTourUserIds,
    reviewController.createReviewOfTour,
  );

router.route('/:id').get(reviewController.getReview);

//* admin also can update and delete review because they need to control and manage the application, for example if someone review with rude way and not good the admin can edit or delete this review,...
//?lead-guide and guide don't do this because their work is guides tour and don't manage the application it's only for admin
router.use(authController.restrictTo('user', 'admin'));

router.route('/:id').patch(reviewController.updateReview).delete(reviewController.deleteReview);

module.exports = router;
