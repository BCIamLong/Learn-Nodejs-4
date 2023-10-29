// all thing are related to model and we will export model and import to controller to handler
// const { promisify } = require('util');
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      //* this is validation built-in mongoose: we can use validator required, ,...
      required: [true, 'Tour name is required field'],
      unique: true,
      trim: true,
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
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'Difficult either: easy, difficult, medium',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: 5,
      //* A small feature mongoose provide
      //!--> setter function, this function willl be run each time that a new value is set for this field, and it's callback function call each time the new value is set for ratingsAverage field
      set: val => val.toFixed(1), //or Math.round(val * 10)/ 10, we use this function to set ratingsAverage to number like 4.5, 4.6 ... not 4.111111,4.55555,... like this
      //! so in real time we don't to format data to display because it's work of front-end and back end only return data and front-end will format this and display for client
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      // validate: {
      //   validator: function (val) {
      //     return val < this.ratingAverage;
      //   },
      //   message: 'The rating quantity(VALUE) must to less than rating average',
      // },
    },
    //*Validator for number built-in
    price: {
      type: Number,
      required: [true, 'Tour price is required field'],
      max: [10000, 'Atour must have price less than 10000 $'],
      min: [100, 'A tour must have price greater than 100 $'],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary'],
      // validate: [validator.isAlpha, 'The summary is only contains characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [
      {
        date: Date,
        participants: {
          type: Number,
          default: 0,
        },
        soldOut: {
          type: Boolean,
          default: false,
        },
      },
    ],
    vip: {
      type: Boolean,
      default: false,
      //! this object here is schema type options
    },
    //?IMPLEMENTS MODELLING LOCATION (GEOSPATIAL DATA)
    // * we embedded location into tour so we will declare it in tour model
    startLocation: {
      // --- in mongoDB: it's support geospatial and we can do anything with this
      //--- Geospatial data in mongoDB is a special data format called GeoJson
      //* https://www.mongodb.com/docs/v7.0/reference/geojson/
      //* --- and this type here not shcema type options like we have in the code above
      // ! this really is embedded object
      //? so we type and coordinates have own schema type option, so we have schema type options for type and shcema type option for coordinates just like field in tour model like name {},... and in here we have two subfield like that
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'], //startLocaton always a point right
      },
      coordinates: [Number], //* [longidude, latidude] it's not working as normal we have [latidude, longidude] right but in GeoJson mongoDB it works like this so you can go to google map and you can see this
      //! ==> basically when we create location GeoJson  we create new object has at least two fields type and coordinates also we can add more fields depends your location feature
      address: String,
      description: String,
      //* but now this data only start point not totally is document itself, and create new document and embedded them in the other document we need create an array includes all start points
      //--> that's thing we will do in locations
    },
    //? we also can delete start point field instead we use location and start point in here is day 0 right, but we have start point seperated is good in some certion situation
    locations: [
      //! we also need this locations: basically an array of object this will then create brand new document inside of the parent document which is this case the tour
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number, // the day users go to the this location
      },
    ],
    //* So now we created embedded or denormalized data sets, data sets really close relationship with the tours data so both really belong together so that we decided to embedded instead referencing
    //? after that when we build some features and need query to this locations data like find a tour near this location,....
    //? IMPLEMENTS MODELLING TOUR GUIDES DATA: REFERENCING/NOMARLIZING DATA
    //! https://mongoosejs.com/docs/populate.html   read this
    //* so now we're going to use populate in order to basically replace the fields that we reference with the actual related data
    //--> the result always look like embdded data but in fact we know it's refencing data and it's a completely different collection
    //--- populate data set always happens in query
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // to consvert to json type
    toObject: { virtuals: true }, // to display based on object type
  },
);

//?IMPLEMENTS CREATE INDEX FOR GEOSPATIAL
//!https://www.mongodb.com/docs/v7.0/geospatial-queries/#geospatial-indexes

//* so this time we don't use 1 or -1 because this is GeoSpatial data so this index needs to be a 2dsphere index if data decribes real points on a Earth-like sphere or instead we can also use a 2d index if we using just fictional(hu cau) point on a simple two-dimensional plane(mat phang 2 chieu)
// * so this case we talk about the real point on the Earth surface(be mat) so that we will use 2dsphere index
// --> so now we telling mongo DB that this start location here should be indexed to a 2d sphere so an Earth-like sphere where all our data are located
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.index({ slug: 1 });

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    lower: true,
  });
  //* notice: you need defined slug in your schema if not slug don't add into your db
  next();
});

//!>>>>>>>>RECAP
//1, FIRST WE CREATE A REFERENCE TO ANOTHER MODEL AND SO WITH  THIS YOU EFFECTIVELY CREATE THE RELATIONSHIP BETWEEN THESE TWO DATA SETS
//2, WE POPULATED THAT FIELD THAT YOU JUST SEPECIFY BEFORE THAT'S GUIDES FIELD IN TOUR MODEL

// tourSchema.pre('findOne', function (next) {
//   this.find({ vip: { $ne: 'true' } })
//     .populate({
//       // two this data is not nesecarry for tour guides so we need filter them
//       path: 'guides',
//       select: '-__v -passwordChangedAt',
//     })
//     .populate('reviews');
//   next();
// });

//?IMPLEMENTS POLULATE PROCESS FOR TOUR GUIDES DATA
//!THIS POPULATE() IS VERY IMPORTANT IN MONGOOSE TOOL BOX
tourSchema.pre(/^find/, function (next) {
  // ! this pre /^find/ will effect to query method start with find likes: find(), findOne(), findById(), findByIdAndUpdate(),... basically we populated data for all find methods
  //* Before we query we can chaining query with populdate and this pre find hooks is the best place to populated data
  //? You should do it like this in model and use pre find hook(middleware) if you want to populdated for all documents
  // pre hook we had query object data but still execute yet so we can chaining query object in here
  // this keyword pointing to current query object, and it's simple we chaining queryOb before we really run query
  this.find({ vip: { $ne: 'true' } }).populate({
    // two this data is not nesecarry for tour guides so we need filter them
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  //.populate('reviews');
  this.start = Date.now();
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Time to query to finish is: ${Date.now() - this.start} miliseconds`);

//   next();
// });

//!!AGGREGATION MIDDLEWARE
//?Read this: https://mongoosejs.com/docs/middleware.html#notes
tourSchema.pre('aggregate', function (next) {
  if (JSON.stringify(this.pipeline()).includes('$geoNear')) return next(); //! use for $geoNear stages because it must to be first stages to can work
  this.pipeline().unshift({
    //*https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift
    //*https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
    $match: {
      vip: { $ne: true },
    },
  });
  next();
});

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});
//*IMPLEMENTS AVANCED VIRTUAL POPULATE FEATURE OF MONGOOSE
//! https://mongoosejs.com/docs/tutorials/virtuals.html#populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  // --- so now we actually sepetify the name of the field in order to connect the two data: so this complicated part of implementing this virtual populate
  foreignField: 'tour', // this is a name of the field in the other model(so here it's review model) where the reference to the current model is stored so that's tour because we want get id of tour from reviews right because this is id of tour we stored in review right so it's will connection reference two model Tour and Review
  localField: '_id', //_id is which how it's called in the local model and it's called tour in foregin model
  //* so with foreignField and localFiel that's how we connect these two models together, _id of Tour connect to tour of Review ( _id and tour here all are id but we called different in Review) so this connection help us can get entire data from Review and pass to reviews virtual populate

  //* so we will populate with get one tour not get all tour because that would be a bit too much infomation to send down to client when they get all the tour, also when we getting all the tour that's usually to build like an overview page an that case we usually do not need access to all the reviews
  //* we only need that when we are really displaying just one tour so therefore we should populate this virtual reviews in tourController because we only apply for get one tour(getTour() method)
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
