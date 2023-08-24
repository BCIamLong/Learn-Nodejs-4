const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// const cookieparse = require('cookie-parser');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorsHandler = require('./controllers/errorController');

const app = express();

//*SECURITY HTTP HEADERS
//* Implements setting security HTTP headers with helmet packages
app.use(helmet());

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//?LIMIT REQUEST FROM SAME API
//!rateLimit() return the middleware function like(req, res, next)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) =>
    res.status(429).json({
      status: 'fails',
      message: 'You only send 3 request in 15 minutes',
    }),
});

//? if you user this for api you don't need to sepecify the  route because with api all router start with api/ right
app.use(limiter);

//* but if you use in web dynamic web or the app like this, you need to sepecify for per router, if you want use for this api web you need
// app.use('/api', limiter);
// app.use('/createUser', limiter);

//*>>>>>>>BODY PARSER: reading data from body into req.body
//you can also implemts limit data
// app.use(express.json({ limit: '10kb' })); //data come into req.body not greater than 10kb if it's greater than well it's not accepted
//! use body parser package instead user express.json()
app.use(bodyParser.json({ limit: '90kb' }));
// app.use(cookieparse());

//?IMPLEMENTS DATA SANITIZATION: the good place to do it is after we parse json body request
//Data sanitization against NoSQL query injection: implemens this is very important
//* this middleware will lool to request body, request query string and also request.paramsn and then basically filter out all of the dollar signs and dots because that how operators of mongoDB are writen and removing that the operator will no longer
app.use(
  mongoSanitize({
    onSanitize: ({ req, res }) => {
      console.warn(`This request is sanitized`, req);
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

//! In validator modules from npm we also have some functions can validator and sanitization data and we can apply them to our schema but if you use mongoose it's not really necessary because mongoose implemented a strict schema so if it's feel data is something like bad, dammage it'll auto create error and our work is custom this error especially in production process

//*SERVING STATIC FILE: use to development dynamic website
app.use(express.static(`${__dirname}/public`));

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

app.all('*', (req, res, next) => {
  const err = new AppError(404, `Route for this ${req.originalUrl} not defined on application`);
  next(err);
});
app.use(globalErrorsHandler);

module.exports = app;
