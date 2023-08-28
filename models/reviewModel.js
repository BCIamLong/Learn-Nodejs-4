const mongoose = require('mongoose');

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

reviewSchema.pre(/^find/, function (next) {
  //populate behide the scene its also create new query like: findById(user/tourID) get data and then it'll update this data to reviews
  this.select('-__v -createdAt')
    //! so we need sepecify for user with name and photo because we don't to leak the too much info for user posting this reviews to client, because someone can hits the API and get all reviews so we don't to leak the sentitive info of user posting this reviews so no one can know the private data about reviewer like email
    //--> we only send the nessecary data about user: name and photo it's enough for this case
    //* to populated with two collections or more we use 2 or more populate() methods
    //! but you need be careful because when we have a populate() we also have one query and two or more populate() that's mean we have 2 or more query so it's will do performence down and time is slow, so you need avoid to use too much populate() on query
    //! so with the project is big scale(quy mo) or certain scale you need to becareful when use populate() or don't use it and find another solutions
    .populate({ path: 'user', select: 'name photo' }) //select: '-__v -passwordChangedAt' })
    .populate({
      path: 'tour',
      select: 'name ', // duration maxGroupSize difficulty ratingAverage price summary description imageCover',
    });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
