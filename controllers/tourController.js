const fs = require('fs');
//!! controller is place we handle function, logic for rss
//!!2,Refactory code handle routes function

//!! note about link: if you use {__dirname} when use link for file in folder and you want access to out side folder use: ${__dirname}/../
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//1, --> create function
//? now i have a param middleware i can use it instean use this, and check in middleware before it come to route that's good
// const checkId = (tours, id, mes, res) => {
//   if (id > tours.length) {
//     res.status(404).json({
//       status: 'Faild',
//       message: mes,
//     });
//   }
// };
//--> create param middleware function check id for tours
const checkId = (req, res, next, val) => {
  if (val > tours.length)
    return res.status(404).json({
      //!! you need use return here because when you check id invalid you send respose but it's not end point(route) so it's still run code run next() and go to next middleware
      //!! becareful with this
      //--> that's error send headers after you send response(not allow)
      status: 'Faild',
      message: 'Invalid id',
    });

  next();
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
  //   checkId(tours, id, 'Tour not found', res); param middleware checked it
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
  //   checkId(tours, id, 'Invalid id', res); param middleware checked it
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
module.exports = {
  getAllTours,
  getTour,
  createTour,
  deleteTour,
  updatePieceOfTour,
  checkId,
};
