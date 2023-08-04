const express = require('express');
const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//<<<<<<<<<<<<<<<<<<<<<Functions of user
const getAllUsers = (req, res) => {};
const getUser = (req, res) => {};
const createUser = (req, res) => {};
const updateUser = (req, res) => {};
const deleteUser = (req, res) => {};

//>>>>>>>>>>>>IMPLEMENT USERS RESOURCES
const router = express.Router();
router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
