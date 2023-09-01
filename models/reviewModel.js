const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

//?IMPLEMENTS VIRTUAL POPULATE TOUR AND REVIEW
//* so now here we populated reviews data with tour and user data
//! so it still have problem here how can we access the reviews on the tour so basically the other way around so let's say data query for sepecific tour and then how will i get access to all the reviews for that tour and this problems is we did parent reference on the review, from reviews we can access to user or tour but oposite with user or tour we can't retrieve to reviews(parent reference: parent don't know anything about their children)
//* so it might good sometime but now when we need get access from tour  to reviews it's realy is problem
//?we have two solution:
//-->1: we will manually query for reviews each time that we query for tours but it would be a bit cumbersome(ruom ra) doing it manually like this: i did it
//-->2: also do child refencing on the tours: we will have an array has all the review IDs on each tour document then we will populated data to this array but this solution we sould remove in first time because the array can grow to indefinitely and maybe it'll over 16 megabytes
//*-->3:use avanced features virtual populate which mongoose offered it for us, so with virtual populate we can populate the tours with reviews so we can get all reviews for certain tour
//--> so virtual populate like a way of keeping that array of reviews IDs on a tour bu with out actually don't save in Database so that solve the problem that we have with child referencing so it's look like virtual property in schema but now it's for populate
// * we will implements it likes array id in child reference but it's virtual and it actually not save to DB

reviewSchema.pre(/^find/, function (next) {
  // this.select('-__v -createdAt')
  //   .populate({ path: 'user', select: 'name photo' }) //select: '-__v -passwordChangedAt' })
  //   .populate({
  //     path: 'tour',
  //     select: 'name ', // duration maxGroupSize difficulty ratingAverage price summary description imageCover',
  //   });
  //? so now we have problem we have tour being populated with reviews and the reviews also populated with the tour and populated with user, and in tour we also have populated with guide again it's not ideal at all so here we have chain 3 populate also performance is not ideal at all and data is so mixing and not good
  //* solution here: we will turn of populating the reviews with the tour(tour has two chain populated data tour and guide right), but of course if in your application case it's always depend on how your application work in your sepecific case
  //* and so in this our application that's logical when we have reviews available on tour and it's not that important having the tour available on the reviews so we comments this code populated tour to reviews because we don't need it
  //* but it still parent refencing between review and tour but we don't populated data for it
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
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRating,
  });
};

//! we should use post save hook(middleware) why? because in the pre save hook the review is available in our code but not  in our collection, so it's still save yet and we're using aggregate with Review model and it's interact with collection so in here we should use post save hook that time data is stored in DB
reviewSchema.post('save', async function (docs, next) {
  // const stats = await Review.calcAverageRating(this.tour);
  //? so the problem here is Review model is not created in this time, so how to solve this issue?
  //* simple think maybe we move this code bellow const Review = mongoose.model('Review', reviewSchema); but it'll not work because like in Express this code here basically runs in the sequence it is declared, if you do it the reviewSchema don't have this pre save hook(middleware) cuz model was created
  //! the solve is use this.constructor <=> Review model, this is current doccument and constructor is basically the model created that document
  await this.constructor.calcAverageRating(this.tour);

  next(); // we don't need use next function if after this post hook we don't have any thing middleware
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
