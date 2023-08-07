const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('../../models/tourModel');

//! NOTICE: ./ <=> LINK OF FOLDER START THIS PROJECT: C://.../natours you know if you use ../../config.env you are wating find file config.env in dev-data/data
dotenv.config({ path: `./config.env` });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`));

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => console.log('DB connect success'))
  .catch((err) => console.log(err));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Import data success');
  } catch (err) {
    console.log(err);
  }
  //!NOTICE: PROCESS EXIT() IS NOT GOOD TO STOP APPLICATION, BUT IN THIS CASE WE ONLY MANIPULATE WITH CML SO THE PROPLEM IS SMALL BUT IMPACT WE SHOULDN'T USE THIS
  // process.exit();
  //-->SO BECAUSE IN THIS FILE WE ONLY RUN CONNECTION TO DATABASE AND DON'T LISTEN SERVER THEREFORE WHEN WE CLOSE SERVER WE CAN OUT OF PROCESS
  mongoose.connection.close();
};

const deleteData = async () => {
  try {
    //User Tour.deleteMany(); is delete all data in tours collection
    await Tour.deleteMany();
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
if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();
