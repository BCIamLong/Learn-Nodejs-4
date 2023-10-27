//!HANDLE ERROR WIHT DEVELOPMENT AND PRODUCTION ENVIROMENT: error handling mechanism(co che)
// const _ = require('lodash');
const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  // * API
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  //  ! we don't use /api/v1 why? because our API has many version v1, v2 , v3... right
  // !https://nodejs.org/dist/latest-v20.x/docs/api/all.html#all_http2_requesturl
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // * RENDERED WEBSITE
  console.log('ERROR 🔥', err);
  const error = {
    statusCode: err.statusCode,
    message: err.message,
  };
  res.status(err.statusCode).render('error', { error });
};

const sendErrorProd = (err, req, res) => {
  // console.error(`ERROR: ${err}`);

  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational)
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    console.log('ERROR 🔥', err);

    return res.status(500).json({
      status: 'Error',
      message: err.message,
    });
  }
  const error = {
    statusCode: err.statusCode ? err.statusCode : 500,
    message: err.message ? err.message : 'Something went to wrong',
  };

  if (err.isOperational) return res.status(err.statusCode).render('error', { error });
  res.status(500).render('error', { error });
  // next(); cuz this middleware function is a last one so we don't need use next()
};
const handleCastErrorDB = err => {
  //! handle mongo error DB ID: when you access web with invalid id => mongoose create cast error
  const message = `Invalid ${err.path}: ${err.value}`;
  // console.log(message);
  return new AppError(400, message);
};

const handleDuplicateErrorDB = err => {
  //!handle duplicate error in mongodb driver
  const message = `Duplicate error: ${err.keyValue.name} was exists, please enter other value`;
  //* if you don't have keyValue.name instead is a message: you can use regex get string between "" because the value key duplicate in here
  // -->const message2 = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]; because this return is an array
  // console.log(message2);
  return new AppError(400, message);
};

const handleValidationErrorDB = err => {
  //!handle duplicate error in mongodb driver
  // const erorrs = [...err.errors].map((el) => el.message).join('\n');
  const erorrs = Object.values(err.errors)
    .map(el => el.message)
    .join(' and ');
  const message = `Data update invalid: ${erorrs}`;
  //* if you don't have keyValue.name instead is a message: you can use regex get string between "" because the value key duplicate in here
  // -->const message2 = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]; because this return is an array
  // console.log(message2);
  return new AppError(400, message);
};
const handleJWTError = () => new AppError(403, 'Invalid token, please login again');
const handleJWTExpiresError = () =>
  new AppError(401, 'Your login turn was expires, please login again ');

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, req, res);

  if (process.env.NODE_ENV === 'production') {
    //?HANDLE MONGODB ERROR AND SEN MEANINGFUL ERROR FOR CLIENT IN PRODUCTION
    //* we can watch the error object and from that we can use some property to set condition and some property to create a good message
    //--> so we need create hard coppy of err because we need overwrite this error
    let errProd = { ...err };
    // * because some reason when we deconstruct object the message property is also lost so we need to assign it again(usually we will install the library like lodash which support many JS functions support for us like clone object,....)
    errProd.message = err.message;
    // let errProd = _.cloneDeep(err);
    // console.log(errProd, typeof err);

    // console.log(err);
    // console.log(errProd);
    // ! we shouldn't overwrite the arguments of a function
    // console.log(errProd.name, errProd.name === 'CastError');

    //?HANDLE ERRORS FROM MONGO: DB IDS INVALID
    //! some reason errProd.name  dont exist in error when we runcode so we can use err.reason.name
    //! you also can use errProd.name === 'CastError', you need to check where is error name is contain
    if (errProd.reason && errProd.reason.name === 'BSONError') errProd = handleCastErrorDB(errProd);

    //?HANDLE DUPLICATE DB FIELDs: WHEN YOU CREATE THE FIEALD IN THE SAME WITH UNIQUE THE FIELD
    if (errProd.code && errProd.code === 11000) errProd = handleDuplicateErrorDB(errProd);

    //?HANDLE VALIDATION ERROR IN SCHEMA VALIDATOR: MAX, MIN, MAXLENGTH, MINLENGTH, VALIDATOR FUNCTION,....
    //--> if you get two or more error in schema validation it's will send two or more object error => therefore we need to custom this
    // console.log(errProd);
    //!Because i can't use errProd.name in errProd so we can check errProd._message
    if (errProd._message === 'Validation failed') errProd = handleValidationErrorDB(errProd);

    // * NOW WE CAN DEFINED DIFFERENT ERROR SEVERRITY(NGHIEM TRONG CUA LOI) LEVELS
    //--> for example we can say this error is important or not important, or critical(nghiem trong), with critical error we can send message for admistrator about critical error

    //*WHEN YOU DISCORVE THE ERROS FROM THE PACKAGES, DATABASE,... AND IT'S NOT BE CATCH WITH NORMAL WAY, SO WITH THESE ERRORS WE NEED CUSTOM TO CLIENT IN PRODUCTION BECAUSE THÍ ERROR FROM USER AND WE NEED CUSTOM MESSAGES FOR USER UNDERSTAND WHAT'RE THEY DOING
    if (errProd.name === 'JsonWebTokenError') errProd = handleJWTError();
    if (errProd.name === 'TokenExpiredError') errProd = handleJWTExpiresError();

    //! AND IF YOU FIND AN ERRORS SIMILAR WITH ERRORS ABOUT YOU CAN ADD ERRORS AS THE CODE ABOVE, AND IDEAL IS MARK ERRORS AS ERROR ISOPERATIONA (CUSTEM ERRORS)
    sendErrorProd(errProd, req, res); //--> SEND ERROR IN HERE
  }
};
