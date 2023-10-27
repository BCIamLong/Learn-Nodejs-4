const express = require('express');

const app = express();

app.use(express.json());
// app.use() add middleware to middleware stack
//express.json() return function and app.use() add this function to middleware stack

//--> we can create our middleware
// --!: remember we can access req, res object and next function in per middleware function
// --! we can named parameter for middleware function but req, res, next is best and stardand of express
// --- We can have many middleware
// --! all parameter in middleware  is in the same req, res, next
//! this is a simple middleware and it's apply for all request coming
app.use((req, res, next) => {
  // console.log('This is middleware 🤣');

  //!! next() important if you don't call it the req-res cycle will stuck(ket) and you'll never send response back for client, so don't forget use next() when end in all middlewares
  next();
});

// ? route is also middleware and it is specify middeware because it's for request from /api/v1/tours,...
app.route('/api/v1/tours').get(getAllTours).post(createTour);
//!! if you use middleware here and apply for /api/v1/tours request => it won't work why? because req and res object come route that time we use res.json() send data back clien and end the req-res cycle so it's not working
// --> and this is how express app work
app.use((req, res, next) => {
  // console.log('This is middleware');
  next();
});

//!! notice stack middleware working run step by step and run by order of code line by line

// ? but this middleware can apply for this route below, because this middleware before route and still in the req-res cycle
app.route('/api/v1/tours/:id').get(getTour).patch(updatePieceOfTour).delete(deleteTour);

//>>>>>>>>>>>>//! SO BECAUSE ALL REASON ABOVE WE SHOULD CREATE AND PUT MIDDLEWARE BEFORE ALL ROUTES
const port = 3000;
app.listen(port, () => {
  // console.log(`App is listening port ${port}`);
});
