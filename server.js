//!THIS FILE WE DO ALL SET UP FOR OUR APPLICATION

//CONFIGURATION MONGO DB
const mongoose = require('mongoose');
// const { MongoClient } = require('mongodb'); connect without use mongoose

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

// CONNECT WITH MONGO DB DRIVER AND DON'T USE MONGOOSE
// const client = new MongoClient(DB);
// client
//   .connect()
//   .then(() => {
//     console.log('connect success');
//   })
//   .catch((err) => {
//     console.log(err);
//   });

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
console.log(Tour);

//use model to create new document
const testTour = new Tour({
  //this works look like class in ES6 JS
  //i created new tour(instance) from Tour model(blueprint)
  name: 'The modern tour',
  price: 2000,
  rating: 4.6,
});

//Save newdocumment to DB
//save() return promise so you can consume, cuz this is simple example of mongoDB so we can use then catch
testTour
  .save()
  .then((doc) => console.log(doc))
  .catch((err) => console.log(err));
// save new document to tour collection in DB
// moonfgodb auto create _id and __v: _id is unique identifier but __v we still handle anything about it
//?QUESTION: how mongoDB can know what's collection to add data in this case's tours
//-->well mongo has the way to know that's collection you want ask by compare with your model name, if the collection don't in DB it's auto create with your model name but it's plural name: Tour => tours

//Remember we have some validate in schema so if you add new document with invalid data it'll return error

//! 4,START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is listenning with port ${port} `);
});
