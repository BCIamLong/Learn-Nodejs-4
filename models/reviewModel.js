const mongoose = require('mongoose');
const Tour = require('./tourModel');
// const AppError = require('../utils/appError');

//?IMPLEMENTS MODELLING REVIEWS DATA: PARENT REFERENCING
//review, rating, createdAt, ref to tour, ref to user
// * why are we choosing the parent referencing well because if you use embedded or child reference we need an array includes all data in embedded and all id in child reference and image if we many users like 100000 so maybe if these users comment two or three or many time maybe the numbers of array can over 1 minlion => it's too big and may over 16 megabytes
//* and this review is also update more action
// ! --> there we need use paren referencing
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please enter your review'],
    },
    rating: {
      type: Number,
      required: [true, 'Please rating this tour to review'],
      min: [1, 'Rating minimum is 1'],
      max: [5, 'Rating maximum is 5'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must to belong to an user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must to belong to a tour'],
      // validate: {
      //   validator: function (val) {
      //     return mongoose.Types.ObjectId.isValid(val);
      //   },
      //   message: 'No tour found with this id ',
      // },
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    //sepecify the type of vitual we get: in here we defined Object or JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//?IMPLEMENT INDEXES FOR TOUR AND USER TO PREVENT DUPLICATE REVIEW
//* in index() we have option in second parameter and we can manipulate with this and unique is one of them
//* so now the combinitation between tour and user always be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
//! problem here this compound indexes only created if two this conditions occurs: 1 ensureIndex run before, compound indexes after ensureIndex create, 2 server restarted
//* that's reason now this code not work maybe tomorrow when server restarted it'll work
//? but we can have other solution
//!https://stackoverflow.com/questions/22368814/compound-index-not-working
//* delete all document => all data destroyed => indexes remained so now it's work

reviewSchema.pre(/^find/, function (next) {
  // this.select('-__v -createdAt')
  //   .populate({ path: 'user', select: 'name photo' }) //select: '-__v -passwordChangedAt' })
  //   .populate({
  //     path: 'tour',
  //     select: 'name ', // duration maxGroupSize difficulty ratingAverage price summary description imageCover',
  //   });
  this.select('-__v -createdAt').populate({ path: 'user', select: 'name photo' });
  next();
});

//* IMPLEMENT AVERAGE RATING CACULATE FUNCTION
reviewSchema.methods.createAverageRating = async function (tourId, option) {
  const tour = await Tour.findById(tourId);
  const currentRatingsAverage = tour.ratingsAverage;
  const currentRatingsQuantity = tour.ratingsQuantity;
  if (option === 'create') {
    tour.ratingsAverage = (
      (currentRatingsAverage * currentRatingsQuantity + this.rating) /
      (currentRatingsQuantity + 1)
    ).toFixed(1);
    tour.ratingsQuantity = currentRatingsQuantity + 1;
  }
  if (option === 'delete') {
    tour.ratingsQuantity = currentRatingsQuantity - 1;
    tour.ratingsAverage = (
      (tour.ratingsAverage * currentRatingsQuantity - this.rating) /
      currentRatingsQuantity
    ).toFixed(1);
  }
  if (option === 'update') {
    tour.ratingsAverage = (
      currentRatingsAverage +
      this.rating / (currentRatingsQuantity + 1)
    ).toFixed(1);
  }
  await tour.save();
};

//* IMPLEMENT AVERAGE RATING CACULATE FUNCTION WITH STATIC METHODS
//! this static method not like we have Scheman.methods.newMetod =function() this is instance of static method, but now we really create the real static method
//?reviewSchema.statics.calcAverageRating <=> Review.calcAverageRating
reviewSchema.statics.calcAverageRating = async function (tourId) {
  //* this keyword point to current model there for we can use method like aggregate()
  const stats = await this.aggregate([
    //* so because we need use aggreaate on the model directly so that's why we using a static method
    //! aggregate always call on model
    // {
    //   $unwind: { path: '$reviews' },
    // },
    // {
    //   $group: {
    //     _id: '$tour',
    //     avgRating: { $avg: '$ratingsAverage' },
    //     totalRating: { $sum: '$ratingsQuantity' },
    //   },
    // },
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        avgRating: { $avg: '$rating' },
        nRating: { $sum: 1 }, //nRating: { $sum: '$ratingsQuantity' } we want numbers of rate not sum of rates
      },
    },
  ]);
  //! Update the stats ratingsAverage ratingsQuantity into tour collection
  // console.log(stats);
  await Tour.findByIdAndUpdate(tourId, {
    //* This solution for error delete the last review when we update to tour that's because this stats array is empty [] and [][0] is error cuz it's undefined right
    ratingsAverage: stats[0]?.avgRating || 4.5, //stats[0]?.avgRating.toFixed(1) || 4.5,
    //! so in real time we don't to format data to display because it's work of front-end and back end only return data and front-end will format this and display for client
    ratingsQuantity: stats[0]?.nRating || 0,
  });
};
// *IMPLEMENTS PREVENT DUPLICATE REVIEW WITH PRE SAVE MIDDLEWARE
//! but may this case not good because mongo need to go though all tours and users in review collection and you know review in realworld is so big, it's lost more performance
// reviewSchema.pre('save', async function (next) {
//   const user = await this.constructor.findOne({ tour: this.tour, user: this.user });
//   if (user)
//     return next(
//       new AppError(403, 'You only review once!, you can delete your review and review again'),
//     );
//   next();
// });

//! we should use post save hook(middleware) why? because in the pre save hook the review is available in our code but not  in our collection, so it's still save yet and we're using aggregate with Review model and it's interact with collection so in here we should use post save hook that time data is stored in DB
reviewSchema.post('save', async function (docs, next) {
  // const stats = await Review.calcAverageRating(this.tour);
  //? so the problem here is Review model is not created in this time, so how to solve this issue?
  //* simple think maybe we move this code bellow const Review = mongoose.model('Review', reviewSchema); but it'll not work because like in Express this code here basically runs in the sequence it is declared, if you do it the reviewSchema don't have this pre save hook(middleware) cuz model was created
  //! the solve is use this.constructor <=> Review model, this is current doccument and constructor is basically the model created that document
  await this.constructor.calcAverageRating(this.tour);

  next(); // we don't need use next function if after this post hook we don't have any thing middleware
});

//*IMPLEMENTS  CACULATE AVERAGE RATING FOR DELETE AND UPDATE
//? so because delete and update use findByIdAndDelete, findByIdAndUpdate it's also behind is findOneAndDelete, findOneAndUpdate so we can't use document middleware function which work with only create and save so there fore we need use query document => so let do with two way bellow, but remember the way 1 not working right now, it's only work for old version of mongoose
//* So let use all thing mongoose provide to solve problem, bussiness problem, ... and that reason read mongoose document is also important because we can find something can help solve problem right
//!https://mongoosejs.com/docs/middleware.html
//!Way 1: is only work for old version of mongoose like 5,4,... it's not work now new version now and we have better way to do it with new improve from mongoose
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   const review = await this.findOne(); //this is a trick to execute this without error
//   //* so now we get review document and tour id so that enough to do next step
//   //! but we have problem now the data not updated, so we need to pass this review document to query object and pass this to post hook and use this
//   this.r = review;
//   //* and we will use this in post hook(middleware) because that time data was updated
//   //? this trick is called pass data via query object
//   console.log(review);
//   // await review.constructor.calcAverageRating(review.tour);
//   next();
// });

// reviewSchema.post(/^findOneAnd/, async (doc, next) => {
//   // await this.findOne() is not work here because query has already executed
//   await this.r.constructor.calcAverageRating(this.r.tour);
//   next();
// });

//! Way 2: this is better way mongoose provide some feature to we can do it
reviewSchema.post(/^findOneAnd/, async (doc, next) => {
  await doc.constructor.calcAverageRating(doc.tour);
  next();
});
//? now we have problem with delete because when delete the last element, we will get error because it's review now is a undefined value so we need to fix it and consvert it to 0 review

//! we shouldn't repeat the code and we have best way to do it is use the regex start with findOneAnd so that's good
// reviewSchema.post('findOneAndDelete', async (doc, next) => {
//   await doc.constructor.calcAverageRating(doc.tour);
//   next();
// });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
