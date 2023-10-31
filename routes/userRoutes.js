const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const bookingRouter = require('./bookingRouter');
// !https://www.npmjs.com/package/multer
// * we will config multer upload with couple settings
// const upload = multer({ dest: 'public/img/users' }); //* dest stand for destination(diem den)
// * destination is the folder where we want to save all the images that are being uploaded
// * and public/img/users is place contain all images from our users in DB right
// ! we can also config complex like for many upload images not only for user like for tour images...
// ? we also can use multer() without any options then the upload images would simply be stored in memory and not saved anywhere to the disk => that's not what we want
// * so therefore we need to specify the destination to upload images can be storage in our file system
// ! the images are not directly uploaded into the database we just upload them into out file system and then in the database we put the link to that image
// * so in this case in each user document we will have the name of the uploaded file

const router = express.Router(); // router is also mini app(app = express()) so it's also use app.use()

//?IMPLEMENTS FIX MISSING AUTHETICATION AND AUTHORIZATION FOR USER

//! Every thing you write in routers part you need to confict all on postman, for example if you have authetication or authorization you also need turn on authorication part in postman
//! And every thing you should do it on postman, why? Because later when we complete the API we can use this postman for write API so if postman be design good and conflict all thing to application it’s goo for write documents for API

router.use('/:userId/bookings', bookingRouter);

//* we will move all route don't need login or authorization to top
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

//* so now we can use a common middleware for this all tour need to login, so because the middleware run step by step so we can put and sort it with logical way

//* with all tour bellow we also need check login so we can use one middleware to do it instead many middeleware on per request
router.use(authController.protectManually); //! check logged in, protec all router after this middleware
//? so all the router bellow since here must to logged in to get access

router.get('/two-factor-generate', authController.generate2FA);
router.post('/two-factor-verify', authController.verify2FA);

// * now we will use upload multer to create middleware and add this middleware to stack endpoint we want to upload image in this case that's update me right
router
  .route('/me')
  .get(userController.getMe, userController.getUser) //.get(authController.protectManually, userController.getMe)
  // * why we use single() well that because we only want to update one single image, then in this method we will pass the name of the field that is going to hold the image to upload
  // ! notice that the field here must be in the same name with the field we have in the form we upload the image like photo..., and if it's different then upload file will fail
  // * so now this middleware will take care of taking the file and basically copying it to the destination that we specified, then will run the after middleware in stack as normal
  // * and this middleware also will put the file or at least some information about the file on the request object
  .patch(userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe)
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
