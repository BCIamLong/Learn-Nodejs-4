// !! this place is everything start, and listen to our server
// !! some thing not effect in express but effect app as config Database, handling errors,enviroment variable... all of stuff live in server.js file which is kind of entry point(điểm vào)
// !! so now you don't run nodemone app.js you run nodemon server.js to run but you can also config to run easy in package.json file
const app = require('./app');

//! 4,START SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App is listenning with port ${port} `);
});
