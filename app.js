const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//-->YOU NEED TO CONVENIEN WITH ALL FILE SEPERATE BECAUSE THAT'S ALSO STARDAND OF EXPRESS

//!1, MIDDLEWARE
// --> this is middlewares use for all of the routers
//!! THIS IS A EXAMPLE: LOGGER ONLY NESSCARY FOR DEVELOPMENT BECAUSE THAT'S TIME YOU NEED TO LOGGER TO WATCH MANY REQUEST AND HOW THEY WORK BUT IN PRODUCTION WE DON'T NEED IT BECAUSE APP DEPLOY AND USE BY USERS
//--> AND THHAT'S WHEN WE CHANGE ENVIROMENT SO APPLICATION ALSSO CHANGE BASED ON ENV VARIABLE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

//>>>>>>SERVING STATIC FILES
//! static file is file we can't access from browser or something because they don't have route
//--! in this project we have some file static in public some css, images, icons, index.html
//--> so to access this files in browser as index.html to we can see interface to build project

app.use(express.static(`${__dirname}/public`)); //it's set route for this and now we can access index.html to watch interface 127.0.0.1:3000/index.html or 127.0.0.1:3000/img/pin/png
//!! notice that: it's only work with static file we sedetify here, don't effect to any other routes

//!!ANY PRIECE OF WEBSITE OR SERVER ALL GET REQUESTS TO CREATE A COMPLETE WEB APPLICATION SO IF YOU USE MORGAN YOU CAN WATCH ALL REQUESTS IN LOGGERS AND KNOWEGE THAT
//-->How we can serve static file from folder and not a route
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});
//==============================
//!!3, ROUTES

// ? this mounting router, app.use() moun tourRouter middleware when req url is /api/v1/tours => create connected bettween app and tourRouter by use middleware
// --> you create spereter with per route with per rss by files and putting everything together in one main app file
// --> THIS IS MIDDLEWARE APPLY FOR SPECIFY ROUTER THAT'S
app.use('/api/v1/tours', tourRouter); // FOR /api/v1/tours ROUTE
app.use('/api/v1/users', userRouter); // FOR /api/v1/users ROUTE

//!! this mean is we have configuration applation in one standlone file
module.exports = app;
