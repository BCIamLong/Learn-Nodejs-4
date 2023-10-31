const express = require('express');
const bookmarkController = require('../controllers/bookmarkController');
const authController = require('../controllers/authController');
const handlerFactory = require('../controllers/handlerFactory');

const router = express.Router({ mergeParams: true });

router.use(authController.protectManually);

router
  .route('/')
  .get(bookmarkController.setMeId, bookmarkController.getAllBookmarks)
  .post(handlerFactory.setTourUserIds, bookmarkController.createBookmark);

router.delete('/:id', bookmarkController.deleteBookmark);

module.exports = router;
