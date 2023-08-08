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
//===================================================
//>>>>>>>>>>>>>>>AVANCED FILTER
//this is query: 127.0.0.1:3000/api/v1/tours?duration=5&soft=2&price=997
// so now we only query with: one field with one value but if we want more some as: less than equals, less than, greate than,... as: duration>=5, 3=< duration <=7 so how to do it

// BEFORE THAT WE NEED TO KNOW HOW WE WRITE LINK INCLUDE >, <, >=, <=
//--> 127.0.0.1:3000/api/v1/tours?duration[gte]=5&soft=2&price=997
//--! duration[gte]=5 so we use [name_operator], durantion is name and [gte] is specify operator and =5 is value

//?We can use one field with two condition: for example we want    3< duration <=9
//-->127.0.0.1:3000/api/v1/tours?duration[gte]=5&duration[lt]=10&soft=2
//---127.0.0.1:3000/api/v1/tours?duration[gte]=5&duration[lt]=10&price[gt]=1000&soft=2//--!also have more field condition
const getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    // { duration: { gte: '5' }, soft: '2', price: '997' }: so the work here is add the $ notation before gte to mongo can understand and execute query
    const obQuery = { ...req.query };

    const excludedField = ['soft', 'pages', 'limit', 'fields'];

    excludedField.forEach((el) => delete obQuery[el]); //if obQuery[el] true => delete

    // const arr = [...ob];
    // ?{ duration: { gte: '5' }, soft: '2', price: '997' }: so the work here is add the $ notation before gte to mongo can understand and execute query
    //*WAY 1:
    // const propertyArr = Object.keys(obQuery);
    // // const options = ['gte', 'lte', 'gt, lt'];

    // propertyArr.forEach((el) => {
    //   if (obQuery[el].gte) {
    //     obQuery[el].$gte = obQuery[el].gte;
    //     delete obQuery[el].gte;
    //   }
    // });
    // console.log(obQuery);
    //*WAY2:USE REGULAR EXPRESSION, we use regular expresion to find data need to change
    // const options = ['gte', 'lte', 'lt', 'gt'];
    let obQueryStr = JSON.stringify(obQuery);
    // console.log(obQuery, obQueryStr);
    // options.forEach((el) => obQueryStr.replace(el, `$${el}`));
    // /\b(gte|lte|gt|lt)\b/g, \b we only wanna find and \b to return boolean type, and g is global i wanna find all don't find once for example: if i found it'll stop if not g notation
    //--! replace() accept callback function so it's very powerful
    obQueryStr = obQueryStr.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (match) => `$${match}`,
    ); //!notice replace change but don't change the original string so if you want have a new value change you need assign is a variable
    //!--> SO IN THE REAL WORLD WE HAVE TO WRITE DOCUMENT WHICH ALLOW USER TO KNOW WHICH KIND OPERATION THEY CAN DOON OUR API --> SO A GOOD IDEAL WE WILL COMPLETLY DOCUMENT OUR API AND GUIDE USERS THE WAY TO USE: SEDITIFYING REQUEST BY HTTP METHODS, AND SOME FEATERS AS SOFTING, FILTERING,... WHICH OF THEM AVALIABLE TO USE
    //--> SO IF YOU WANT TO IMPLEMENT API FOR ANOTHER PEOPLE CAN USE WE NEED TO IMPLEMENTS THIS DOCUMENT

    // console.log(JSON.parse(obQueryStr));
    //*1 BUILD QUERY
    const query = Tour.find(JSON.parse(obQueryStr));

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
      error: err,
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
