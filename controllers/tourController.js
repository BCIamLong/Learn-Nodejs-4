const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchSync');
// const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

// * create multer filter
const multerFilter = (req, file, cb) => {
  // ? we can also use this for check CSV, docx, PDF,... all the type of files we allow users uploaded
  if (file.mimetype.startsWith('image')) return cb(null, true);

  cb(new AppError(400, 'Please only upload image file!'), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// * we will use fields() because we're manipulating with images array
// * and in this method we will specify array [{name: "field_name", maxCount: num},...]
// ! field_name must be in the same with the field name from form
const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
// * so if we have only one imageCover we can use single('imageCover')
// * if we have many image in images: we can use array('images', 3)
// ? and fields() is combine two these methods above, which we can specify for field have one value or have many values

// * images processing: process images and save images to disk
const resizeImage = (fileBuffer, filename) =>
  sharp(fileBuffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${filename}`);

const resizeTourImages = catchAsync(async (req, res, next) => {
  // * so in case we upload many files it'll be req.files, if one it's req.file
  // if (!req.files) return next();
  if (!req.files.imageCover || !req.files.images) return next();
  const tourId = req.params.id;
  // console.log(req.files);
  // req.filenames = [];
  // * For cover image
  req.body.imageCover = `tour-${tourId}-${Date.now()}-cover.jpeg`;
  await resizeImage(req.files.imageCover[0].buffer, req.body.imageCover);

  // sharp(req.files.imageCover[0].buffer)
  //   * 2000x1333 is image size ratio popular for the most images
  //   .resize(2000, 1333)
  //   .toFormat('jpeg')
  //   .jpeg({ quality: 90 })
  //   .toFile(`public/img/tours/${req.body.imageCover}`);
  // req.filenames.push(imageCoverFilename);

  // * For images
  req.body.images = [];
  const imagesPro = req.files.images.map((file, i) => {
    const filename = `tour-${tourId}-${Date.now()}-${i + 1}.jpeg`;
    req.body.images.push(filename);
    return resizeImage(file.buffer, filename);

    // sharp(file.buffer)
    //   .resize(2000, 1333)
    //   .toFormat('jpeg')
    //   .jpeg({ quality: 90 })
    //   .toFile(`public/img/tours/${filename}`);
  });
  await Promise.all(imagesPro);
  // sharp(req.fields);
  next();
});

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
//* /tours-within/:distance/center/:latlng/unit/:unit
//* /tours-within/300/center/-34,45/unit/km
//--! latlng format is: lat,lng is also format from google map 16.215226, 107.815158 when you click point in google map it's also lat,lng point

const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  //* we need format distance to special unit is called radians, and to get it we need to divide it by the radius of the Earth
  //! if you use mi: the Earth radius is 3963.2 and if you use km: the Earth radius is 6378.1
  //? because the mongodb expect the radius of our sphere to be in radians
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    return next(new AppError(400, 'Please choose center point to find tours within'));

  // console.log(distance, lat, lng, unit);
  //* Query geospatial:
  //--! so we basically query for start location, because it holds the geospatial where each tour starts and so that's exactly what we're searching for
  //! https://www.mongodb.com/docs/v7.0/geospatial-queries/#geospatial-indexes
  //! https://www.mongodb.com/docs/v7.0/reference/operator/query/geoWithin/
  //! https://www.mongodb.com/docs/v7.0/reference/operator/query/centerSphere/
  //* so now to execute geospatial query we need to first attribute an index to the field where the geospatial data that we're searching for is stored
  //* in this case we need to add index to startLocation
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        // *geoWithin is geospatial operator: mean find documents within a certain geometry(hinh hoc) and that geometry we need to defined where we actually find document
        // *well we want to find them inside of sphere that start at this point(latlng) and have radius(distance)(ban kinh) with this point
        //--! For example: when we find tours in Da nang in place have distance 300 km => you want find all tours document withit a sphere that has a radius of 300 km
        // * $center is operator specifies a circle: [[lng, lat], radius] we will find with circel have center point [lng, lat] in distance radius
        //! [lng, lat] is standard format for geospatial point in MongoDB GeoJson and it might cause some confuse because normal we usually use  [lat, lng] right
        //! radius mongo expect distance with special unit is called radians unit
        $centerSphere: [[lng, lat], radius],
      },
    },
  });
  //! when we get results and so how can we know is this true or not? well we will use compass to check it: read use compass to check map in geoSpatialQueriesFidingTourWithinRadius.doc
  //* all thing we did here find the documments located  within a sphere with radius center(starting point) [lng, lat] and radius(calc by distance)

  res.json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

//*IMPLEMENTS GEOSPATIAL AGGREGATION CACULATING DISTANCE
//!https://www.mongodb.com/docs/manual/reference/operator/aggregation/geoNear/
const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) return next(new AppError(400, 'Please choose your point to caculate distance'));
  // 3963.2 : distance / 6378.1;
  //! so we need to consvert the unit in the distanceMultiplier because default it's meter and it's really not good for readable right so we need to consvert to mi or km it's good to read
  //---!: 1 mi = 1609.34 meters, 1 km = 1000 meters
  const multiplier = unit === 'mi' ? 1 / 1609.34 : 1 / 1000; // 1 / (3963.2 * 1609.34) : 1 / (6378.1 * 1000);
  // console.log(+lng, +lat);
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        //!https://www.mongodb.com/docs/manual/reference/operator/aggregation/geoNear/#behavior
        //* in geospatial aggregation we only have $geoNear operator
        //* it's always in first in stages if it's not it'll not work
        //* it requires that at least one of our fields contains a geospatial index
        near: { type: 'Point', coordinates: [+lng, +lat] }, //! notice: lng and lat must number type
        //--> near is the point [lng, lat] from which to caculate the distances, all distances is caculate from this point to all the startLocation on tours
        distanceField: 'distance',
        //-->distanceField is the name of the field that will be created and where all the calculated distances will be stored
        distanceMultiplier: multiplier,
        //!https://www.mongodb.com/docs/manual/reference/operator/aggregation/geoNear/#definition
        // --> you use this distanceMultiplier to multiply with certain number if you want to consvert this to radians you can multiply with 1/3963.2 (mi) or consvert all distances to km you can multiply to  1/1000,....
        query: {}, //{ ratingsAverage: { $gt: 4.8 } },//! we also can query in $geoNear stages it's maybe helpful in some certain situations
      },
    },
    //!https://www.mongodb.com/docs/manual/reference/operator/aggregation/project/
    {
      $project: { name: 1, distance: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
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
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
};
