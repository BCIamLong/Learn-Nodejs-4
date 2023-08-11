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
  },
  {
    //we need defined the output for virtual properties
    toJSON: { virtual: true }, // to consvert to json type
    toObject: { virtuals: true }, // to display based on object type
  },
);

//!DOCUMENT MIDDLEWARE
//---like virtual properties we need write document middleware mongoose in this file
///---run before a save() or create() command, NOTICE IT DOESN'T USE FOR INSERTMANY OR ONE
tourSchema.pre('save', function (next) {
  //because we want use this keyword in here so don't use arrow func
  //and this keyword in this function is processed document that's reason we call this docs middleware
  //-->we can do something in here before the data really added to DB
  //-->we want add slug field in document

  //---slugify: https://www.npmjs.com/package/slugify
  this.slug = slugify(this.name, {
    replacement: '-',
    lower: true,
  });
  //* notice: you need defined slug in your schema if not slug don't add into your db
  next();
  //--! before we didn't call next but why it's still work cuz that's time we only have a middleware, if you have many middleware you need call next if not your cyccles is stuck
  // console.log(this);
});

//?WE CAN SAY 'SAVE middeware' IS A save HOOK, WE CAN SAY IS A SAVE MIDDWARE OR SAVE HOOKS => PRE SAVE HOOK OR MIDDLEWAR, POST SAVE HOOK OR MIDDLEWARE
//!We can have many pre oR post middleware

tourSchema.pre('save', function (next) {
  console.log('Document will save....');

  next();
  //!!NOTICE WHEN YOU HAVE MANY HOOKS(MIDDLEWARE) YOU NEED NOTICE CALL NEXT() IF NOT THE REQ RES CYCLE IS STUCK AND IT'S DON'T NEVER RETURN RESULT AND YOU CAN SEE IT'LL LOADING FORERVER
});

tourSchema.post('save', function (doc, next) {
  //wwork when all pre middleware completed
  // you access to doc just saved to db and next()
  console.log(doc);
  next();
  //we don't really need next() here, example if after this post you have middleware you can use next() for example when you have many post middleware
});

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
