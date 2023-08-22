const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//?IMPLEMENTS UPDATE CURRENT USER DATA
//!authController.protectManually will check user login with JWT valid or invalid? if user pass this protect check id from user and pass it to JWT and send, because you can't change id cuz you don't have jwt sceret => id is security that's mean now user data is security but maybe we can still get attack from hacker but it's special case
router.patch('/update-me', authController.protectManually, userController.updateMe);

//?IMPLEMENT RESET PASSWORD
//
router.post('/forgot-password', authController.forgotPassword); //  receive the email address
//* becasue the reset password is update password so we will use patch http method
// ! and we also need params that token, and token is only for this user request this route
router.patch('/reset-password/:token', authController.resetPassword); // receive the token as well as new password

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

//*IMPLEMENTS UPDATE PASSWORD
//--> In case user want update password without forgot password like user feel this password not strong and want update, user doubt that the account get other access so want change password to protect account,…

router.patch(
  '/update-current-password',
  //!you need check login, if user logged in user just have permisson update password, and we also need the user data in req to perform updatePasssword function
  authController.protectManually,
  authController.updatePassword,
);

router.route('/').get(userController.getAllUsers);
// * post(userController.createUser); for admin

// router
//   .route('/:id')
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
