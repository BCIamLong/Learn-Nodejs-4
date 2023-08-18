const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();
//>>>>>>>>>>>>USER RESOURCES
//* The user rss has bit different with other rss cuz it really do all thing to do with authetication as: we have the different name controller, name methods, and so we also have a special route

// ?special route: this route have special enpoint(/signup) and doesn't fit the rest architecture, so cuz in some certain we also need a special end point like get-top-3-cheap-tours,loggin, change password,.... so some endpoint maybe do not fit with the res philosophy(triet ly)
//--> we will implemants all function if user itself so it's not admin
router.post('/signup', authController.signup);
//?IMPLEMENTS USER LOGIN
router.post('/login', authController.login); //* use post method because we need pass data to check logging for user
router.get('/logout', authController.logout);

//!We also need the route code bellow  cuz some possibility of a system administrator updating or deleting or getting the user based on their id
//--> we will implemants all function if user itself so it's not admin loggin in a user instead it's only user(admin) that's going to sign up himself or log himself
router.route('/').get(userController.getAllUsers);
// * post(userController.createUser); for admin

// router
//   .route('/:id')
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
