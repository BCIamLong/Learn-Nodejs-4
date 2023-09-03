const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router(); // router is also mini app(app = express()) so it's also use app.use()

//?IMPLEMENTS FIX MISSING AUTHETICATION AND AUTHORIZATION FOR USER

//! Every thing you write in routers part you need to confict all on postman, for example if you have authetication or authorization you also need turn on authorication part in postman
//! And every thing you should do it on postman, why? Because later when we complete the API we can use this postman for write API so if postman be design good and conflict all thing to application it’s goo for write documents for API

//* we will move all route don't need login or authorization to top
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

//* so now we can use a common middleware for this all tour need to login, so because the middleware run step by step so we can put and sort it with logical way

//* with all tour bellow we also need check login so we can use one middleware to do it instead many middeleware on per request
router.use(authController.protectManually); //! check logged in, protec all router after this middleware
//? so all the router bellow since here must to logged in to get access

router
  .route('/me')
  .get(userController.getMe, userController.getUser) //.get(authController.protectManually, userController.getMe)
  .patch(userController.updateMe)
  .delete(userController.deleteMe);

router.delete('/delete-me', userController.deleteMe);

router.patch('/update-me', userController.updateMe);

router.get('/logout', authController.logout);

router.patch(
  '/update-current-password',

  authController.updatePassword,
);

//? Check for only Admin router
router.use(authController.restrictTo('admin')); //!authorization admin: only admin can perform all routers after this middleware

router.route('/').get(userController.getAllUsers).post(userController.createUser);
// * post(userController.createUser); for admin

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
