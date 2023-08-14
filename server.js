//!THIS FILE WE DO ALL SET UP FOR OUR APPLICATION

//CONFIGURATION MONGO DB
const mongoose = require('mongoose');
// const { MongoClient } = require('mongodb'); connect without use mongoose

const dotenv = require('dotenv'); //ENVIROMENT VARIABLE MAIPULATE

dotenv.config({ path: './config.env' });

const app = require('./app'); //APPLICATION

//* Connect to mongoDB
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
); //link connect to DBs

//CONNECT WITH HOSTED CLOUD DATABASE ALTAS
mongoose.connect(DB).then(() => {
  // console.log(con.connections);
  console.log('DB connect successful');
});
// .catch(() => console.log('ERROR')); //*We handle this unhadled error promise with catch

//! 4,START SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  //we need use server to close so we need assign it to a variable
  console.log(`App is listenning with port ${port} `);
});

//?BUT IT'S NOT ENOUGH BECAUSE WE NEED A WAY TO HANDLE ALL UNHANDLE ERROR PROMISE CUZ IN PROJECT WE USE MANY THING ABOUT PROMISE AND IT'S HARD TO FIND UNHANDLE ERROR AND FIX THAT(Especially in big project)

//* Now we will use the event and event listenner
//---When the unhanled error occurs it'll auto emit an object called unhandled rejection, and we can set the event for this error

process.on('unhandledRejection', (err) => {
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
