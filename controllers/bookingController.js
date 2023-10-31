// * this stripe require is function accept key and return object we can use in our project
// * we also have options in this with option parameters and we can specify some option like: apiVersion...
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
// const AppError = require('../utils/appError');
const catchSync = require('../utils/catchSync');
const handlerFactory = require('./handlerFactory');

// const setUserTourId = catchSync(async (req, res, next) => {
//   const { tourId } = req.params;
//   if (!tourId) return next();
//   const tour = await Tour.findById(tourId);
//   if (!tour) return next(new AppError(404, 'No tour found with this id'));
//   req.body.tour = tourId;
//   req.body.user = req.user.id;
//   next();
// });

const createBooking = handlerFactory.createOne(Booking);
const getBooking = handlerFactory.getOne(Booking);
const getAllBookings = handlerFactory.getAll(Booking);
const updateBooking = handlerFactory.updateOne(Booking);
const deleteBooking = handlerFactory.deleteOne(Booking);

const createBookingCheckout = async session => {
  // * and now how we get the tour id? well we will use the  client_reference_id: tourId when we create the checkout session right, and now that's time to use it
  // * and now how we get the user id? well we will use  customer_email: req.user.email to query the user then get the ID
  const tour = session.client_reference_id;
  // const userData = await User.findOne({ email: session.customer_email });
  // const user = userData.id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};

const webhookCheckout = catchSync(async (req, res, next) => {
  // * now the webhook send session if payment successfully
  // * the first thing we do that read the stripe signature from header
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    // * so basically the stripe call our webhook it will add header to that request containing a special signature for our webhook

    // * req.body is raw and it's format for this constructEvent() can consume so that reason why we need to put this route before bodyParser.json() right
    // * And the event is also require the webhook secret
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    // * With this it will make payment process become super secure because we need signature from webhook send and the stripe webhook secret key to validate this data come from the body so no one can actually manipulate that
    // * now during create this event they might create some errors for example if the signature or secret key are wrong so we should use try catch
  } catch (err) {
    // * and in this case if we get error we need to send back to stripe
    // * and why don't we use catchAsync() to catch the error because this error will automatically create by stripe and this process request is also from stripe so we need  send back it to stripe right
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // * so why we need these code outside try catch and must use catchSync() well that because the code here is related our application and we need to handle these error if it occurs not for stripe right
  if (event.type === 'checkout.session.completed') await createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
});

const createBookingCheckout2 = catchSync(async (req, res, next) => {
  // ?why we call it is bookingCheckout for payment customer because later on we will have createBooking for our Admin, Guides right
  // console.log(req.query);
  // ! Remember that this is only temporary solution because it's unsecure and anyone can booking without paying
  const { tour, user, price } = req.query;
  // console.log(tour, user, price);
  // * we should use && because we need all 3 of them tour, user, price to create booking if we lack one of them it's not allow
  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  // * Instead use next() we should use redirect to '/' why?
  // * well if we use next() it will go to next middleware here is getOverview() and render the homepage but the URL is still keeping http://127.0.0.1:3000/?tour=5c88fa8cf4afda39709c2961&user=5c8a1dfa2f8fb814b56fa181&price=1497 like this and it's not good it's not secure because user can see all things right
  // * we need the URL is only / and use redirect('/') is good for this case
  // * the work of redirect that's create new request with new URL we just passed
  res.redirect('/'); // or res.redirect(req.originalUrl.split('?')[0]);
  // next();
});

const getCheckoutSession = catchSync(async (req, res, next) => {
  // * 1 Get data of current tour
  const { tourId } = req.params;
  const tour = await Tour.findById(tourId);

  // * 2 Create checkout session based of tour data
  const session = await stripe.checkout.sessions.create({
    // ! here is information about session
    mode: 'payment',
    payment_method_types: ['card'],
    // * now we use the temporary way to do it but it's not secure because then customer don't need to payment process and they can have new booking by using this URL and they can create new booking without payment and that's huge problem right
    // * of course we can also hide this link but it's not good solution and we should never use this way
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    // success_url: `${req.protocol}://${req.get('host')}?tour=${tourId}&user=${req.user.id}&price=${
    //   tour.price
    // }`, //* when the purchase is successfully the user will redirect to this url(usually it's our homepage url)
    // * and it's time we will create new booking with this payment to our DB
    // * so basically we want to create new booking whenever successfully URL is access
    // * we can also create new page with show notification successfully for customer but now we're using stripe and we can use features of stripe
    // * but with stripe it's only allow access to session object when we deploy project on internet on web host server in case the customer complete purchase successfully and using stripe Web Hook and then these web hook are perfect to create new booking
    // * but now we can use temporary solution to create new booking but it's not secure that's create new booking right in this URl as query string
    // * and we use query string that because stripe only use GET method and we can't use POST
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
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
            images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
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

module.exports = {
  getCheckoutSession,
  createBookingCheckout,
  createBookingCheckout2,
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
  webhookCheckout,
  // setUserTourId,
};
