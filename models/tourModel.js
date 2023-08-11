// all thing are related to model and we will export model and import to controller to handler
const mongoose = require('mongoose');

//>>>MODELING DATA BASIC
//!WHEN WE HAVE ENGOUH REQUIRES FROM CUSTUMERS, USERS EXPERECCE, ... WE NEED DEFINE ALL COLLECTIONS, ALL FIELD OF COLLECTION TO CREATE SCHEMA FOR PER COLLECTION
//--> AND FIND ALL COLLECTIONS AND ALL FIELD FOR PER COLLECTIONS NECESSARY TO PROJECT CAN WORK GOOD THAT'S IMPORTANT
const tourSchema = new mongoose.Schema(
  {
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
  },
  {
    //we need defined the output for virtual properties
    toJSON: { virtual: true }, // to consvert to json type
    toObject: { virtuals: true }, // to display based on object type
  },
);

//!VIRTUAL PROPERTIES
//--- this is a example fat model: use business login as more as posible in model
//--? because this virtual properties total related to data(model) you change data(duration) to useful data(durationWeek) not related to res, req(app logic)
//-->we don't go to controller create new field duratioWeek and do some login and add this to Database, instead we do it in model, and as you see mongo also support for our methods, tech to do that

//why are we using get()?cuz this virtual properties will be created each time that we get some data out of the database-->so it can be called getter()
tourSchema.virtual('durationWeek').get(function () {
  //this function is not an arrow function because the arrow function doesn't use this key this keyword, and this time this is a represetation for the current document so we need use function(){}

  //consvert days to week
  return this.duration / 7; //this is pointing to the current document
  //--> remember this virtual doesn't in database, it's only be there when we get data
  //--> we can't use durationWeek in query
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
