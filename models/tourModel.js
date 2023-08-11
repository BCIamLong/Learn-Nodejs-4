// all thing are related to model and we will export model and import to controller to handler
const mongoose = require('mongoose');
const slugify = require('slugify');

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
    slug: String,
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

// tourSchema.pre('save', function (next) {
//   console.log('Document will save....');

//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//!!QUERY MIDDLEWARE
//?Read this: https://mongoosejs.com/docs/middleware.html#notes
//It's also look like docs middeware, but the difference is find hook and this keywword now point to current query not document

//*Use regex(regular expression): to execute with hook name start with find: find, findOne,findById, findOneAndUpdate, findOneAndDelete...
tourSchema.pre(/^find/, function (next) {
  //^find is trigger function if hook name start with find
  // tourSchema.pre('find', function (next) {
  // you can use pre query to query before data come to real query
  //for example: you can do somethigns only show the normal tours and the secret tours for vip is hide because it's only for richer
  //when we request it'll run features = new APIFeatures(Tour.find(), req.query).filter().sort().select().pagination(count); and but it's really execute in  const tours = await features.query; and between this we can chaining query to query object: new APIFeatures(Tour.find(), req.query).filter().sort().select().pagination(count).find({ vip: { $ne: 'true' } })
  //this is query object so we can chaining method return query object
  this.find({ vip: { $ne: 'true' } }); //filter vip true out

  //because this is query object you can use chaining query method and also set new properties for this object
  this.start = Date.now();
  next();
  //!notice because this is find hook so it's not effect to findOne query if you use findOne query it's not working so how to do that, well we have two way: 1 we create new pre query middleware handle with findOne hook, 2 we use regex(this way is better because you don't need to waste your rss)
});

// tourSchema.pre('findOne', function(next){

// next();
// })

tourSchema.post(/^find/, function (docs, next) {
  //when we run finish query executed, and return results as docs we can access to docs in post query middleware
  // console.log(Date.now() - docs.start); //!notice docs is results from query not query object so start we set in query object not in here ==> we need use this keyword cuz this keyword poiting query object
  console.log(
    `Time to query to finish is: ${Date.now() - this.start} miliseconds`,
  );
  console.log(docs);
  next();
});

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
