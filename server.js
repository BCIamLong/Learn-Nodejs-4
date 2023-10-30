//!THIS FILE WE DO ALL SET UP FOR OUR APPLICATION

//CONFIGURATION MONGO DB
const mongoose = require('mongoose');
// const { MongoClient } = require('mongodb'); connect without use mongoose

const dotenv = require('dotenv'); //ENVIROMENT VARIABLE MAIPULATE

//!WE SHOULD PUT BEFORE ALL CODE, ESPECIALLY WITH BEFORE APP.JS(ONLY THE DEV MODULES), NOT FOR CORE MODULES AND LIBRARIES MODULES(WHICH SHOULD PUT BEFOR THIS CODE)
process.on('uncaughtException', err => {
  //we listenning here
  console.log('UNCAUGHT EXCEPTION ! shutting down');
  console.log(err.name, err.message);
  //*we dont need the server because this code uncaughtException only happen with the sync code(don't need callback for async code)
  //* this only handle sync code so we don't have callback queue for request, pending,....
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app'); //APPLICATION

//* Connect to mongoDB
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD); //link connect to DBs

//CONNECT WITH HOSTED CLOUD DATABASE ALTAS
mongoose
  .connect(DB)
  .then(() => {
    // console.log(con.connections);
    console.log('DB connect successful');
  })
  .catch(err => console.log('ERROR 🔥', err)); //*We handle this unhadled error promise with catch

//! 4,START SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  //we need use server to close so we need assign it to a variable
  console.log(`App is listenning with port ${port} `);
});

//?BUT IT'S NOT ENOUGH BECAUSE WE NEED A WAY TO HANDLE ALL UNHANDLE ERROR PROMISE CUZ IN PROJECT WE USE MANY THING ABOUT PROMISE AND IT'S HARD TO FIND UNHANDLE ERROR AND FIX THAT(Especially in big project)

//* Now we will use the event and event listenner
//---When the unhanled error occurs it'll auto emit an object called unhandled rejection, and we can set the event for this error

process.on('unhandledRejection', err => {
  console.log(err);
  console.log(err.name, err.message);

  //!if we met the unhandledRejection error in this case the our apllication not work at all so the things we can do that's shutdown our project
  //--> and to do that we use:
  console.log('UNHANDLED REJECTION! shutting down');

  // process.exit(1); //0 is stand for success, 1 is stand for uncalled exception

  //!BUT WE HAVE PROBLEM WITH HERE: THE WAY WE IMPLEMENTS HERE IS A VERY ABRUPT(DOT NGOT) WAY OF ENDING THE PROGRAM BECAUSE THIS WILL JUST IMMEDIATELY ABORT(HUY BO) ALL THE REQUESTS THAT CURRENT STILL RUNING OR PENDING AND SO THAT MIGHT NOT GOOD IDEAL
  // * SO THE WAY DO IT BETTER THAT: CLOSE SERVER AND THEN WE SHUTDOWN APPLICATION

  server.close(() => {
    //* server.close is time we handle requests are runing or pending and after that when finish we just shutdown and the server be killed
    process.exit(1); //0 is stand for success, 1 is stand for uncalled exception
  });
  //* --> AND NOW THE OUR APPLICATION NOT WORK AT ALL BUT USUALLY IN A PRODUCTION APP ON A WEB SERVER WE WILL HAVE SOME TOOL IN PLACE THAT RESTART APPLICATION RIGHT AFTER IT CRASHES(GAP SU CO) AND SOME PLATFORM HOSTED NODEJS APP WILL AUTO DO THAT ON THEIR OWN BECAUSE WE DON'T WANT APPLICATION CRASHING FOREVER YOU KNOW

  //!NOTICE: HANDLE UNHANDLED REJECTED PROMISE BASICALLY WE HANDLE ASYNCHRONOUS CODE
});
//! HANDLLE THE UNCAUGHT EXCEPTION(SYNCHRONOUS)

//-->so what is uncaught exception: that's errors or bugs occurs in our code but we don't or forget handle
//--> example:

//-->Solution:
// process.on('uncaughtException', (err) => {
//   console.log('UNCAUGHT EXCEPTION ! shutting down');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
// console.log(x); //x not defined we get  uncaught exception

//!SO WHEN THERE IS AN UNCALLED EXCEPTION WE REALY REALY TO NEED CRASH OUR APPLICATION
//!BECAUSE AFTER THERE WAS AN UNCALLED EXCEPTION THE ENTIRE NODE PROCESS IS IN A SO-CALLED UNCLEAN STATE
// * SO TO FIX THAT THE PROCESS NEED TO TERMINATE(CHAM DUT) AND THEN TO BE RESTARTED
//? AND IN PRODUCTION WE SHOULD HAVE TOOL IN PLACE WHICH WILL RESTART APPLICATION AFTER CRASHING AND MANY HOSTING SERVICE ALREADY DO THAT OUT OF THE BOX AND AUTO THEN WE DON'T DO ANYTHING

// *In node js two this way above handle error not better, the errors should handler in right where they occurs, for example: problem with connecting DB we need add the catch() to catch error and not just simple rely on the unhandled rejection
//--> and so some devs can say we don't need this unhandledRejection and uncaughtException but the future can't guess, but two this is very useful when you code project because maybe you forgot handle sync code or forgot handle promise rejected

//!Notice:
// console.log(x); //if you put this UNCAUGHT EXCEPTION here then the event listenner can't catch this error because the UNCAUGHT EXCEPTION happen before we listenning

//!SO WE NEED PUT THIS CODE ON TOP CODE
// process.on('uncaughtException', (err) => {
//   //we listenning here
//   console.log('UNCAUGHT EXCEPTION ! shutting down');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });

process.on('SIGTERM', () => {
  // * the sigterm now like the event that can be emitted and that our application receives and can then response to like we did with unhandled rejection, uncaught exception
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');

  // * implement way to shutting down gracefully
  server.close(() => {
    // * when server close that time all requests(pending, ready, sent...) will process until the end and then after that it's good to shut down application
    console.log('💥 Process terminated');
    // ? so why we don't use process.exit() in here
    // * well that because SIGTERM itself will cause the application to shut down therefore we do not to do it manually like we did with unhandled rejection, uncaught exception
    // * sigterm signal is that's used to cause a program to really stop running so like politely way to ask a program to terminate(cham dut)
  });
});
