const fs = require('fs');
const express = require('express');
// this app.js file is standard to config follow express

const app = express(); // this express() function call bunch of method to our app

//!midleware: is function that can modify the incomming request data and it's in midle between request and response, this is a step request need though(trai qua) while processing, that's data from body can add to request object
app.use(express.json()); // help us data can pass and send to request body to server

// all code maybe working as node-farm project but with express this is absstraction and you use it's easy
//set route: very eassy in express
// app.get('/', (req, res) => {
//   // status default is 200
//   //   res.status(200).send('Hello express');
//   //   console.log(req.url);
//   res
//     .status(200)
//     .json({ message: 'Hello express', app: 'Natour', author: 'longhoang' });
//   // we don't have write header as Content-Type for browser understand or some header because express auto do it for our
// });

//* api
// /api/v1/tours is first version api but if you want to change some feature of api you create v2(version 2) /api/v2/tours but users can also access v1 version 1

//*readFileSyc to get tour data from file dev-data/data/tours-simple.json
//data return is json so you need to parse to objects array
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

//>>>>>>>>>>>>>>>>>>>>>>>>>>>CREATE FUNCTION TO REFACTORY CODE

//! we're using http verb that's get, post, patch, put, delete

app.get('/api/v1/tours', (req, res) => {
  //!in this case is simple: so you can run readFileSync here because this data is not big and don't lost more time, especialy this is simple example so it's not important but this real project it's big bug, problem
  //   const tours = JSON.parse(
  //     fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
  //   );

  //! if you put readFile here it's not good because it create callback in callback
  //   const tours = fs.readFile(
  //     `${__dirname}/dev-data/data/tours-simple.json`,
  //     (err, data) => {
  //       if (err) console.log(err);
  //       console.log(data);
  //     }
  //   );

  if (!tours) {
    res.status(404).json({
      status: 'Faild',
      message: 'File not found',
    });
  }
  res.status(200).json({
    status: 'Sucess',
    result: tours.length, //if a field doesn't have data it'll hide and not result: 0 (it's hide have notthing)
    data: {
      tours, // ES6 when you add property in object you don't need use tours: tours, unless the name is different
    },
  });
});

// app.post('/add', (req, res) => {
//   res.send('You can add data with post');
// });

//!POST
// basically post and get have same url api, because when you post you don't need id because auto create for you

// use to send data from client to server, this data maybe contain in request body
// but in express data from client send to server need middleware to validate if we don't have it, express don't put data to server and it doesn't request body
// --> need middleware to do it
app.post('/api/v1/tours', (req, res) => {
  // after you have end request and respose cycle you to send something
  //   console.log(req.body, typeof req.body);

  //? because this is fake database(use file as DB) so we can't auto create id so we need to create id with myselt
  //   const newId = tours.length + 1; with the id is total number
  const newId = tours[tours.length - 1].id + 1;
  //   req.body.id = newIt;
  //   const newTour =  req.body;
  // const newTour = Object.assign({ id: newIt }, req.body);
  const tourUpdate = req.body;
  const newTour = { newId, ...tourUpdate };

  //   const newTours = [...tours, newTour];
  tours.push(newTour);
  //   console.log(newTours);
  //! you shouldn't use write sync because maybe block event loop
  //!callback function run in event loop, first register vent to callback queue and then when event come and trigged call back function is execute

  //! when we write file into .json file and save it it's auto load nodejs server and
  //   const tours = JSON.parse(
  //     fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
  //   );
  // ! read file and now tours have all data add so when you use get you can see all data

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours), // because .json file want json type so u need consvert it
    err => {
      if (err) {
        res.status(404).json({
          status: 'Faild',
          message: 'File not found',
        });
      }
      res.status(201).json({
        status: 'Success',
        data: {
          tour: newTour,
        },
      });
    },
  );
  //   res.send('Post is done'); //
  //res.send or res.json send data and end request so if you it you can't run code next
  // when you sent response to client you can't send the second time, you don't send two response
});

//! handle with url has parameter: /api/v1/tours/1
// --> you also can add many params in url: /api/v1/tours/:id/:x/:o
// --! but when you write url you must write enough params as: /api/v1/tours/1/2/3 that's it
// ---  /api/v1/tours/1/2 if you write here => error
// --> if you still use as this above code you can use //!option params: this param can exits or not
// --- /api/v1/tours/1/2 and //?it's working and o is undefine
app.get('/api/v1/tours/:id', (req, res) => {
  //:parameter is stardand of express to write id
  // console.log(req.params); // is object contain all parameter or variable we defined in url
  //   if(!id) console.log("Do some thing");
  //   const id = req.params.id * 1; this is a way to chance string to number
  //! in the real project we need to check id and some thing logic? if not we need do some thing
  //! in express also do that and maybe you can see inmidleware but in this simple project i only need do some thing similar but not avanced

  const id = +req.params.id;
  if (id > tours.length) {
    return res.status(404).json({
      status: 'Faild',
      message: 'Tour not found',
    });
  }
  const tour = tours.find(el => el.id === id); // --> this way is good
  //   if (!tour)
  // return res.status(404).json({
  //   status: 'Faild',
  //   message: 'Tour not found',
  // });

  res.status(200).json({
    status: 'Success',
    data: {
      tour,
    },
  });
});

// !HANDLE PUT AND PATCH
//--> put update entrire object and patch update property of object
app.patch('/api/v1/tours/:id', (req, res) => {
  // --> we will leanr the way send back api response
  const id = +req.params.id;
  if (id > tours.length) {
    res.status(404).json({
      status: 'Faild',
      message: 'Invalid id',
    });
  }
  const tour = tours.find(el => el.id === id);

  Object.assign(tour, req.body);
  tours[tour.id] = tour;

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    if (err) {
      res.status(404).json({
        status: 'Faild',
        message: 'File not found',
      });
    }
    res.status(200).json({
      status: 'Success',
      data: {
        // tour: '<Update here...>', // planholder
        tour,
      },
    });
  });
});

//!!DELETE
app.delete('/api/v1/tours/:id', (req, res) => {
  // * http code for delete is 204 mean is no content so this time our data is null
  const tour = tours.find(el => el.id === +req.params.id);
  tours.splice(tour.id, 1);
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    if (err) {
      res.status(404).json({
        status: 'Faild',
        message: "Can't delete",
      });
    }
    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });
});

const port = 3000;
app.listen(port, () => {
  // console.log(`App is listening port ${port}`);
});
