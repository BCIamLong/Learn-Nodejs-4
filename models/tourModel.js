// all thing are related to model and we will export model and import to controller to handler
// const { promisify } = require('util');
const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
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
    ratingAverage: {
      type: Number,
      default: 4.5,
      max: 5,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return val < this.ratingAverage;
        },
        message: 'The rating quantity(VALUE) must to less than rating average',
      },
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
    startDates: [Date],
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
    // * the ideal: user and tour remain completely seperate entities in our database, when we save certain tour document is the IDs of users that are the tour guides for that sepecific tour
    // * then when we query tour we also get access to tour guides but without tour guides save in document it's only id so exactly it's referencing
    //* so now we will referencing with mongoose
    guides: [
      //decribes data for sub document so embedded document
      {
        type: mongoose.Schema.ObjectId, //means that we expect a type id of  each of elements in the guides array to be a mongoDB ID, because the id here must to mongoDB id type, 64e60110b4989c0d39918107 is mongoDB id type
        ref: 'User', // sepecific referencing to User and so that how we establish(thanh lap) references between different data set in mongoose, we don't need to import this User model in here
        //! the id must in the user collections if id not in user collection => it'll return an error because we referencing to User model
        //* so we will this referencing id to get data of guides we to show to out put when we show info of tour or more other actions
      },
    ],
  },

  {
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
  this.find({ vip: { $ne: 'true' } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Time to query to finish is: ${Date.now() - this.start} miliseconds`);
  next();
});

//!!AGGREGATION MIDDLEWARE
//?Read this: https://mongoosejs.com/docs/middleware.html#notes
tourSchema.pre('aggregate', function (next) {
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

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
