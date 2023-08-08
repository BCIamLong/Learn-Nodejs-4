//NOW WE'RE WORKING WITH MONGODB SO WE DON'T NEED ANY THING ABOUT DATA FROM JSON FILE SO WE DELETED ALL THIS
//import tour model to  handle CRUD and more actions with DB
const Tour = require('../models/tourModel');

// const sendRes = (cod, stt, data, res) => {
//   res.status(cod).json({
//     status: stt,
//     data: data,
//   });
// };
// QUERY METHOD IN MONGOOSE
//--> All query method return query object so you can use objects to do something filter, search, sort,...

//! NOTICE: PATCH CAN UPDATE ONE OR MORE FIELDS OR ENTRIE OBJECT, PUT UPDATE ALL ENTRIRE OBJECT WITH OBJECT UPDATE SO EXAMPLE FOR PUT: {name: 'Long', age: 20} use put with data update is {name: 'ha'} => it's update and change your object to {name: 'ha'} so we lost age property so it's not flexty
//====================================================
//>>>>>>>>>>>>>>>PAGINATION

const getAllTours = async (req, res) => {
  try {
    //1A,FILTER
    const obQuery = { ...req.query };

    const excludedField = ['sort', 'page', 'limit', 'fields'];

    excludedField.forEach((el) => delete obQuery[el]); //if obQuery[el] true => delete
    //1B, AVANCED FILTER
    let obQueryStr = JSON.stringify(obQuery);

    obQueryStr = obQueryStr.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (match) => `$${match}`,
    );

    // console.log(JSON.parse(obQueryStr));
    //*1 BUILD QUERY
    // console.log(JSON.parse(obQueryStr));
    let query = Tour.find(JSON.parse(obQueryStr));

    //2, SOFT FUNCTION
    if (req.query.sort) {
      const sortQuery = req.query.sort.split(',').join(' ');

      console.log(req.query.sort.replaceAll(',', ' '));
      query = query.sort(sortQuery);
    }

    if (!req.query.sort) query = query.sort('-createAt');
    //3, LIMIT FIELD
    if (req.query.fields) {
      const queryFields = req.query.fields.split(',').join(' ');
      query = query.select(queryFields);
    }

    if (!req.query.fields) {
      query = query.select('-__v');
    }
    //4, PAGINATION
    //-->The better wau to do pagination use skip().limit()
    // query.skip(2).limit(10);
    //---limit(10): max number of documments in a page is 10, limited amounts of documents
    //* https://mongoosejs.com/docs/api/query.html#Query.prototype.limit()
    //---skip(): is the amount of results that's should be skipped before atually quering data, it's similar a planhodler
    //*https://mongoosejs.com/docs/api/query.html#Query.prototype.skip()

    //?page=2,limit=10
    //-->limit=10 per page has 10 results => page 1: 1->10, page 2: 11->20.... page n: (n-1)*10+1->n*numofperpage(10)
    //-->page=2: we skip all result form page 1: 1-10 -> skip(10), if page=3 -> skip(20) -> page n ->skip(page*numofperpage)
    //---we need skip all results before and run results for this page
    //--?so why we don't directly write skip on query string, because page is abtraction and it's friendly and convinien

    // console.log(req.query);
    // -->WAY 1:
    // if (req.query.page && req.query.limit) {
    //   const page = +req.query.page;
    //   const perPage = +req.query.limit;
    //    console.log(page, perPage);
    //   query = query.skip((page - 1) * perPage).limit(+perPage);
    // }
    // if (!(req.query.page && req.query.limit)) query = query.skip(2).limit(3);
    // --> WAY 2:
    //? Question if i try to access the not exist page so the server should send back an errors so i need to handle it because if not this return [] empty array and it's not error
    // const count = await Tour.countDocuments({});//but it's low in big collection and so if you want count all documents and don't use filer object you can use estimatedDocumentCount() this is fast
    // *https://mongoosejs.com/docs/api/query.html#Query.prototype.estimatedDocumentCount()
    // *https://mongoosejs.com/docs/api/query.html#Query.prototype.countDocument()
    // we also have count() but now it's not use you can read here* https://mongoosejs.com/docs/api/query.html#Query.prototype.count()
    const count = await Tour.estimatedDocumentCount();
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const skip = (page - 1) * limit;
    //use math.ceil() to rounding up because when we have 14 docs and limit is 4 totalPage = 14/4 =3.5 and so we have 3 pages have 12 docs and 1 page have 2 docs so it's still have docs to render so it's not error we need to use it to fix it
    const totalDocs = Math.ceil(count / limit);
    //if (skip <= totalDocs)
    if (page <= totalDocs) query = query.skip(skip).limit(limit);
    else throw new Error('Page invalid');
    //--?so why i use throw Erorr because we are in try catch block so we don't handle error as normal way we use throw to throw error and catch() catch this error and handle
    //!NOTICE WHEN YOU IMPLEMENTS NEW FEATURE YOU SHOULD SURE OPTION OF THAT'S FEATURE S DON'T IN FIND OBJECT BECAUSE find({page: 2}) => in document doesn't have this page field so it return empty array []

    //>>>>>>>>>SUMMARY THE CHAINING QUERY METHOD IS LOOK LIKE THIS:
    //--> query.find().sort().select().skip().limit() because this methods return query object from promise so youc an chaining this like that

    //*2 EXECUTE QUERY

    const tours = await query;

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
//YOU SHOULD USE ASYNC/AWAIT INSTEAD USE THEN/CATCH
const createTour = async (req, res) => {
  try {
    //create new document
    //way 1: create instance tour and use method save() from Tour model to save to DB
    // const tour = new Tour(req.body);
    // const newTour = await tour.save();
    //way 2: use directly Tour model and call create() method to create and save Document to DB
    const newTour = await Tour.create(req.body);
    //!! if req.body contain more data fields and this fields don't include in shcema it's auto ignore by mongoDB, this is a power of mongoDB
    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    //Error here is big object so to have some meaningful errors and we can combine them to a meanful error for client we should do something that's called error handle and it's really necessary for real project
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
    // const tour = await Tour.findOne({ _id: id }); //return an object <=>  Tour.findById(id)
    // const tour = await Tour.find({ _id: id }); //return an array object
    //const tour = await Tour.findById(id).exec(): exec(()=>{}) function is similar with callback function Tour.findById(id, ()=>{})

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
    // const tourUpdate = await Tour.findByIdAndUpdate(id, req.body); //default return object before update
    // const tourUpdate = await Tour.findOneAndUpdate({ _id: id }, req.body);//default return object before update
    //? but we can have some option in this functions: new: true(allow return new document), and some option you can watch on doc of Mongoose
    const tourUpdate = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true, //now the validator in schema enable and can check data
    }); //with this way you ca get new document updated

    // const tourUpdate = await Tour.updateOne({ _id: id }, req.body);//return state obj contains some info
    // const tourUpdate = await Tour.updateMany({ _id: id }, req.body);//return state obj contains some info
    //--> so because we have many way to update but if you want manipulate with object before update you can use findOneAndUpdate, findOneAndUpdate

    //!! NOTICE: when i update with invalid data it's still work, why this case occurs?
    //--> so because validator data in schema not auto run query function of mongoose
    //--> if you wanna run validator you need setup option: runValidators: true
    //--- so if you want to do more with option you can go to Mongoose doc and watch more about option
    //! ONE THING NEED NOTICE
    //---If you see Model.count() mean is model Tour can use this method: Tour.count()
    //---If you see Model.prototype.model() mean is instance of Tour can use this method: tour = new Tour() tour.model()
    //--> Because in JS class, instance only inherit methods property in class.prototype, prototype is object contains all methods, properties with instance from this class can inherit, and methods and properties not in prototype don't be inherit by instance create from this class so this methods and properties only for this class  => if you want to know more you can go to google to watch
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
    // await Tour.findOneAndDelete({ _id: id });// { _id: id } this is condition in mongodb
    // await Tour.deleteOne({ _id: id });
    // await Tour.deleteMany({ _id: id });
    //?All of this query has option, maybe it's useful in some case you can check on Mongoose doc

    //!!IN RESAPI WE HAVE AN EXCEPTION NOT SEND RESPONSE BACK FOR CLIENT THAT'S WHEN WE HAVE DELETE MANIPULATE AND 204 HTTP STATUS CODE IS NO CONTENT AND IT'S FOR THIS DELETE MANIPULATE
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

// so we don't need check this body because in mongoose we will validate data in schema
// const checkReqBody = (req, res, next) => {
//   // JSON.stringify(req.body) === "{}""
//   if (Object.keys(req.body).length === 0 || !req.body.name || !req.body.price)
//     //! 400 http code mean is bad request
//     return res.status(400).json({
//       status: 'Faild',
//       message: 'Missing data, you need fill all data to send',
//     });

//   next();
// };

module.exports = {
  getAllTours,
  getTour,
  createTour,
  deleteTour,
  updateTour,
  // checkReqBody,
};
