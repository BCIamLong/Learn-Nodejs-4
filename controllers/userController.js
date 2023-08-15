const User = require('../models/userModel');
const catchSync = require('../utils/catchSync');

//<<<<<<<<<<<<<<<<<<<<<Functions of user
const getAllUsers = catchSync(async (req, res, next) => {
  const users = await User.find();

  res.status(404).json({
    status: 'success',
    data: {
      users,
    },
  });
});
const getUser = (req, res) => {};
const createUser = (req, res) => {};
const updateUser = (req, res) => {};
const deleteUser = (req, res) => {};

module.exports = { getAllUsers, getUser, createUser, updateUser, deleteUser };
