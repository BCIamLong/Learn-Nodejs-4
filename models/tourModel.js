// all thing are related to model and we will export model and import to controller to handler
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//!>>>>>>>>>>>>>VALIDATION DEV IN MONGOOSE
//* validation usually in create docs and update docs
// sometime the validatoer of mongoose is not enough for our project especially big project so you need create the own validator
//a validator iss simple function retun boolean type(true or false) true is accept and false is error
//?Also we have pakages on npm can help to validate: validator,...
//-->https://www.npmjs.com/package/validator: //!This library validates and sanitizes strings only.

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      //* this is validation built-in mongoose: we can use validator required, ,...
      required: [true, 'Tour name is required field'],
      unique: true, //! note: unique not really  validator, but return error when field same
      trim: true, //this's also not validator it's special of schema
      maxLength: [30, 'A name of tour not greater than 30 characters'],
      minLength: [9, 'A name of tour not less than 9 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have max group size'],
    },
    //*use validator enum built-in: the value equals in array element value it's accept, opposite it's fails
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      // required: {
      //   values: true,//! this is behide the code required: [true, 'A tour must have a difficulty'],
      //   message: 'A tour must have a difficulty',
      // },
      // enum: ['easy', 'difficult', 'medium'],//?so how we can set messages for this
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'Difficult either: easy, difficult, medium',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
    },
    //!!So i want the ratingQuantity is always less than ratingAverage so if you use built-in validator mongoose you can't do that ==> let's create your validator
    ratingQuantity: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          //val parameter here is value of ratingQuantity
          //use regular function because we need use this keyword to access current docs
          //!NOTICE: THIS KEYWORD ONLY POITING THE CURRENT DOCUMENT WHEN WE CREATE A NEW DOCUMENT, MEAN IS IT'S NOT WORK FOR UPDATE
          return val < this.ratingAverage;
        },
        //VALUE  is sepecify the value of ratingQuantity and it's related to mongo not JS
        message: 'The rating quantity(VALUE) must to less than rating average',
      },
    },
    //*Validator for number built-in
    price: {
      type: Number,
      required: [true, 'Tour price is required field'],
      //! notice: MIN AND MAX use for number and ALSO USE FOR DATE
      max: [10000, 'Atour must have price less than 10000 $'],
      min: [100, 'A tour must have price greater than 100 $'],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary'],
      // validate: function (val) {
      //   return validator.isEmpty(val);
      // },
      //?This is the way validator function work
      //with this function you can use [], insteand use {values: '', message: ""}
      //is Alpha is only contains characters, if white space it's also error
      validate: [validator.isAlpha, 'The summary is only contains characters'],
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
    vip: {
      type: Boolean,
      default: false,
    },
  },
  {
    //we need defined the output for virtual properties
    toJSON: { virtual: true }, // to consvert to json type
    toObject: { virtuals: true }, // to display based on object type
  },
);

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    lower: true,
  });
  //* notice: you need defined slug in your schema if not slug don't add into your db
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ vip: { $ne: 'true' } }); //filter vip true out

  //because this is query object you can use chaining query method and also set new properties for this object
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(
    `Time to query to finish is: ${Date.now() - this.start} miliseconds`,
  );
  console.log(docs);
  next();
});

//!!AGGREGATION MIDDLEWARE
//?Read this: https://mongoosejs.com/docs/middleware.html#notes
tourSchema.pre('aggregate', function (next) {
  // in thiss function wwe can access to current aggregation object via this keyword before it execute:
  //--> const stats = await Tour.aggregate([])
  // console.log(this.pipeline()); //pipeline() to show the pipeline code we defined in aggregate and it's really place we can change to do something
  //why don't we use this.aggregate() well cuz aggregate not like query object it contains many stuff, and the code it's storage in pipeline and to get this we use this.pipeline()
  // this.pipeline() return array contains all stages, if and per stages is a element object, if you want change add or remove stages for you goal you use JS array method push(), pop(), unshirt(), shirt(), splice(),.... to do that and edit stages in this array //! https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/
  //then this array still work in aggregate and execute normal
  this.pipeline().unshift({
    //*https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift
    //*https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
    $match: {
      vip: { $ne: true },
    },
  });
  next();
});

// tourSchema.post('aggregate', function (docs, next) {
//   console.log(this.pipeline());
//   console.log(docs); //this post aggregate hook not useful but maybe it's can use in certion situation in future
//   next();
// });

//!!MODEL MIDDLEWARE
//Model middleware is realy not useful because it's only for insertMany event for insertMany() so you can see in project we usually don't use this method => it's not useful

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
