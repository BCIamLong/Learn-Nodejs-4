const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to an user'],
  },
  price: {
    // * so why we need the price because the price might change in the future and then we would no longer know how much certain user paid for a tour
    // *and it's price for current time, but in future it might change and when we watch the history we don't know how much we pay this tour in that time if we don't have this field
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    // * it's for in case that for example and administrator wants to create booking outside of the stripe so for example if customer doesn't have credit card and wants to pay directly like in a store with cash(tien mat) or something like that
    // * and that case admin might use our booking API in order to basically manually created a tour and so that might then be paid or not yet
    // * because the user don't use credit card to payment on our website in this case so the admin need to create booking manually
    type: Boolean,
    // * of course by default it's true and we don't do anything about it
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  // * and in this case we don't have much request to read booking because it's only for admin ,guides for check the bookings, manage bookings... so the performance is still good even we have two populate()
  this.populate({ path: 'tour', select: 'name' }).populate({ path: 'user', select: 'name' });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
