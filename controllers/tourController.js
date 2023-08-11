const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

const getAllTours = async (req, res) => {
  try {
    const count = await Tour.estimatedDocumentCount();
    console.log(count);

    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .select()
      .pagination(count);

    //*2 EXECUTE QUERY

    const tours = await features.query;

    //*3 SEND RESPONSE
    res.status(200).json({
      status: 'Sucess',
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fails',
      message: 'Data not found',
      error: err.message,
    });
  }
};

const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fails',
      message: 'Data invalid',
      error: err,
    });
  }
};

const getTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id); //return an object

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fails',
      message: 'Tour not found',
      error: err,
    });
  }
};

const updateTour = async (req, res) => {
  try {
    const { id } = req.params;

    const tourUpdate = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true, //now the validator in schema enable and can check data
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour: tourUpdate,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fails',
      message: 'Data invalid',
      error: err,
    });
  }
};
const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    await Tour.findByIdAndDelete(id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fails',
      message: 'Invalid id',
      error: err,
    });
  }
};

//>>>>>>HANDLE ALIAS ROUTE
//we will add query needed to req.query and handle in getAllTours() that's good to apply middleware to chan req query
const aliasTop3CheapTours = (req, _, next) => {
  // req.query = { sort: 'price -ratingAverage', limit: 3 };
  req.query.sort = 'price -ratingAverage';
  req.query.limit = '3'; //set string look like req.query we handle
  req.query.fields = 'name,price,duration,ratingAverage,summary'; //select field to render friendly and easy look

  next();
};

//!>>>>>>>>>AGGREGATION PIPELINE
//* https://www.mongodb.com/docs/manual/aggregation/
//* https://www.mongodb.com/docs/manual/core/aggregation-pipeline/

//create function caculatea coupe of statistics(1 vai so lieu thong ke) about a tours
//Aggregation is really a features of mongodb but mongoose of course gives us access to it so that's we can use it in mongoose driver
//--> using Tour model to access the tour collection
const getTourStats = async (req, res) => {
  try {
    //aggregation is use query like query methods we learn, but the difference is in aggregate we can manipulate with data in couple of different steps
    //to define steps we pass an array of so-called stages
    const stats = await Tour.aggregate([
      //--> aggregate() return aggreate object, find, filter,select, sort... methods return query object

      //and then here we have a lot of stages
      //so the documents then pass though these stages step by step in sequence stages we defined
      //so each of elements in this array is a stage, so we have many stages
      //* https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/ youcan go here to read more aggregation operator, for example if you want build some feature you should com docs and read some thing maybe help for you create new features
      {
        $match: {
          // is match and filter certain document it's look like filter we did with mongodb use query to filter

          ratingAverage: { $lte: 4.5 },
        },
      },
      {
        $group: {
          //allow we group document by using accumulator as caculate average a field or more fields in group use $avg oprator, caculate sum a field or more fields in group use $sum operator,...
          // _id: '$name', //set name to caculate based on name, if name in the same it's caculate group
          // _id: null, //set null to caculate all documents of tours and not seperate group, totalPrice is sum all document
          _id: { $toUpper: '$difficulty' }, // first it's find group tours with $difficult field if the difficults are a same we group it to 1 group, and then use $toUpper to upper name difficult to display for us

          // numTours: { $count: {} }, you also use this way to count numbers of tours
          numTours: { $sum: 1 }, // in this case it's go though and count per docs with value is 1
          totalPrice: { $sum: '$price' }, // in this case it's go though and count per doc with value is price fields of that document
          //"$price" use $ to sepetify a field of document
          numRating: { $sum: '$ratingAverage' },
          avgRating: { $avg: '$ratingAverage' },
          maxPrice: { $max: '$price' },
          minRating: { $min: '$ratingAverage' },
        },
      },
      {
        //sort oprator: field_name: 1 is insc, field_name: -1 is desc, if you short multiple  field is orfer to left to right
        //https://www.mongodb.com/docs/manual/reference/operator/aggregation/sort/ read this
        //!! NOTICE: IF YOU USE SORT IN AFTER MORE STAGE BEFORE YOU NEED TO NOTICE THE FIELDS YOU DEFINED AGAIN BEFORE, FOR THIS CASE YOU DEFINED FIELD AGAIN IN THE CODE USE $GROUP ABOVE:
        // numRating: { $sum: '$ratingAverage' },
        //   avgRating: { $avg: '$ratingAverage' },
        //   maxPrice: { $max: '$price' },
        //   minRating: { $min: '$ratingAverage' },
        //* --> so now if you wanna sort true you need you this fields above
        $sort: { avgRating: 1 },
      },
      //we can also repeat stage multiple times
      {
        $match: { _id: { $ne: 'EASY' } }, //$ne => not equal
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fails',
      message: 'cant request',
      error: err.message,
    });
  }
};

//! SOLVES PROBLEM OF BS: GET MONTH WHICH WE HAVE MANY(MAX) TOURS IN SEPECIFY YEAR
const getMonthlyPlan = async (req, res) => {
  try {
    const year = +req.params.year;
    //so to do it we need unwind in aggregation
    const plan = await Tour.aggregate([
      //?What is unwind: https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/
      { $unwind: { path: '$startDates', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          // Date in mongo working is good, and we can compare also good
          // https://www.mongodb.com/docs/manual/reference/method/Date/
          startDates: {
            $lt: new Date(`${year + 1}-01-01`), //$lt: new Date(`${year}-12-31`) this's also true
            $gte: new Date(`${year}-01-01`),
          },
        },
      },
      // {
      //   $set: { startMonth: { $month: '$startDates' } },
      // },
      // {
      //   $group: {
      //     _id: '$startMonth',
      //     numTours: { $sum: 1 },
      //   },
      // },
      //* reference operator date in aggregation pipeline
      // --> https://www.mongodb.com/docs/manual/reference/operator/aggregation/
      {
        $group: {
          _id: { $month: '$startDates' }, //{ startMonth: { $month: '$startDates' } },
          numTours: { $sum: 1 },
          //* https://www.mongodb.com/docs/manual/reference/operator/update/push/
          //$push: push values to an array
          //tours: { $push: { name: '$name', duration: '$duration' } }, push more fields value
          tours: { $push: '$name' },
        },
      },
      {
        //*https://www.mongodb.com/docs/manual/reference/operator/aggregation/addFields/
        $addFields: { startMonth: '$_id' },
      },
      // {
      //   //*https://www.mongodb.com/docs/manual/reference/operator/aggregation/unset/
      //   with unset to remove field, notice here we don't $ notation to sepecify field
      //   $unset: '_id',
      // },
      {
        // you also can you project to remove field
        //* https://www.mongodb.com/docs/manual/reference/operator/aggregation/project/
        $project: {
          _id: 0, //1 is show, 0 is hide : manage result return show
        },
      },
      {
        //* https://www.mongodb.com/docs/manual/reference/operator/aggregation/sort/
        $sort: { numTours: -1 },
        // $max: '$numTours'
        // $group: {
        //   _id: null,
        //   numTours: { $max: '$numTours' },

        // },
        // $match: {
        //   startDates: { $max: '$numTours' },
        // },
      },
      {
        //* https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit/
        // $limit: 10,
        $limit: 1, //is get max num tours in a month
      },
    ]);

    res.status(200).json({
      status: 'success',
      result: plan.length,
      data: { plan },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fails',
      message: 'cant request',
      error: err,
    });
  }
};

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
