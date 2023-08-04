const express = require('express');
const fs = require('fs');
const userRouter = require('./../controllers/userController');
// const {
//   getAllUsers,
//   getUser,
//   createUser,
//   updateUser,
//   deleteUser,
// } = require('./../controllers/userController');

//>>>>>>>>>>>>IMPLEMENT USERS RESOURCES
const router = express.Router();
router.route('/').get(userRouter.getAllUsers).post(userRouter.createUser);

router
  .route('/:id')
  .get(userRouter.getUser)
  .patch(userRouter.updateUser)
  .delete(userRouter.deleteUser);

module.exports = router;
