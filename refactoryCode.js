const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//!1, MIDDLEWARE
app.use(morgan('tiny'));

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
// );

//!Router

//!!3, ROUTES
// const tourRouter = express.Router();
// const userRouter = express.Router();

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//! 4,START SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App is listenning with port ${port} `);
});
