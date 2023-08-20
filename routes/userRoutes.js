const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//?IMPLEMENT RESET PASSWORD
//
router.post('/forgot-password', authController.forgotPassword); //  receive the email address
//* becasue the reset password is update password so we will use patch http method
// ! and we also need params that token, and token is only for this user request this route
router.patch('/reset-password/:token', authController.resetPassword); // receive the token as well as new password

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.route('/').get(userController.getAllUsers);
// * post(userController.createUser); for admin

// router
//   .route('/:id')
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
