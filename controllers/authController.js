const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchSync = require('../utils/catchSync');
const AppError = require('../utils/appError');

//!Because we used this code two times and maybe use this more in the future so we need create function for this instead repeat code
//!THE IMPORTAND USE OBJECT OR NORMAL VALUE TO DO PARAMETER:
//-->: https://stackoverflow.com/questions/55143045/is-it-a-good-practice-to-pass-object-as-a-paramater-than-separate-variables-to-a
const createToken = (user) =>
  //* in this case we also use id(user._id) to do parameter => async (id) =>  await jwt.sign({ id}
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPRIES_IN, // add some data to additional payload
  });
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
  // const token = await jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPRIES_IN, // add some data to additional payload
  // });
  const token = createToken(newUser);
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

//?IMPLEMENTS LOGIN USER
const login = catchSync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError(400, 'Please fill your email and password'));

  //?So because we hide password with select: false in userSchema to protected our password, but in this case we need the password to compare with other password so to do that we need use: select('+password')
  //--> +password: forced get hide field(select: false) password
  const user = await User.findOne({ email }).select('+password');
  // if (!user)
  //   return next(
  //     new AppError(
  //       401, //! 401 mean is unauthorized
  //       'User not exist, please check your email again or signup',
  //     ),
  //   );
  //* bcrypt use algorithm to encrypt password to hash password and compare
  //! we can't consvert the hash password to normal password
  //?But this code here only related to DB so the good place to do this not here, so we should to user model and write method check password and use in this
  // const con = await bcrypt.compare(password, user.password);
  // if (!con)
  //   return next(
  //     new AppError(
  //       400,
  //       'User password not correct, please check and try again',
  //     ),
  //   );
  //-->
  //!IF WE CHECK THE USER EXITS AND THEN CHECK THE PASSWORD CORRECT, POSIBLELY WE CAN GET A POTENTIAL ATTACKER INFOMATION DESPITE THE EMAIL OR THE PASSWORD IS INCORRECT, BECAUSE IF YOU DECRIBES TOO DETAIL THE ERROR, ACTACKERS CAN GUESS THE EMAIL OR PASSWORD INCORRECT AND INSTEAD GUESS TWO FIELD NOW THEY ONLY GUESS ONE FIELD
  //* WITH "Email or password not correct" MESSAGE IT'S NOT EASY TO GUESS EMAIL INCORRECT OR PASSWORD INCORRECT

  //!passwordCorrect() is special method we defined in  user model and it's available on all the documents
  const correct = await user?.passwordCorrect(password, user.password); //?we have problem that when user not exits => user in undefined and undefind.function()  => errror so use query notation ? in ES6 can fix it
  //--! if (!correct || !(await user?.passwordCorrect(password, user.password)) or you can check like this

  if (!correct || !user)
    return next(new AppError(401, 'Email or password not correct'));

  // const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPRIES_IN,
  // });
  //!NOTICE: IN REAL TIME WE DON'T USE SYNC FUNCTION IN ASYNC FUNCTION LIKE createToken() THIS, THAT'S BECASUE IN THIS PROJECT WE DON'T NEED THE MORE STRONG PASSWORD SO THE COST IS LOW AND THE SPEED IS FAST SO IT'S POSSIBLE FOR WE USE SYNC
  //!BUT IN REAL TIME WE ALWAYS NEED THE VERY STRONG PASSWORD FOR USER TO ENSURE SECURITY AND THIS LOST MORE TIME TO HASHING PASSWORD, SO IF YOU USE SYNC IN THIS CASE IT'LL BLOCK EVENLOOP AND ALL USERS ARE USING THIS APPLICATION => WE SHOULD USE ASYNC IN THE REAL TIME
  const token = createToken(user);
  return res.status(200).json({
    status: 'success',
    token,
    //?we only send the token, because with this token in client(front-end) or in web server we can do something if they get token they will show accouced or message for user like login success,... => we don't need anything like message in here(not nessecary)
    //we don't send user object cuz in this case it's not nessecary
  });

  // next(new AppError)
});

module.exports = { signup, login };
