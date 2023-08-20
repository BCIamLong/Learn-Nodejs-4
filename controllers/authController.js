const { promisify } = require('util');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchSync = require('../utils/catchSync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const createToken = user =>
  //*add password for check if user change password when the jwt issued
  jwt.sign({ id: user._id, password: user.password }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPRIES_IN, // add some data to additional payload
  });

const signup = catchSync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    // roles: req.body.roles, //! you should give this roles always default so we don't need this line code in here but now we are developing so wen use this to check info or you can go to compass GUI and change
  });
  const token = createToken(newUser);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

const login = catchSync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError(400, 'Please fill your email and password'));

  const user = await User.findOne({ email }).select('+password');
  const correct = await user?.passwordCorrect(password, user.password);
  if (!correct || !user) return next(new AppError(401, 'Email or password not correct'));

  const token = createToken(user);

  //* Storage the token on cookie
  return res
    .cookie('access_token', token, {
      httpOnly: true, //http using during the development
      secure: process.env.NODE_ENV === 'production', //use using during the production
    })
    .status(200)
    .json({
      status: 'success',
      token,
    });
});

//?IMPLEMENTS THE PROTECTED MIDDLEWARE
//--! How we can storage token and where we storage the token and this token can exits on all request? because we need check token on the route when user access
//--> we can storage on cookie or local storage
const protect = catchSync(async (req, res, next) => {
  //!1, we get the token(where we get token)

  const token = req.cookies.access_token;
  // * 403 mean is client is forbidden from accessing a valid URL.
  //--> https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403

  //!2, check token exist and check token is verify?
  //-->https://github.com/auth0/node-jsonwebtoken#readme
  const data = jwt.verify(token, process.env.JWT_SECRET);
  if (!token && !data) return next(new AppError('Token invalid', 403));

  //!3, check user still exist or not(based on JWT_EXPIRES_IN)
  // console.log(data);
  if (data.iat > data.exp) return next(new AppError('Token was expires', 403));
  console.log(token);

  //!4, check if user change password after the jwt was issued(dc cap):
  //-->because if the password changed you need rejected this user we don't have any request for resset passowrd, maybe the 3rd party wanna change the password and wanna get your account(username, email very easy to get they can go to profile and can take it)
  const user = await User.findById(data.id).select('+password');
  if (!(await user.passwordCorrect(data.password, user.password)))
    return next(
      new AppError('The payload of token changed, warm the 3rd try to chan your info', 403),
    );
  // data.password = user.password;

  //!5,allow or rejected the request
  console.log('Token is valid ');
  next();
});

const logout = (req, res, next) =>
  res.clearCookie('access_token').status(200).json({
    status: 'success',
    message: 'Successfully logged out',
  });

const protectManually = catchSync(async (req, res, next) => {
  //! 1, check token
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer'))
    return next(new AppError(401, 'You are not logged in, please login to get access'));
  //401 is http status code: means data is sent and request is correct but you must to login to use data(resoures)
  //-->https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401#:~:text=The%20HyperText%20Transfer%20Protocol%20(HTTP,credentials%20for%20the%20requested%20resource.

  const token = req.headers.authorization.split(' ')[1];
  // console.log(token);
  if (!token) return next(new AppError(401, 'You are not logged in, please login to get access'));
  //!2, verifitication token: token of user not valid(someone edit payload,...), token of user expiresed => logout and login again to have a new token to use
  //--! so jwt.verify() is a sync function but we wanna use async function because the sync maybe can block event loop and block server,... because of this we should consver this function to async function
  //--> we will use util model from nodejs, this model constain the method called promisify()
  //--> promisify() consvert the sync function to async and return a promise
  //--> promisify(jwt.verify) === async (jwt.verify) => (token, process.env.JWT_EXPRIES_IN)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //?To check this verify() you can go to jwt.io and pass the token and edit payloads and get this token check if it's invalid => your verify is success
  // const decoded = jwt.verify(token, process.env.JWT_EXPRIES_IN);

  // if (!decoded)
  //   return next(//! this error !decoded not be catch because this error from jwt package and they auto throw this error and express get it and go to the global error(look like when we handle the mongo error)
  //     new AppError(403, 'You dont have permission to go this access'),
  //   );
  //check token is expires?
  // console.log(decoded);
  // if (decoded.iat > decoded.exp)
  //   return next( //!This error also auto create auto by the jwt package so we can't catch this error => we need custom this error for production
  //     new AppError(401, 'Your login turn was expires, please login again'),
  //   );
  //!3, check if user still exits
  //--> what happen if the user has been deleted in the meantime so the token will still exist, => when user has been deleted we don't want this token still here we need deleted user => deleted the token
  //-->some reason as: user comment bad and insult with more other accouts => admistrator decided to delete this accout, or some other reason this account is auto, is bot,...=> need delete
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    //a, delete token
    decoded.iat += decoded.exp / 100; // with we will do decode.iat > decode.exp => token was expires
    //b, send error
    return next(
      new AppError(
        401,
        'The user belonging to this token does not exist, please signup to get access',
      ),
    );
  }

  //!4, check if user changed password after the token was issued(dc cap)
  //--> for example: if other people get the json web token from this user, and this user want to protected by change this password to protect his account => we need do: when he change password => change the token and then the old token now is invalid, and this people can't use the old token to access the protected routes
  //--> and to do that we will create a instance method and this method mean will available on all documments(document is instance of model)
  //--> why we should create in model because this has many code and related to model, data(bussiness logic) and not related to controller(application logic)

  //check password changed?

  if (freshUser.checkPasswordChangeAfter(decoded.iat)) {
    //!change token: we don't need change this action is another place not in this, maybe it's in change, reset password features
    // req.headers.authorization.split(' ')[1] = createToken(freshUser);

    //---if a guys get the token from this user and access to user account and using, then this user know his accout be get invalid access from this guys=> user change password => change token
    //--> and this guy is usng the this user accout will be get error User recently change password, please login again
    return next(new AppError(401, 'User recently change password, please login again'));
  }

  // *GRANT ACCESS TO PROTECTED ROUTE
  //---put the entire user data on the request: cuz we need user data to manipulate with some data in future
  //--! remmember this req object can travel in all middleware in middleware stack and to put data to the next middleware well we will storage that data in req object
  //!So the id ussually add to json wen token it's make then know whether the user that's trying to perform the action in the user or if the admin, leading guide or whatever
  //! we have id we can get user from DB via id => we pass data to req.user and after middleware use this data to perfrom something like authoriztion, ....
  req.user = freshUser;
  next();
});

//?IMPLEMENTS AUTHORIZATION USERS
//* create wapper function return function of middleware type which express expected(because we using this function as middleware so we also need return type of middleware, if not it'll never work)
//* res and spread operator in ES6 js: https://www.freecodecamp.org/news/three-dots-operator-in-javascript/
//* THIS IS ALSO A PART OF AUTHETICATION WORKFLOW
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    //* remember this data we get from before middleware that's protect middeware we use  req.user = freshUser; to add user into req, req can travel in middleware cycle

    //!When we access to this function why we can access to roles, well that's closure and the first running was be snipshot and it's still in here and we can access
    if (!roles.includes(req.user.roles))
      return next(
        //!403 is forbidden it's for authorization: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403
        new AppError(403, 'You dont have permission to do access to this'),
      );

    next(); //allow perform action
  };

//?IMPLEMENTS RESET PASSWORD:

const forgotPassword = catchSync(async (req, res, next) => {
  //?1,>>>>>>>>>>>>>>>>> CHECK EMAIL INPUT<<<<<<<<<<<<<<<<<<<<<
  const { email } = req.body;
  if (!email) return next(new AppError(400, 'Please fill email'));
  //!?, >>>>>>>>>CHECK EMAIL CORRECT WITH USER EMAIL<<<<<<<<<<<<<<<<
  const user = await User.findOne({ email });
  if (!user) return next(new AppError(404, 'Email is not correct, please check and try again'));
  //?3>>>>>>>>>>>>>>>>>CREATE A SIMPLE(RANDOM) TOKEN<<<<<<<<<<<<<<
  //* we will create instance method in user model, becasue this's only related to user data, and this code here is also a couple code and we also need seperate to easy manage, and mongoose also best as instance method
  const resetToken = user.createResetPasswordToken();
  //! notice in createResetPasswordToken() we change user with passwordResetToken, passwordResetExpires but we really still don't save it so now we wanna save this token and expires time to DB so we will use user.save()
  await user.save({ validateBeforeSave: false });
  //!now we have a problem that's i user object we don't have all field required to save as: passwordConfirm because we don't in DB so we ignored it,... well we use option in save() method that's { validateBeforeSave: false } we turn off all validators in schema
  //?4, >>>>>>>>>>>>>SEND A TOKEN (save token into request to after middleware will handle this token)<<<<
  //---we also need reset url, bassically when user go to email and hit this link to go page reset password, and of course this for dynamic website
  //--> we only create api and send this link the client will handle this
  //--> with api we can check by copy this link and run and change
  //* we create reset url to ready in development and also production
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
  //--> we will sen resetToken(original) to user and user click to this link and fill password then click confirm then we will conpare resetToken(original) with encrypted reset token in DB to know Is this user real? and confrim change password

  // we also create content for this mail
  const message = `Forgot your password? submit a PATCH request with your new password and password confirm to ${resetURL}. \n If you didn't forgot your password, just ignore this email`;

  //* we need use try catch here because we need do more like send reset password token when the error occurs not only send error(if it's use catchSync())
  try {
    await sendEmail({
      email,
      subject: 'Your password reset token (valid in 10 minutes)',
      message,
    });

    // ! so in here we assume email is security place to change your password
    res.status(200).json({
      status: 'success',
      message: 'Token sent to your email',
      //of course we don't sen reset token in here because someone can try to access and seed your tokem easy and get it change password and control your account
    });
  } catch (err) {
    //!but it's also still end because when we send an email, maybe some errors can occurs and we must send password reset token again
    //* we need remove passwordResetToken and passwordResetExpires in process we get error
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    // 500 status code: because maybe this error can occurs in the server
    console.log(err);
    return next(new AppError(500, 'There was an error sending email. Try again later!'));
  }
});

const resetPassword = (req, res, next) => {};

module.exports = {
  signup,
  login,
  protect,
  logout,
  protectManually,
  restrictTo,
  forgotPassword,
  resetPassword,
};
