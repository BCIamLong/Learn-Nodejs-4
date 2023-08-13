// ?WE ALSO WANNA CREATE ERRORS MIDDLE HANDLER IN HERE IN THE SAME FILE TO EASY TO MANAGE BECAUSE WHEN YOU PROJECT IS BIG YOU NEED MANY ERROR HANDLERS TO HANDLE MANY TYPES OF ERRORS AND THE CODE FOR THIS WILL REPEAT MANY TIMES
//?HANDLERS IN MVC ALSO IS CONTROLLERS
//--> so we will create errors controller to constain handlers errors methods
//--! that's maybe litle weird because we don't have error resources, //?and this is only a way to implements errors handlers we also can create file errorHandlers as helpers,....
//--! and in MVC error handlers look like controller so you can pick it in here but maybe we also have another way

//!IT LOOK LIKE PLUGIN CAN USE MANY TIMES IN YOUR PROJECT THAT'S USEFUL
module.exports = (err, req, res, next) => {
  //   console.error(err.stack);
  // with four parameters express know this is error handling middleware, because express has error middleware handle out of the box
  err.statusCode = err.statusCode || 500;
  //* Why we need to set default: because there will be errors that are not comming from us, because there are gonna be errors withou status code so errors that not create by us but maybe some another place in node js apllication
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
  next();
};
