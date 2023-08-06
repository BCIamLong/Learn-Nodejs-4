//NOW WE'RE WORKING WITH MONGODB SO WE DON'T NEED ANY THING ABOUT DATA FROM JSON FILE SO WE DELETED ALL THIS
//import tour model to  handle CRUD and more actions with DB
const tourModel = require('../models/tourModel');

//? so sice we use mongoDB it's always create new id and unique identifier so you don't need to check it becasue mongo did for you
// const checkId = (req, res, next, val) => {
//   if (val > tours.length)
//     return res.status(404).json({
//       //!! you need use return here because when you check id invalid you send respose but it's not end point(route) so it's still run code run next() and go to next middleware
//       //!! becareful with this
//       //--> that's error send headers after you send response(not allow)
//       status: 'Faild',
//       message: 'Invalid id',
//     });

//   next();
// };

const sendRes = (cod, stt, data, res) => {
  res.status(cod).json({
    status: stt,
    data: data,
  });
};

//===================================================

const getAllTours = async (req, res) => {
  // console.log(req.requestTime);
  const tours1 = await tourModel.find({});
  // console.log(tours1);
  if (!tours1) {
    res.status(404).json({
      status: 'Faild',
      message: 'File not found',
    });
  }
  res.status(200).json({
    status: 'Sucess',
    requestAt: req.requestTime,
    result: tours1.length,
    data: {
      tours1,
    },
  });
};
const createTour = (req, res) => {};

const getTour = (req, res) => {
  console.log(req.params);

  const id = +req.params.id;
};

const updatePieceOfTour = (req, res) => {
  const id = +req.params.id;
};
const deleteTour = (req, res) => {};

const checkReqBody = (req, res, next) => {
  // JSON.stringify(req.body) === "{}""
  if (Object.keys(req.body).length === 0 || !req.body.name || !req.body.price)
    //! 400 http code mean is bad request
    return res.status(400).json({
      status: 'Faild',
      message: 'Missing data, you need fill all data to send',
    });

  next();
};

module.exports = {
  getAllTours,
  getTour,
  createTour,
  deleteTour,
  updatePieceOfTour,
  checkReqBody,
};
