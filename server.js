//!THIS FILE WE DO ALL SET UP FOR OUR APPLICATION

//CONFIGURATION MONGO DB
const mongoose = require('mongoose');

const dotenv = require('dotenv'); //ENVIROMENT VARIABLE MAIPULATE

dotenv.config({ path: './config.env' });

const app = require('./app'); //APPLICATION

//* Connect to mongoDB
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
); //link connect to DBs

//CONNECT WITH LOCAL DATABASE
// mongoose
//   .connect(process.env.DATABASE_LOCAl)
//   .then(() => console.log('Connect DB success'));

//CONNECT WITH HOSTED CLOUD DATABASE ALTAS
mongoose
  .connect(DB)
  .then(() => {
    // console.log(con.connections);
    console.log('DB connect successful');
  })
  .catch((err) => console.log(err));
//mongoose.connect(link, option): return promise, you can set up some option{} but new mongoose up to 7 version so you don't need to set up some option to mongoose work stable, and maybe you can setup some options help you development DB
//cuz promise return so you can use then() handle this promise, and use catch() method to catch the error if it occurs

//! 4,START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is listenning with port ${port} `);
});
