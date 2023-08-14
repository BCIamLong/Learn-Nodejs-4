//!HANDLE ERROR WIHT DEVELOPMENT AND PRODUCTION ENVIROMENT: error handling mechanism(co che)

//? In development we wanna get as much information that the error occursed as possible, and when the error back we will log it in console to see info error and fix it
const sendErrorDev = (err, res) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
  // next(); cuz this middleware function is a last one so we don't need use next()
};

//? In production we wanna leak as little information about our error to client as possible, for example we only send a nice friendly message for user know what’s wrong
//--> production is important part so you need to be careful
const sendErrorProd = (err, res) => {
  //!operational errors: --> send to client
  if (err.isOperational)
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

  //!programing errors: --> don't leak(tiet lo) error detail
  //*1, log errors in hosted platform: heroku,... for the dev can watch what's going on here? => fix errors
  //--!notice this console only log on the platform your project hosted(not for client)
  console.error(`ERROR: ${err}`);

  //?WE ALSO HAVE THE ERRORS COME FROM MONGOOSE WE DON'T MARK THAT'S IS OPEARATIONAL SO RIGHT KNOW WE WILL SEND SIMPLE GENERIC ERROR MESSAGE AS THIS CODE BELOW FOR EXAMPLE A VALIDATION ERRORS,...
  //!BUT WE ALSO NEED TO MARK THEM OPERATIONAL AND SEND THE APPROPRITE(THICH HOP) ERROR MESSAGE BACK TO CLIENT FOR EXAMPLE: INPUT DATA INVALID WE CAN SEND MESSAGE FOR CLIENT,...
  //*2,send generic error
  res.status(500).json({
    status: 'Error',
    message: 'Something went wrong',
  });

  // next(); cuz this middleware function is a last one so we don't need use next()
};

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);

  //* --> AND WE WILL MARK MONGOOSE ERROR TO SEND THE APPROPRITE(THICH HOP) ERROR MESSAGE BACK TO CLIENT IN THE IF BLOCK BELOW
  if (process.env.NODE_ENV === 'production') sendErrorProd(err, res);
};
