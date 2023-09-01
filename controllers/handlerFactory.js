// const Tour = require('../models/tourModel');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchSync = require('../utils/catchSync');

const deleteOne = Model =>
  catchSync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError(404, 'No document found with this id'));
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

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

const getOne = (Model, optionPopulate) =>
  catchSync(async (req, res, next) => {
    //! Way 2:
    const { id } = req.params;
    //! this code comment is way 2 to implements getMe function
    // let query = Model.findById(req.user?.id);
    // if (id) query = Model.findById(id);
    // if (optionPopulate) query = query.populate(optionPopulate);
    let query = Model.findById(id);
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
    // const docs = await features.query.explain(); //*use explain to get some info about execution stats of this features
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
