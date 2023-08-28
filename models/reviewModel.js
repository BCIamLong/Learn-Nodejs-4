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
  this.select('-__v -createdAt')
    .populate({ path: 'user', select: '-__v -passwordChangedAt' })
    .populate({
      path: 'tour',
      select: 'name ',
    });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
