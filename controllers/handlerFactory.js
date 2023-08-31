//* We can see  handler function to all of  our controllers create a lot of duplicate code like update handlers, delete handlers, create handlers they will be look all the same and when we have change like change http status code,  status message then we must to go into per controller per function and then change handler function
//* So instead to do manually handler like that we should refactory code and create a factory function that’s going to return  the handlers for us
//* So factory function will return another function and in this case this is handler function so for deleting for creating for updating for reading

//? INFACT THE FACTORY DOESN'T REPLACE ALL FUNCTION IN CONTROLLER OF RESOURCESES, IF IT CAN REPLACE ALL MAYBE WE DON'T NEED CONTROLLER(WE JUST ADD IN ROUTER FILE), BECAUSE MAYBE ALL RESOURCES WE ALL HAVE THEIR OWN FUNCTION CAN'T SILILAR WITH OTHER RESOURCES
//* LIKE IN TOUR WE HAVE GET TOUR STATICTIS, GET MONTHLY TOUR, ....  AND IT'S TOTALLY DIFFRENT WITH OTHER RESOURCES => THEREFORE WE ALWAYS NEED THIS CONTROLLER FILE
//* USUALLY THIS FACTORY HANDLER USE FOR CRUD ACTION

// const Tour = require('../models/tourModel');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchSync = require('../utils/catchSync');

//? so why did we create factory handler in controller? well because the function we write here basically return controllers

//?FIRST WE WILL IMPLEMENT FOR DELETE FACTORY FUNCTION
// const deleteTour = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const tour = await Tour.findByIdAndDelete(id);
//   if (!tour) return next(new AppError(400, 'Id invalid'));
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
//--> the goal here create the function return a function look like this deleteTour function but it can use for many resources(models) in our application not only for tour rss(model) and also prepare for the future when at time maybe we also have more resources(models)

const deleteOne = Model =>
  //so why the return functionc an use Model when we  import to other file and use also we don't run this code so how the return functionc can access to model => that's because Javascript Closures
  //!https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
  catchSync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError(404, 'No document found with this id'));
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

//* IMPLEMENTS UPDATE FACTORY HANDLER FUNCTION
// const updateTour = catchAsync(async (req, res, next) => {
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

const updateOne = Model =>
  catchSync(async (req, res, next) => {
    const docUpdate = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, //now the validator in schema enable and can check data
    });
    if (!docUpdate) return next(new AppError(404, 'No document found with this id'));

    res.status(200).json({
      status: 'success',
      data: {
        doc: docUpdate,
      },
    });
  });

//?IMPLEMENTS CREATE HANDLER FACTORY FUNCTION

// const createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

const createOne = Model =>
  catchSync(async (req, res, next) => {
    // if (req.params.tourId) {
    //   const { tourId } = req.params;
    //   // const tour = await Tour.findById(tourId);
    //   // if (!tour) return next(new AppError(404, 'No tour found with this id'));
    //   req.body.tour = tourId;
    // }
    // if (req.user.id) req.body.user = req.user.id;

    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc: newDoc,
      },
    });
  });

//? IMPLEMENTS READING FACTORY HANDLER GETONE AND GETALL FUNCTIONS
// const getTour = catchAsync(async (req, res, next) => {
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
//! Because in get tour function we have populate() so we need set some logic for getOne function can work for getTour
//!*Way 1: to set logic  getTour  populate by use middleware you can set req.body.reviews in setReviews() middleware and in getOne you only pass this req.body.reviews to populate()
//--! well if req.body.reviews not exist in other rss so it'll be set undefiend and populate(undefined) is not work and we can get all data normal so that's right
//* Way 2: we will pass populateOption in parameter of getOne and set logic if populateOption exist we will set populate() and opposite
const getOne = (Model, optionPopulate) =>
  catchSync(async (req, res, next) => {
    //! Way 2:
    const { id } = req.params;
    let query = await Model.findById(id);
    if (optionPopulate) query = query.populate(optionPopulate);
    const doc = await query;
    //!Way 1:
    // const doc = await Model.findById(id);.populate(req.body.reviews);

    if (!doc) return next(new AppError(404, 'No document found with this id'));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

// const getAllTours = catchAsync(async (req, res, next) => {
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

//* WAY 1: use middleware to set the tour id to req.body and use this in getAll method and of course it's special case of review, but how with other rss? well if we don't pass this this simple is undefind and find() still working right
//* WAY 2:  also like way 1 but this time we use code from way 1 directly inslide getAll so i perferct use middleware use way1
const getAll = Model =>
  catchSync(async (req, res, next) => {
    // console.log(req);
    //!WAY 2
    //* Allow GET nested reviews on tour
    // !  it's small hack here , but if you need to a lot code to set logic you should seperate and put it in other place like middleware,...
    const filter = {};
    const { tourId } = req.params;
    if (tourId) {
      const checkTour = await Tour.findById(tourId);
      if (!checkTour) return next(new AppError(404, 'No tour found with this id'));
      filter.tour = tourId;
    }

    const count = await Model.estimatedDocumentCount();
    //new APIFeatures(populatedData(Tour.find()), req.query)
    // console.log(req.body.id);
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .select()
      .pagination(count);
    //!WAY 1
    // const features = new APIFeatures(Model.find(req.body.id), req.query)
    //   .filter()
    //   .sort()
    //   .select()
    //   .pagination(count);
    const docs = await features.query;
    res.status(200).json({
      status: 'Sucess',
      result: docs.length,
      data: {
        docs,
      },
    });
  });

module.exports = { deleteOne, updateOne, createOne, getOne, getAll };
