//* We can see  handler function to all of  our controllers create a lot of duplicate code like update handlers, delete handlers, create handlers they will be look all the same and when we have change like change http status code,  status message then we must to go into per controller per function and then change handler function
//* So instead to do manually handler like that we should refactory code and create a factory function that’s going to return  the handlers for us
//* So factory function will return another function and in this case this is handler function so for deleting for creating for updating for reading

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

module.exports = { deleteOne };
