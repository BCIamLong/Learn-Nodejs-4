//REFACTORY FOR FEATURES CODE: FILLTER, SELECT, SORT, PAGINATION
//* create class contains all methods of features and then inherit via instance of class and use
//* you can create seperate file and export this class, then import to file need use

//!!>>>>>>>>>>>>UTILS FOLDER IN PLACE WE HAVE METHODS CAN USE EVERYWHERE AND EVERYTIME IN PROJECT SO WE CAN ADD THEM TO UTILS AND CALL THEM, THAT'S ALSO PLACE CONTAINS HELPERS FOR PROJECT

// * for example: you can use api fetures for all resources so that's you will use anywhere and more time, so this help you don't create many methods and repeat more => because it's bug

class APIFeatures {
  // query = '';
  // queryStr = '';
  //?CONTRUCTOR ALWAYS RUN THE FIRST TIME WHEN YOU CREATE INSTANSE FOR CLASS, SO QUERY AND QUERY STRING IS VERY IMPORTANT IF WE DON'T HAVE IT WE CAN'T  USE METHODS => WE SHOULD RUN ITS FIRST AND STORAGE IT AS FIELD
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const obQuery = { ...this.queryStr };
    const excludedField = ['sort', 'page', 'limit', 'fields'];
    excludedField.forEach(el => delete obQuery[el]); //if obQuery[el] true => delete
    //1B, AVANCED FILTER
    let obQueryStr = JSON.stringify(obQuery);

    obQueryStr = obQueryStr.replace(/\b(gte|lte|gt|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(obQueryStr));
    this.query = this.query.find(JSON.parse(obQueryStr));
    //!! APPLY THE ES6 FEATURE IS OBJECT CHAINING, YOU CAN CHANINNG METHODS IF METHODS RETURN THAT OBJECT CONTAINS THAT METHOD
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortQuery = this.queryStr.sort?.split(',').join(' ');

      // console.log(sortQuery);
      // console.log(req.query.sort.replaceAll(',', ' '));
      this.query = this.query.sort(sortQuery);
    }

    //!BECAUSE IN THIS EXAMLE WE CREATE ALL DOCUMENTS IN THE SAME TIME SO WHEN YOU DEFAULT SORT -createAt HERE IT'S ALWAYS RANDOM BECAUSE ALL EQUALS, SO THAT'S REASON WHEN YOU PAGINATION IT'S ALWAYS RANDOM AND YOU CAN SEE THE DOCUMENTS REPEAT
    if (!this.queryStr.sort) this.query.sort('-createAt');
    return this;
  }

  select() {
    if (this.queryStr.fields) {
      const queryFields = this.queryStr.fields?.split(',').join(' ');
      this.query = this.query.select(queryFields);
    }

    if (!this.queryStr.fields) {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination(count) {
    const page = +this.queryStr.page || 1;
    const limit = +this.queryStr.limit || 10;
    const skip = (page - 1) * limit;

    const totalDocs = Math.ceil(count / limit);
    //if (skip <= totalDocs)
    // console.log(skip, limit);
    if (page <= totalDocs) {
      this.query = this.query.skip(skip).limit(limit);
    } else throw new Error('Page invalid');

    return this;
  }
}

module.exports = APIFeatures;
