// * this stripe require is function accept key and return object we can use in our project
// * we also have options in this with option parameters and we can specify some option like: apiVersion...
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const catchSync = require('../utils/catchSync');

const getCheckoutSession = catchSync(async (req, res, next) => {
  // * 1 Get data of current tour
  const { tourId } = req.params;
  const tour = await Tour.findById(tourId);

  // * 2 Create checkout session based of tour data
  // * we need to await because the create() will do call APIs of Stripe to does this task
  const session = await stripe.checkout.sessions.create({
    // ! here is information about session
    mode: 'payment',
    // *options: many options but three are necessary
    payment_method_types: ['card'], //* we can also use other type but it's for premium account
    success_url: `${req.protocol}://${req.get('host')}/`, //* when the purchase is successfully the user will redirect to this url(usually it's our homepage url)
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`, //* in case user fails purchase we can back user to the previously tour they try to purchase before
    customer_email: req.user.email, //* we can provide the customer email to user don't need to enter the email again and do the checkout is smoother
    // * this field is very important because it allows us to pass in some data about the session that we are currently creating and that's important because later once the purchase was successful we will then get access to the session object again
    // * then we want create a new booking in our database, and data we want to pass here is userId, tourId and price
    // * and of course it uses for the deploy website
    client_reference_id: tourId,

    // ! here is information about product we want purchase
    line_items: [
      {
        // * notice that these field here come from stripe we can't make up our own field otherwise it'll error
        price_data: {
          unit_amount: tour.price * 100, //* usually the price is cents currency and 1 $ = 100 cents
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            // * now with the images they need to be live images which are basically is hold on the internet, because stripe will actually upload this images to their own stripe
            // * now we will use temporary image then after that when we deploy we will implement hosted images
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  // * 3 Send back response with checkout session
  res.status(200).json({
    status: 'success',
    session,
  });
});

module.exports = { getCheckoutSession };
