const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//?IMPLEMENT USER AND REVIEW DATA TO PREPARE TO TEST AND BUILD SOME FEATURE TO COMPLETED APPLICATION
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

//! NOTICE: ./ <=> LINK OF FOLDER START THIS PROJECT: C://.../natours you know if you use ../../config.env you are wating find file config.env in dev-data/data
dotenv.config({ path: `./config.env` });

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB)
  .then(() => console.log('DB connect success'))
  .catch(err => console.log(err));

const importData = async (model, data) => {
  try {
    //? because we have check password confirm in user Schema so in this case we don't need validate data so the best way to turn off this validator in Schema is use option of create() is validateBeforeSave: false like we do with save() method before
    await model.create(data, { validateBeforeSave: false });
    console.log('Import data success');
  } catch (err) {
    console.log(err);
  }
  //!NOTICE: PROCESS EXIT() IS NOT GOOD TO STOP APPLICATION, BUT IN THIS CASE WE ONLY MANIPULATE WITH CML SO THE PROPLEM IS SMALL BUT IMPACT WE SHOULDN'T USE THIS
  // process.exit();
  //-->SO BECAUSE IN THIS FILE WE ONLY RUN CONNECTION TO DATABASE AND DON'T LISTEN SERVER THEREFORE WHEN WE CLOSE SERVER WE CAN OUT OF PROCESS
  mongoose.connection.close();
};

const deleteData = async model => {
  try {
    //User Tour.deleteMany(); is delete all data in tours collection
    await model.deleteMany();
    console.log('Delete all data success');
  } catch (err) {
    console.log(err);
  }
  //!NOTICE: PROCESS EXIT() IS NOT GOOD TO STOP APPLICATION, BUT IN THIS CASE WE ONLY MANIPULATE WITH CML SO THE PROPLEM IS SMALL BUT IMPACT WE SHOULDN'T USE THIS
  // process.exit();
  //-->SO BECAUSE IN THIS FILE WE ONLY RUN CONNECTION TO DATABASE AND DON'T LISTEN SERVER THEREFORE WHEN WE CLOSE SERVER WE CAN OUT OF PROCESS
  mongoose.connection.close();
};
// deleteData();
// importData();
//!BUT KNOW WE HAVE A WAY TO SEPETIFY IN CML TO RUN deleteData() or importData()

// process.argv place constain all commands you write when you run app
//when you run: node app.js , node and app.js will store in process.argv
console.log(process.argv);
// if (process.argv[2] === '--import-user') importData(User, tours);
if (process.argv[2] === '--delete-users') deleteData(User);
if (process.argv[2] === '--import-users') importData(User, users);
if (process.argv[2] === '--import-tours') importData(Tour, tours);
if (process.argv[2] === '--delete-tours') deleteData(Tour);
if (process.argv[2] === '--import-reviews') importData(Review, reviews);
if (process.argv[2] === '--delete-reviews') deleteData(Review);
