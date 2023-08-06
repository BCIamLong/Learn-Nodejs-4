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
mongoose
  .connect(DB)
  .then(() => {
    // console.log(con.connections);
    console.log('DB connect successful');
  })
  .catch((err) => console.log(err));

//! 4,START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is listenning with port ${port} `);
});
