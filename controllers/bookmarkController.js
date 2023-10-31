const Bookmark = require('../models/bookmarkModel');
const handlerFactory = require('./handlerFactory');

const createBookmark = handlerFactory.createOne(Bookmark);

const setMeId = (req, res, next) => {
  req.body.user = req.user.id;
  next();
};
const getAllBookmarks = handlerFactory.getAll(Bookmark);
const deleteBookmark = handlerFactory.deleteOne(Bookmark);

module.exports = { createBookmark, getAllBookmarks, setMeId, deleteBookmark };
