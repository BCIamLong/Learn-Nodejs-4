const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

//<<<<<<<<<<<<<<<<<<<<<Functions of user
const getAllUsers = (req, res) => {
  if (!tours)
    return res.status(404).json({
      status: 'Fails',
      message: 'Users data not found',
    });
};
const getUser = (req, res) => {};
const createUser = (req, res) => {};
const updateUser = (req, res) => {};
const deleteUser = (req, res) => {};

module.exports = { getAllUsers, getUser, createUser, updateUser, deleteUser };
