const express = require('express');
const morgan = require('morgan');
const cookieparse = require('cookie-parser');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorsHandler = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cookieparse());
app.use(express.static(`${__dirname}/public`));

//?CREATE THE PLACE TO STORAGE AND WE WILL CHECK IT
//---1, We can use the packages from npm to support create cookie
//--> check npm for cookie: goto npm hompage
//-->2, we can set manually on the header of request
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
  const err = new AppError(
    404,
    `Route for this ${req.originalUrl} not defined on application`,
  );
  next(err);
});
app.use(globalErrorsHandler);

module.exports = app;
