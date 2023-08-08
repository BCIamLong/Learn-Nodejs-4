// all thing are related to model and we will export model and import to controller to handler
const mongoose = require('mongoose');

//>>>MODELING DATA BASIC
//!WHEN WE HAVE ENGOUH REQUIRES FROM CUSTUMERS, USERS EXPERECCE, ... WE NEED DEFINE ALL COLLECTIONS, ALL FIELD OF COLLECTION TO CREATE SCHEMA FOR PER COLLECTION
//--> AND FIND ALL COLLECTIONS AND ALL FIELD FOR PER COLLECTIONS NECESSARY TO PROJECT CAN WORK GOOD THAT'S IMPORTANT
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tour name is required field'],
    unique: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have max group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  price: { type: Number, required: [true, 'Tour price is required field'] },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have an image'],
  },
  images: [String], // if you want this type is string array, number, date array you need put type inside []
  createdAt: {
    type: Date,
    default: Date.now(),
    //!BECAUSE THIS IS SENTITIVE DATA SO I DON'T WANT IT SENT TO CLIENT SO USE SELECT FALSE
    select: false,
  },
  startDates: [Date],
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
