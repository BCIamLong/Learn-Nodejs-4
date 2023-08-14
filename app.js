const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorsHandler = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//?IF YOU GIVE HANDLE NOT DEFINE ROUTE FUNCITON IN HERE IT'S ALWAY CATCH IN HERE, SEND res.status(404).json({ AND END THE REQ RES CYCLE
// app.all('*', (req, res, next) => {
//   // * notation all request verbs(get,post,...)
//   res.status(404).json({
//     status: 'Fails',
//     message: `Route for ${req.originalUrl} not defined on application`,
//   });
//   next();
// });

app.use(express.json());

app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(x); //* PUT UNCAUGHT ERROR IN MIDDLEWARE: THIS WILL CATCH BY GLOBAL ERROR SO DON'T WORRY ABOUT THIS
  next();
});

app.use('/api/v1/tours', tourRouter); // FOR /api/v1/tours ROUTE
app.use('/api/v1/users', userRouter); // FOR /api/v1/users ROUTE

//!ALL THING IN APP.JS IS RELATED TO EXRESS APPLICATION
//!HANDLE ROUTER NOT DEFINED
//---request go though middleware stack if it's come to here  mean is it be ignore by all route above so => if it came to here => it's not defined route
//-->now we can catch it in here
//router.get() .post(),... that time we write many line to handle for this but we wanna handle all not defined routes => we can use router.all() catch all the request(get, post, patch,...)
//-->IDEAL: catch route not defined by give it after all router if request can come here => it's not defined route and opposite it's maybe be catch by some route above handle and sen res so the req-res cycle end and it will not catch in here
app.all('*', (req, res, next) => {
  // * notation all request verbs(get,post,...)
  // res.status(404).json({
  //   status: 'Fails',
  //   message: `Route for ${req.originalUrl} not defined on application`,
  // });
  //?2 CREATE ERRORS
  //we will Error built-in contructor to create new instance of error
  // const err = new Error(`Route for this link not defined on application`); //err contructor accept message(String)
  // err.status = 'fails';
  // err.statusCode = 404;
  //* User App Error class custom
  const err = new AppError(
    404,
    `Route for this ${req.originalUrl} not defined on application`,
  );
  //--> you can use next() like this
  // next(
  //   new AppError(
  //     404,
  //     `Route for this ${req.originalUrl} not defined on application`,
  //   ),
  // );

  //--> this error will handle in next step

  //anything you pass in next() whatever Express auto know that there was an error => it's assume all we pass in next() is errors and this apply all middleware in express
  //and then express skip all middleware in middleware stack and send the error we passed to our global error handling middleware
  next(err); //=> skip all middleware in middleware stack and send the error to global error middleware
  //?WE ALSO IMPLEMENTS ALL THIS CODE IN THE ORTHER HANDLE FUNCTION, MIDDLEWARE IF THEY HAVE ERROR WE CREATE ERROR SEND TO GLOBAL ERROR MIDDLEWARE
  //! BUT IF YOU DO IT AND WRITE MANY CODE AND REPEAT MANY TIMES IT'S NOT GOOD SO WE SHOULD CREATE A CLASS ERROR AND WRITE METHODS THEN CREATE INSTANCE OF THIS CLASS AND USE ERRORS THAT'S BETTER AND IT'S ALSO BE USE POPULAR
});
//* PUT SOME UNCAUGHT EXCEPTION HERE
// console.log(x); // it's also catch by UNCAUGHT EXCEPTION event listenner

//!>>>>>>>>>Errors handling middleware
//---1, we need create error handling middleware
//---2, we create error, for example: throw newError() functions and this will be ctach in here
//?1 CREATE ERRORS HANDLER MIDDLEWARE
app.use(globalErrorsHandler);

module.exports = app;
