const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//-->YOU NEED TO CONVENIEN WITH ALL FILE SEPERATE BECAUSE THAT'S ALSO STARDAND OF EXPRESS

//!1, MIDDLEWARE
// --> this is middlewares use for all of the routers
app.use(morgan('tiny'));

app.use(express.json());

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
