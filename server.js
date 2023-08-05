//!THIS FILE WE DO ALL SET UP FOR OUR APPLICATION

//CONFIGURATION MONGO DB
const mongoose = require('mongoose');

const dotenv = require('dotenv'); //ENVIROMENT VARIABLE MAIPULATE

dotenv.config({ path: './config.env' });

const app = require('./app'); //APPLICATION

//* Connect to mongoDB
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
); //link connect to DBs

//CONNECT WITH HOSTED CLOUD DATABASE ALTAS
mongoose
  .connect(DB)
  .then(() => {
    // console.log(con.connections);
    console.log('DB connect successful');
  })
  .catch((err) => console.log(err));

//>>>>>>CREATE SIMPLE SCHEMA
// schema use to specify and decriber our data to set default, validation and so on...
// we can set type of field, better we can set schema type option for each field or some specific field
const tourSchema = new mongoose.Schema({
  // name: String,
  name: {
    type: String,
    required: [true, 'Tour name is required field'], // this is validator check name has data or not and message and in mongoose has a lot validator also we can create or own
    unique: true, // the name must be unique
  }, // this is schema type option
  //[true, 'Tour name is required field'] you can have message when error use []
  price: { type: Number, default: 4.5 },
  //?the schema option type for each fields usally maybe similar but also it's can be not similar
  rating: { type: Number, required: [true, 'Tour price is required field'] },
});

//CREATE MODEL
//model name first letter is uppercase
const Tour = mongoose.model('Tour', tourSchema); //create model based on schema
//! 4,START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is listenning with port ${port} `);
});
