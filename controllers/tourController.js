const Tour = require('../models/tourModel');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchSync');
// const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');

//?Refactory code: because we used this code two times and maybe in future we also need to use again and refactory to a function and reuse is good for this case
//! but we also have a best way that's handle in middleware mongo that pre find hook(middleware) right
// const populatedData = queryOb =>
//   queryOb.populate({
//     // two this data is not nesecarry for tour guides so we need filter them
//     path: 'guides',
//     select: '-__v -passwordChangedAt',
//   });

const getAllTours = handlerFactory.getAll(Tour);
//  catchAsync(async (req, res, next) => {
//   // console.log(req);
//   const count = await Tour.estimatedDocumentCount();
//   //new APIFeatures(populatedData(Tour.find()), req.query)
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .select()
//     .pagination(count);
//   const tours = await features.query;
//   res.status(200).json({
//     status: 'Sucess',
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

//?The try catch block is per functions and in catch we have similar code and now we need refactoring code and
//*1,create the high level function wrapper the async function
//*2, handle the error for the global error can catch
// * The error in async function basically that's a rejected promises, beacause all async function return promise
//we also need next because we need use next to send error to global errors handle catch
//--> because it's a rejected promise so we can use catch() to catch error

//!First this function will call by the express if has the request for this route, and the express expected the function(req, res, next), but this function return function(fn) so it's not type of express
// *--> the solution we need return a function express expected: catchAsync return function(req, res, next)

const createTour = handlerFactory.createOne(Tour);

// catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

//?IMPLEMENTS GET ONE FACTORY HANDLER

//* so why we need this middleware, well because in get tour we have populate() so we need set logic for getOne can use for this case, because in get user and review don't have this populate
//!Way 1 to set logic for get tour with populate for getOne factory
const setReivews = (req, res, next) => {
  req.body.reviews = 'reviews';

  next();
};

//! you can't use -user to remove user out of this result why? because we also populate user in reviewModel right so it uses to run populate() in review model so you can't remove it
//* we don't need tour because we get tour and in this tour we have many reviews so the tour id now was exist we don't repeat data many time in per review
const getTour = handlerFactory.getOne(Tour, {
  path: 'reviews',
  select: 'review rating ',
});

// catchAsync(async (req, res, next) => {
//   const { id } = req.params;

//   const tour = await Tour.findById(id).populate('reviews');

//   if (!tour) return next(new AppError(404, 'Id invalid'));

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

const updateTour = handlerFactory.updateOne(Tour);

// catchAsync(async (req, res, next) => {
//   const { id } = req.params;

//   const tourUpdate = await Tour.findByIdAndUpdate(id, req.body, {
//     new: true,
//     runValidators: true, //now the validator in schema enable and can check data
//   });
//   if (!tourUpdate) return next(new AppError(400, 'Update data invalid'));
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tourUpdate,
//     },
//   });
// });

const deleteTour = handlerFactory.deleteOne(Tour); //* delete on will return function like this code bellow and it's also middleware function, so it'll run when middleware called
//catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const tour = await Tour.findByIdAndDelete(id);
//   if (!tour) return next(new AppError(400, 'Id invalid'));
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

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
  setReivews,
};
