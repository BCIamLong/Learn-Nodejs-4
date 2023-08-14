const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchSync');
const AppError = require('../utils/appError');

const getAllTours = catchAsync(async (req, res, next) => {
  const count = await Tour.estimatedDocumentCount();
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .select()
    .pagination(count);
  const tours = await features.query;
  //! WHY WE DON'T USE HANDLE 404 ERROR IN HERE AS WE DON'T FOUND ANY RESULT, OR FILTER NOT VALID, PAGE INVALID
  //* --> Because the 0 results is also result and we can display some thing not result,... with 0 result filter is filter to 0 result and data request to DB and get 0 result from DB and we will send back 0 result with http 200
  //?--> it really can't consider an error when the user request all the tours, unless mongoDB has some problem and occurs errors then mongo auto give an error and it'll catch by catchAsync function and send next(err) and the global handler will handle this
  res.status(200).json({
    status: 'Sucess',
    result: tours.length,
    data: {
      tours,
    },
  });
});

//?The try catch block is per functions and in catch we have similar code and now we need refactoring code and
//*1,create the high level function wrapper the async function
//*2, handle the error for the global error can catch
// * The error in async function basically that's a rejected promises, beacause all async function return promise
//we also need next because we need use next to send error to global errors handle catch
//--> because it's a rejected promise so we can use catch() to catch error

//!First this function will call by the express if has the request for this route, and the express expected the function(req, res, next), but this function return function(fn) so it's not type of express
// *--> the solution we need return a function express expected: catchAsync return function(req, res, next)

const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findById(id); //return an object

  //?HANDLER 404 ERROR
  //* We can throw this error and catch method in catchSync() will catch this error
  // if (!tour) throw new AppError(404, 'Id invalid');
  // you also use:
  if (!tour) return next(new AppError(404, 'Id invalid')); //! you need return here because next() not end process and if you haven't return well we have error that: Cannot set headers after they are sent to the client
  //--> this way better because we dont need many work as throw: we throw (create new error) -> catch() catch error and send next(err), this way only send next(create new error)

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const tourUpdate = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true, //now the validator in schema enable and can check data
  });
  if (!tourUpdate) return next(new AppError(400, 'Update data invalid'));
  res.status(200).json({
    status: 'success',
    data: {
      tour: tourUpdate,
    },
  });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndDelete(id);
  if (!tour) return next(new AppError(400, 'Id invalid'));
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//>>>>>>HANDLE ALIAS ROUTE
//we will add query needed to req.query and handle in getAllTours() that's good to apply middleware to chan req query
const aliasTop3CheapTours = (req, _, next) => {
  // req.query = { sort: 'price -ratingAverage', limit: 3 };
  req.query.sort = 'price -ratingAverage';
  req.query.limit = '3'; //set string look like req.query we handle
  req.query.fields = 'name,price,duration,ratingAverage,summary'; //select field to render friendly and easy look

  next();
};

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingAverage: { $lte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        totalPrice: { $sum: '$price' },
        numRating: { $sum: '$ratingAverage' },
        avgRating: { $avg: '$ratingAverage' },
        maxPrice: { $max: '$price' },
        minRating: { $min: '$ratingAverage' },
      },
    },
    {
      $sort: { avgRating: 1 },
    },

    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

//! SOLVES PROBLEM OF BS: GET MONTH WHICH WE HAVE MANY(MAX) TOURS IN SEPECIFY YEAR
const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const plan = await Tour.aggregate([
    { $unwind: { path: '$startDates', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        startDates: {
          $lt: new Date(`${year + 1}-01-01`),
          $gte: new Date(`${year}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { startMonth: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTours: -1 },
    },
    {
      $limit: 1,
    },
  ]);

  res.status(200).json({
    status: 'success',
    result: plan.length,
    data: { plan },
  });
});

module.exports = {
  getAllTours,
  getTour,
  createTour,
  deleteTour,
  updateTour,
  aliasTop3CheapTours,
  getTourStats,
  getMonthlyPlan,
  // checkReqBody,
};
