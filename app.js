//!https://nodejs.org/api/path.html
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');
const bookingRouter = require('./routes/bookingRouter');
const bookmarkRouter = require('./routes/bookmarkRouter');
const globalErrorsHandler = require('./controllers/errorController');
const bookingController = require('./controllers/bookingController');

const app = express();

if (process.env.NODE_ENV === 'production')
  app.set('trust proxy', ip => {
    if (ip === '216.24.57.3' || ip === '216.24.57.253') return true; // trusted IPs
    return false;
  });
//?IMPLEMENTS SETTING TEMPLATE ENGINE(PUG)
//!WE ACTUALLY NEED TO INSTALL PUB, EXPRESS WILL STILL LOAD IT BEHIND THE SCENES AUTOMATICALLY BUT IT DOESN'T COME WITH ALL OF THESE TEMPLATE ENGINE INSTALLED ALL THE BOX BUT WE DON'T NEED REQUIRE CUZ EXPRESS AUTO DO THAT ALL RIGHT
//* 1: Telling express what's template we using(definded template engine)
//--> so express automatically supports the most common engines out of the box and pug is one of them and so we don't event install pug and we also don't need to require it anywhere all of this happens behind the scenes internally in express
app.set('view engine', 'pug');
//--! now we also need to defined where these views are actually located in our file system, so our pack templates are actually called views in Express and that because these template  are in fact the views in the model view controller architecture (MVC) which we are using in this project
// --> so we had controllers and models folder now we will create views folder, so now we have three components of MVC architecture
//--- so now we will defined which folder or views are actually located in all
//!https://nodejs.org/api/path.html#pathjoinpaths
app.set('views', path.join(__dirname, 'views')); //'./views'); //! ./views is not ideal, because the path we provide here is always relative to the directory from where we launched the node application and that usually is the root project folder but it might not be, so instead use ./views we should use __dirname variable so to do it in set() method we use path core modules nodejs which use to manipulate path names basically
//app.set('views', path.join(__dirname, 'views')); --> behind the scene create the path joining the directory name with views  C://..../natours/views like this
//--! so you can see this might seem here a bit overkill(qua muc can thiet) to use this path.join() but we don't always know whether a path that we receive from somewhere already has a slash or not(if we use ./views => if has slash: //views so it's bug and will create error) so you will see this function use all the times in order to prevent this kind of bug and so we will use this function to create correct path
app.use(express.static(path.join(__dirname, 'public'))); //! it's also a middleware but we should put it in here because it works together with our views engine

// *IMPLEMENT CORS(CROSS-ORIGIN RESOURCES SHARING)
// ?Step 1
// cors() is return middleware like other package we did like this
// and the middleware will set couple of different headers to our response like helmet()
app.use(cors());
// it will set access-control-allow-origin = * and * is everything and it's mean it will allow for all the requests access no matter where they coming from
// and so this is ideal for allowing everyone to consume our API
// but now image that we only want share API for certain domain or subdomain
// example on our front-end application on a different domain
// * api.natours.com(backend), natours.com(frontend)
// * and what we will do it allows access from natours.come origin
// app.use(cors({ origin: 'https://www.natours.com' })); //* with this we only allow this origin to access to our API
// ?Step 2:
// * now we setup cors in our app but not finish, because right now it's only work for so-called simple requests and simple requests are GET and POST requests
// * and on the other hand we have so-called non-simple requests: PATCH, PUT, DELETE request or also request that send cookies or use nonstandard headers
// * and these non-simple request they require a so-called preflight phase
// * so whenever there is non-simple request the browser will then automatically issue(phat hanh) the preflight phase and this is how that work
// * so before the real request actually happens, assume that DELETE request the browser first does an options request in order to figure out if the actual request is safe to send
// * and that mean with us developers is that on our server we need do actually respond to that options request and options is really just another HTTP method like other method GET, POST, PUT....
// * so when we get these options requests on our server then we need to send back the same Access-Control-Allow-Origin header
// * and this way the browser will then know that the actual request and in this case the delete request, is safe to perform and then execute the delete request itself

// * options is HTTP method like get(), post()... which we can response it
// * in this case we need response to it, because browser will send options request when there is a preflight phase
app.options('*', cors()); // handle for preflight phase

// * we can also allow these complex requests on just a specific route
// app.options('api/v1/tours/:id', cors()); // we only handle preflight phase(patch, put, delete) for this route for cross-origin requests

// ? ===> and that is how we implement cors(cross origin resources sharing) for our application

//? so now we finished set up our pug engine, now we can create template in views folder

//*SECURITY HTTP HEADERS
//* Implements setting security HTTP headers with helmet packages
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//?LIMIT REQUEST FROM SAME API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) =>
    res.status(429).json({
      status: 'fails',
      message: 'You only send 100 request in 15 minutes',
    }),
});

//? if you user this for api you don't need to sepecify the  route because with api all router start with api/ right
app.use(limiter);

//* but if you use in web dynamic web or the app like this, you need to sepecify for per router, if you want use for this api web you need
// app.use('/api', limiter);
// app.use('/createUser', limiter);

app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

//*>>>>>>>BODY PARSER: reading data from body into req.body
//you can also implemts limit data
// app.use(express.json({ limit: '10kb' })); //data come into req.body not greater than 10kb if it's greater than well it's not accepted
//! use body parser package instead user express.json()
app.use(bodyParser.json({ limit: '90kb' })); // * parse data from body
// * parse data from form event by use URL encoded
// * extended: true is for to pass some complex data
// app.use(express.urlencoded({ extended: true, limit: '90kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '90kb' }));
app.use(cookieParser()); // * parse data from cookie

//?IMPLEMENTS DATA SANITIZATION: the good place to do it is after we parse json body request
//Data sanitization against NoSQL query injection: implemens this is very important
//* this middleware will lool to request body, request query string and also request.paramsn and then basically filter out all of the dollar signs and dots because that how operators of mongoDB are writen and removing that the operator will no longer
app.use(
  mongoSanitize({
    onSanitize: ({ req, res }) => {
      console.warn(`This request is sanitized`); // req);
    },
  }),
);

//Data sanitization against XSS(cross-site scripting attack)
//* this middleware xss() from xss-clean modules will delete any user input from malicious html code
// so image attacker want to insert some malicious html css code and js code attached to it and so if that would then later be injected into our html site, it could create some damage
//--> using middleware to prevent that basically to prevent consvert html symbol
//--- mongoose validation itself is actually already a very good protection against xss cuz it won't allow any crazy stuff to go into our DB as long as we use it correctly
//--> whenever you can just add some validation to your schemas and that should then mostly protect you from cross-site scipting at least on the server side
app.use(xss()); //parse all html css js symbols to string and it can't run like html css js code because now it's string

//?IMPLEMENTS PREVENT POLLTION PARAMETERS: use HPP npm packages
app.use(
  hpp({
    whitelist: ['duration', 'price', 'maxGroupSize', 'ratingAverage', 'ratingQuantity'], // white list is array constain values(fields) we allow can dupplicate because it's may useful in some sisuation
    //! so image we have many resources and now we also need add whitelist the necesarry to query so the whitelist in so bigger than in the future
    //* we can do some complex stuff here in order to get these field name from the model itself
  }),
); // it's should use here because it only clear up the query String

//! In validator modules from npm we also have some functions can validator and sanitization data and we can apply them to our schema but if you use mongoose it's not really necessary because mongoose implemented a strict schema so if it's feel data is something like bad, dammage it'll auto create error and our work is custom this error especially in production process

//*usually we put it near the end and before our sign routers
app.use(compression());

//*SERVING STATIC FILE: use to development dynamic website
//! so we also should use path.join() for this set static root
// app.use(express.static(path.join(__dirname, 'public'))); //`${__dirname}/public`));

//?CREATE THE PLACE TO STORAGE AND WE WILL CHECK IT
//---1, We can use the packages from npm to support create cookie
//--> check npm for cookie: goto npm hompage
//-->2, we can set manually on the header of request
//* TEST MIDDLEWARE IN DEVELOPMENT
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  //* we can set the cookie in this header
  //* now to send a json web token as header these actually a standard to do that
  //* the standard sending a token we should use a header called authorization and the value is bearer why because we bearer, we have, we posses(so huu) this token and then here the value of token like this:
  //-->Authorization -> Bearer asgsghhsfafaggs(value of token)
  //--!the key name will be auto lower case by express
  next();
});

app.use('/api/v1/tours', tourRouter); // FOR /api/v1/tours ROUTE
app.use('/api/v1/users', userRouter); // FOR /api/v1/users ROUTE
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/bookmarks', bookmarkRouter);
app.use('/', viewRouter);

app.all('*', (req, res, next) => {
  const err = new AppError(404, `Route for this ${req.originalUrl} not defined on application`);
  next(err);
});
app.use(globalErrorsHandler);

module.exports = app;
