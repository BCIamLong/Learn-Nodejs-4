const User = require('../models/userModel');
const catchSync = require('../utils/catchSync');

//?why we called singup instead create user because this name is more meaning
const signup = catchSync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

module.exports = { signup };
