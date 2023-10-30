const mongoose = require('mongoose');

const userTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    require: true,
  },
  refreshToken: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    // ! https://mongoosejs.com/docs/api/schemadateoptions.html#SchemaDateOptions.prototype.expires
    expires: 30 * 24 * 60 * 60,
  },
});

const UserToken = mongoose.model('UserToken', userTokenSchema);

module.exports = UserToken;
