const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 30 * 24 * 60 * 60,
  },
});

bookmarkSchema.index({ user: 1, tour: 1 }, { unique: true });

bookmarkSchema.pre('find', function (next) {
  this.populate({ path: 'tour', select: '-description -images -guides' });
  next();
});

const Bookmark = mongoose.model('Bookmarks', bookmarkSchema);

module.exports = Bookmark;
