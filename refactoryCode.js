const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const app = express();

//!1, MIDDLEWARE

//use morgan middleware
//---dev is parameter decide how logging look like, you also use tiny
//-->dev:2023-08-03T09:23:05.964Z GET /api/v1/tours 200 24.886 ms - 8871
//-->tiny: 2023-08-03T09:24:29.211Z GET /api/v1/tours 200 8871 - 17.420 ms
//---return function as middleware function (req, res, next)=>{}
//-->we can even save data from logger to file
// --> help we can development project better
app.use(morgan('tiny'));

app.use(express.json());

//* assume i need some info as date when request send you can use middleware to add this info to req object and use, this is a good case to use middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

//* add data in req body to add to DB server(test without client)
app.use((req, res, next) => {
  req.body = {
    duration: 9,
  };

  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//!!2,Refactory code handle routes function
//1, --> create function
const checkId = (tours, id, mes, res) => {
  if (id > tours.length) {
    res.status(404).json({
      status: 'Faild',
      message: mes,
    });
  }
};
const sendRes = (cod, stt, data, res) => {
  res.status(cod).json({
    status: stt,
    data: data,
  });
};
const writeFile = (link, dataUpdate, res, data, stt) => {
  fs.writeFile(link, dataUpdate, (err) => {
    if (err) {
      res.status(404).json({
        status: 'Faild',
        message: 'File not found',
      });
    }
    sendRes(stt, 'Success', data, res);
    //   res.status(200).json({
    //     status: 'Success',
    //     data: {
    //       tour,
    //     },
    //   });
  });
};

//===================================================

const getAllTours = (req, res) => {
  console.log(req.requestTime);
  if (!tours) {
    res.status(404).json({
      status: 'Faild',
      message: 'File not found',
    });
  }
  res.status(200).json({
    status: 'Sucess',
    requestAt: req.requestTime,
    result: tours.length,
    data: {
      tours,
    },
  });
};
const createTour = (req, res) => {
  const newIt = tours[tours.length - 1].id + 1;
  console.log(req.body);
  const newTour = Object.assign({ id: newIt }, req.body);

  tours.push(newTour);

  writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    res,
    { tour: newTour },
    201
  );
  //   fs.writeFile(
  //     `${__dirname}/dev-data/data/tours-simple.json`,
  //     JSON.stringify(tours),
  //     (err) => {
  //       if (err) {
  //         res.status(404).json({
  //           status: 'Faild',
  //           message: 'File not found',
  //         });
  //       }
  //       sendRes(201, 'Success', { tour: newTour }, res);
  //         res.status(201).json({
  //           status: 'Success',
  //           data: {
  //             tour: newTour,
  //           },
  //         });
  //     }
  //   );
};

const getTour = (req, res) => {
  console.log(req.params);

  const id = +req.params.id;
  checkId(tours, id, 'Tour not found', res);
  //   if (id > tours.length) {
  //     return res.status(404).json({
  //       status: 'Faild',
  //       message: 'Tour not found',
  //     });
  //   }
  const tour = tours.find((el) => el.id === id);

  if (id < tours.length) sendRes(200, 'Success', { tour }, res);
  //   res.status(200).json({
  //     status: 'Success',
  //     data: {
  //       tour,
  //     },
  //   });
};

const updatePieceOfTour = (req, res) => {
  const id = +req.params.id;
  checkId(tours, id, 'Invalid id', res);
  //   if (id > tours.length) {
  //     res.status(404).json({
  //       status: 'Faild',
  //       message: 'Invalid id',
  //     });
  //   }
  const tour = tours.find((el) => el.id === id);

  Object.assign(tour, req.body);
  tours[tour.id] = tour;

  writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    res,
    { tour },
    200
  );
  //   fs.writeFile(
  //     `${__dirname}/dev-data/data/tours-simple.json`,
  //     JSON.stringify(tours),
  //     (err) => {
  //       if (err) {
  //         res.status(404).json({
  //           status: 'Faild',
  //           message: 'File not found',
  //         });
  //       }
  //       sendRes(200, 'Success', { tour }, res);
  //         res.status(200).json({
  //           status: 'Success',
  //           data: {
  //             tour,
  //           },
  //         });
  //     }
  //   );
};
const deleteTour = (req, res) => {
  const tour = tours.find((el) => el.id === +req.params.id);
  tours.splice(tour.id, 1);
  writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    res,
    null,
    204
  );
  //   fs.writeFile(
  //     `${__dirname}/dev-data/data/tours-simple.json`,
  //     JSON.stringify(tours),
  //     (err) => {
  //       if (err) {
  //         res.status(404).json({
  //           status: 'Faild',
  //           message: "Can't delete",
  //         });
  //       }
  //       sendRes(204, 'Success', null, res);
  //         res.status(204).json({
  //           status: 'Success',
  //           data: null,
  //         });
  //     }
  //   );
};
//<<<<<<<<<<<<<<<<<<<<<Functions of user
const getAllUsers = (req, res) => {};
const getUser = (req, res) => {};
const createUser = (req, res) => {};
const updateUser = (req, res) => {};
const deleteUser = (req, res) => {};

//!Router
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updatePieceOfTour);
// app.delete('/api/v1/tours/:id', deleteTour);
//? create function to sepetator function with router and assign as params
//? assume when we want chan the version or resources of api so how to do that? and we should change handmade(thu cong) that change code :)) --> go to solve

// --> with this way when you wanna change version and resources of API you can chane in one link instead change all links

//!!3, ROUTES
//>>>>>>>>>>>>CREATING AND MOUNTING MUTIPLE ROUTERS
//--> the goal is seperate all the code we have in this file into mutiple file
//--- 1 file for route user, 1 file for route tour, 1 file for handle tour function, 1 file handle user function,....

//?1 create instance router of express router
const tourRouter = express.Router();
const userRouter = express.Router();
//?2 how to connect with our application, well we use it as middleware because this new tourRouter acctually is middleware
app.use('/api/v1/tours', tourRouter);
//!! this is mounting router, mounting new router on route '/api/v1/tours'
app.use('/api/v1/users', userRouter);
// -->we use middleware tourRouter for /api/v1/tours, and it connected
//--> now u can say that we created a sub applacation, as you can you crud for tours get data, create data, maybe something than,.... so that's really a application
//--> so this  tourRouter middleware only run in /api/v1/tours and this is root url if you use route for rss as /api/v1/tours/ and /api/v1/tours/:id you only use '/' and '/:id
//--> when you create route system like this you need to create sub app for each of these rss

// ! when the request go to middleware stack, if the url req is /api/v1/tours it's run tourRouter middleware function and find route for this if '/' or '/:id' it'll return login rss

//>>>>>>>>>>>>IMPLEMENT TOURS RESOURCES

tourRouter.route('/').get(getAllTours).post(createTour);

// app.use((req, res, next) => {
//   console.log('This is new middleware');
//   next();
// });

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updatePieceOfTour)
  .delete(deleteTour);

//>>>>>>>>>>>>IMPLEMENT USERS RESOURCES
//* when you crreate new ressources on API you need create new route to handle this
//!! but this has a problem that's: when you have more rss you write route and functions, middleware in one file app.js => this is hard to manage and watch so you need divide them to other file as controller, module,route....
userRouter.route('/').get(getAllUsers).post(createUser);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

//! 4,START SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App is listenning with port ${port} `);
});
