const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchSync = require('../utils/catchSync');

//<<<<<<<<<<<<<<<<<<<<<Functions of user
const getAllUsers = catchSync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});
//?>>>>>>>>>>>>>>IMPLEMENTS UPDATE CURRENT USER DATA<<<<<<<<<<<<<<<<<
// * udpateMe() only update for user(when user click on user profile and edit his profile)

//* funtion filter not allow fields like role,...., we only want fieads we sepecify
// const filterObject = (ob, ...allowFields) => {
//   Object.keys(ob).forEach(field => (allowFields.includes(field) ? '' : delete ob[field]));
//   return ob;
// };
//! this code above also not good becasue we shouldn't manipulate directly with parameter of function

//* solotion here: we should create newObject to manipulate and return this object
const filterObject = (ob, ...allowFields) => {
  const newObj = {};
  Object.keys(ob).forEach(el => {
    if (allowFields.includes(el)) newObj[el] = ob[el];
  });
  return newObj;
};

const updateMe = catchSync(async (req, res, next) => {
  //--! so we update user data in different route and different with updating the current user password
  //--> because usually that's what typical web application always does so you usually have one place where you can update your password and then another place where you can update infomation data about user or account itself. So this is popular pattern
  //!0, check password and password confirm: if user try to pass the password and password confirm to change data and get accout
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        400,
        'You cant change password in here, if you want you need go to the pricacy to change the password',
      ),
    );

  //!1, check field required
  // if (!req.body.name) return next(new AppError(400, 'Please fill your name'));
  // if (!req.body.email) return next(new AppError(400, 'Please fill your email'));
  //? two this code above in this case we must to need fill name and email, but in here we only want update and user can update the field they want update, and we will validator this

  //! we should create filterObject to do easy, if we have many fiedls we will create more code so we can create funciton and filter
  // const x = {
  //   name: req.body.name,
  //   email: req.body.email,
  //   photo: req.body.photo,
  // };
  //* filter not allow fields in request body
  const filterBody = filterObject(req.body, 'name', 'email', 'photo');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    // {
    //   name: req.body.name,
    //   photo: req.body.photo,
    // },//! we we shouldn't update all req.body because maybe in this body constain like role want as admin,..., passwordTokenExpires,... so we don't want it and we need remove all this thing, becasue this is not allow
    //* so we need filter and prevent all illeagel action
    filterBody,
    {
      new: true,
      runValidators: true, // trigged validator in schema instead we code it in here(this's only realated to  data and we don't want repeat code)
    },
  );
  // const user = await User.findById(req.user._id);
  // user.name = req.body.name;
  // user.photo = req.body.photo;

  // user.
  //!2, update current user
  // await user.save({ validateBeforeSave: false });

  //* Instead use save() we should use findByIdAndUpdate(): we don't want turn on validators in schema, our code will clear and important rhat's we don't manipulate with password like non-confidential data like name or email,because if the data is sentitive => now we need to be careful to handle that data so use save to turn on many validators in schema is good and we don't do it in controller(becasue this's only related to data)
  //!3, send res
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
const getUser = (req, res) => {};
const createUser = (req, res) => {};
const updateUser = (req, res) => {}; //! for admin can update all users
const deleteUser = (req, res) => {};

module.exports = { getAllUsers, getUser, createUser, updateUser, deleteUser, updateMe };
