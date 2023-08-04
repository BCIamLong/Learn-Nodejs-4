// !! this place is everything start, and listen to our server
// !! some thing not effect in express but effect app as config Database, handling errors,enviroment variable... all of stuff live in server.js file which is kind of entry point(điểm vào)
// !! so now you don't run nodemone app.js you run nodemon server.js to run but you can also config to run easy in package.json file
//?dotenv help you reading and saving enviroment variables
const dotenv = require('dotenv');

// *REAND ALL VARIABLES IN CONFIG FILE AND SAVE THEM INTO NODEJS ENVIROMENT VARIABLES
dotenv.config({ path: './config.env' }); // this is occurs in node process and only happen once then in process run next it's still in the same no matter what file we are and so it's always in the same process and all enviroment variable also in here
//! when process running it's read file config and read all variable and then app run  const app = require('./app'); therefore you're still in one process and you can access all enviroment variable in app without use dotenv again
//! process only run once when you run app the first and save all thing to cache, and second when we have request it's manipulate with cache
//! so because that's above, all eviroment is avalaible in all single file in project

const app = require('./app');
//-->Get type of current enviroment, it's express set so you can use app to access
// console.log(app.get('env'));
//--!but nodejs also set many differnt enviroment variables
// --- and that variable come from process core module and it's global so you can use it without require and can use anywhere
console.log(process.env); // THIS CODE HELP US WATCH ALL ENV VARIABLES IN NODEJS(include all env variable we set)

//--! if you have env variable, you should apply it
//! 4,START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is listenning with port ${port} `);
});
