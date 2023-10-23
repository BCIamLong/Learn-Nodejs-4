const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchSync = require('../utils/catchSync');
const handlerFactory = require('./handlerFactory');

// const upload = multer({ dest: 'public/img/users' });

// * create multer storage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// ! edit config multer storage to memory storage not disk storage because after that we need to resize the image
// * and now this image will storage as buffer
const multerStorage = multer.memoryStorage();

// * create multer filter
const multerFilter = (req, file, cb) => {
  // * the goal of this function is basically to test if the uploaded is an image
  // * if it is file we return true, and if it's false we return false along with error
  // ? we can also use this for check CSV, docx, PDF,... all the type of files we allow users uploaded
  if (file.mimetype.startsWith('image')) return cb(null, true);

  cb(new AppError(400, 'Please only upload image file!'), false);
};

// ! now we have multer storage and multer filter now the time we will us them in order to create upload

const upload = multer({
  // * we also can put all the code in here but it's not good we need to separate for our code clean
  storage: multerStorage,
  fileFilter: multerFilter,
});

// * we can also choose storage files in memory as buffer, then use it later by use process
// * but now we will storage it in our file system

// * we should put the multer upload function in here for our code clean and nice
const uploadUserPhoto = upload.single('photo');
// * and to to configure multer upload to our need we need to create one multer storage and one multer filter and then we will use that storage and a filter to then create the upload from uploadUserPhoto()

// * create resize image middleware to handle when user upload image not square
const resizeUserPhoto = catchSync(async (req, res, next) => {
  if (!req.file) return next();
  // * now to resize image we will use the sharp package
  //  * when doing this image processing like this right uploading the file then it always best to not even save the file to the disk but instead save it in memory
  // * and to do that we need to change something in multer storage configuration
  // * with this way it'll more efficient, instead write the file in the disk and then in here we read it again
  // * we simply keep the image basically in memory and then here we can read that
  // * sharp method return object so therefore we can chaining method() to perform image processing
  // ! https://sharp.pixelplumbing.com/api-resize
  // * then we will specify the type of image we will convert
  // * then we can compress the image file with decrease the quality
  // * then we will write the file to the disk with toFile() and usually we need include the entire file in this function
  // req.file.filename = `user-${req.user.id}-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; //! we don't need to use the code above because now the image we define is jpeg toFormat('jpeg') so we don't need it
  // ? so why we need to do it like this?
  // * well now we storage in memory as buffer and the file name would not get set like we did when we storage in disk so therefore we need to storage in here, because after we need to use this req.file.filename for other middleware
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

//?IMPLEMENTS GET CURRENT USER
//* so in this case we need the current id user form logged it not id from req.params.id so we need set some logic to do it but getOne function must to user for many resources
//*Way 1: use middleware to do it, and use this middleware with getUser
const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//*Way 2: do it inside getOne function and assign to getMe
// const getMe = handlerFactory.getOne(User);
//<<<<<<<<<<<<<<<<<<<<<Functions of user
const getAllUsers = handlerFactory.getAll(User);
// catchSync(async (req, res, next) => {
//   const users = await User.find(); //find({ active: true }); //! to filter all not active users but we should do all place we use find methods instead one in here, so to do that we use: query pre hooks find in user model

//   res.status(200).json({
//     status: 'success',
//     data: {
//       users,
//     },
//   });
// });
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
  // console.log(req.file);
  // console.log(req.body);

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
  if (req.file) req.body.photo = req.file.filename;
  const filterBody = filterObject(req.body, 'name', 'email', 'photo');

  const user = await User.findByIdAndUpdate(
    req.user.id,
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

//? IMPLEMENTS DELETE CURRENT USER: USER DELETED HIS ACCOUT WITH HISSELF

const deleteMe = catchSync(async (req, res, next) => {
  //the goal is update the active field to false
  //1, check fill password and confirm to delete

  //2, delete(upate active to false)
  await User.findByIdAndUpdate(req.user.id, { active: false });
  //3, send res
  res.status(204).json({
    status: 'success',
    data: null,
  });
  //! --> so we don't really delete user from DB, but now user can't use to access anywhere, so it still fine to use DELETE http method here
});

const getUser = handlerFactory.getOne(User);
const createUser = handlerFactory.createOne(User);

//!remember that admin doesn't change password right,he only changes infor of user and if he tries to change it's also not work because we user findByIdAndUpdate() to update so it's not run pre save hook(middleware) so password can't change in this case
const updateUser = handlerFactory.updateOne(User); //* DO NOT UPDATE USER PASSWORD
//! for admin can update all users

//!Only admin can delete user, and remember user can delete with himself but it's not really delete user this's only turn active to false right, so only Admin can delete user
const deleteUser = handlerFactory.deleteOne(User);

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
};
