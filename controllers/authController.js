const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchSync = require('../utils/catchSync');

//?why we called singup instead create user because this name is more meaning
const signup = catchSync(async (req, res, next) => {
  //!PROBLEM HERE: WE GET ALL DATA FROM REQ.BODY SO PROPLEM HERE ANYONE CAN SEPECIFY THE ROLE(they can use: req.body.role = "admin") AS AN ADMIN AND SO ANYONE CAN RESGITER AS ADMIN INTO OUR APPLICATION => THIS IS SECURITY FLAW(LO HONG) WE NEED TO FIX THAT
  //-->solution:
  // const newUser = await User.create(req.body);
  //*With this way we only allow the data needed to put into the new user(name, email, password, passwordConfirm), with this way we can prevent all data(not need) to DB
  //?Now we have two way to resgiter admin one we can add user and then go to mongo compass and edit role on user, two we can create new special route for admin (/admin) with this way we need create gui of data(like this

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  //* when we create user we also should login user to the web site(nowsday many website also do that)
  //--> sign json web token and send it back to the user
  //--> so u need install jsonwebtoken
  //-->https://www.npmjs.com/package/jsonwebtoken or https://github.com/auth0/node-jsonwebtoken#readme
  //--> we will sign() to sign JWT and send for user, if user want request to protected route we use verify() to verify this user have permission to do that?

  //*payload: an object constain all data we wanna storage and put on jwt
  //*secret: secret data is very important to security, and we should put it in a good place that's config.env file
  //*option: is an object, we have many option can use you can fo to the docs of this packages and use, here we use for set expiresIn
  //--! so we need to pass some header(ofcourse we have header auto created) for the time of JWT, we need put a time and after that time this JWT not used even it's correct verify(user is using website but his JWT not longer valid => auto logout this user) => after that time we will logout user with security measure
  //--> it's just like an additional security measure
  const token = await jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPRIES_IN, // add some data to additional payload
  });
  //!When you create the token you can check it's valide or not by use debuggg tool on web: https://jwt.io/

  //we no check password,email,username... correct user exist in the DB because here in this case user just be created and then we log user in the application by sending a token(and user client should then some way to save that token)
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

module.exports = { signup };
