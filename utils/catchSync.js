// const AppError = require('./appError');
module.exports = fn => (req, res, next) => {
  // * we return a fuction express expected (req, res, next)
  // * this time we habe req, res, next come from request and can handle  fn(req, res, next)
  fn(req, res, next).catch(next); // <=> (err) => next(err) this is a way we write short
};
