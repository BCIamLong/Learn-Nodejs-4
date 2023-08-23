const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
// const cookieparse = require('cookie-parser');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorsHandler = require('./controllers/errorController');

const app = express();

//*SECURITY HTTP HEADERS
//* Implements setting security HTTP headers with helmet packages
app.use(helmet());
//to sure the headers to be set
//! and also we always put it in the first middleware stack we build in project

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//?LIMIT REQUEST FROM SAME API
//!rateLimit() return the middleware function like(req, res, next)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  //!this max is for testing api and development project in fact you need adjust(dieu chinh) the max request to fit with your application like 1000, or maybe can more
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  //!legacyHeaders (X-rateLimit) you should set it false to hide it because this info may useful for attack because they now in how many minute they can sen how many request => always set to false
  // message: 'You only send 3 request in 15 minutes',
  handler: (req, res, next) =>
    res.status(429).json({
      status: 'fails',
      message: 'You only send 3 request in 15 minutes',
    }),
});

//!WHEN WE RESTART APPLICATION WE ALSO RESTART LIMIT REQUEST NUMBERS, SO MAYBE YOU THINK THE ATTACKER TRY TO CRASH SERVER AND THEN WHEN SERVER START AGAIN HE ALSO TRY ATTACK BUT IT'S NOT BECAUSE IN FACT THE SERVER NOT EASY TO CRASH BECAUSE COMPANNY HAS MANY SECURITY METHODS  SO ASSUME IF THEY WILL BE CRASH THEY ALSO FIX THIS AND THE SECOND NOT EASY FOR ATTACKER CAN DO IT AGAIN

//? if you user this for api you don't need to sepecify the  route because with api all router start with api/ right
app.use(limiter);

//* but if you use in web dynamic web or the app like this, you need to sepecify for per router, if you want use for this api web you need
// app.use('/api', limiter);
// app.use('/createUser', limiter);

//*>>>>>>>BODY PARSER: reading data from body into req.body
//you can also implemts limit data
app.use(express.json({ limit: '10kb' })); //data come into req.body not greater than 10kb if it's greater than well it's not accepted
// app.use(cookieparse());

//*SERVING STATIC FILE: use to development dynamic website
app.use(express.static(`${__dirname}/public`));

//?CREATE THE PLACE TO STORAGE AND WE WILL CHECK IT
//---1, We can use the packages from npm to support create cookie
//--> check npm for cookie: goto npm hompage
//-->2, we can set manually on the header of request
//* TEST MIDDLEWARE IN DEVELOPMENT
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  //* we can set the cookie in this header
  //* now to send a json web token as header these actually a standard to do that
  //* the standard sending a token we should use a header called authorization and the value is bearer why because we bearer, we have, we posses(so huu) this token and then here the value of token like this:
  //-->Authorization -> Bearer asgsghhsfafaggs(value of token)
  //--!the key name will be auto lower case by express
  next();
});

app.use('/api/v1/tours', tourRouter); // FOR /api/v1/tours ROUTE
app.use('/api/v1/users', userRouter); // FOR /api/v1/users ROUTE

app.all('*', (req, res, next) => {
  const err = new AppError(404, `Route for this ${req.originalUrl} not defined on application`);
  next(err);
});
app.use(globalErrorsHandler);

module.exports = app;
