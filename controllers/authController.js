const { promisify } = require('util');
const crypto = require('crypto');
// const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const UserToken = require('../models/userTokenModel');
const catchSync = require('../utils/catchSync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const createToken = (type, user) => {
  //*add password for check if user change password when the jwt issued
  if (type === 'access-token')
    return jwt.sign({ id: user._id, password: user.password }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_COOKIE_EXPIRES_IN * 60 * 1000, // add some data to additional payload
    });

  return jwt.sign({ id: user._id, password: user.password }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000, // add some data to additional payload
  });
};

// console.log(process.env.JWT_COOKIE_EXPIRES_IN);
//! we should create a cookie options object
const cookieOptions = {
  //* if expires time of cookie is expired so that time browser or clien general auto delete this cookie
  // expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), // it will format to Thu Aug 24 2023 19:06:02 GMT+0700 for browser can understand
  // secure: true, // set this cookie always be sent on an encrypted connection, so bassically we're using https
  //! now it's not work cuz secure not be created and not be sent to client so bassically we only actives this part here in production
  httpOnly: true, // set the cookie cannot be accessed or mordified in any way by browser and it's important to prevent cross-site scripting attacks
  // browser will stores cookie and sends it automatically along with every request
};

//secure is option for production cuz that time we https protocol not http
if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

//!Because we use this code is many times and it's repeat, so we need refactory this code
const sendJWT = async (res, statusCode, user) => {
  const refreshToken = createToken('refresh-token', user);
  const accessToken = createToken('access-token', user);

  await UserToken.findOneAndDelete({ user: user.id });

  await UserToken.create({ user: user.id, refreshToken });

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + process.env.ACCESS_COOKIE_EXPIRES_IN * 60 * 1000),
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
  });
  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
  });
};

const signup = catchSync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    // roles: req.body.roles, //! you should give this roles always default so we don't need this line code in here but now we are developing so wen use this to check info or you can go to compass GUI and change
  });
  // const token = createToken(newUser);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
  //! we set password is select in schema but in here it's still available in output that's because this is create function so we can do like this:
  newUser.password = undefined; //cuz we only want edit in this when we send to client and not update in DB right so we don't use newUser.save()

  //! const url = 'http://127.0.0.1:3000/account'; this url only work for development so we need config that to work for both production and development
  const url = `${req.protocol}://${req.get('host')}?verifyEmail=true`;
  // console.log(url);
  const email = new Email(newUser, url);
  await email.sendWelcome();
  sendJWT(res, 200, newUser);
});

const login = catchSync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError(400, 'Please fill your email and password'));

  const user = await User.findOne({ email }).select('+password');
  const correct = await user?.passwordCorrect(password, user.password);
  if (!correct || !user) return next(new AppError(401, 'Email or password not correct'));
  if (!user.verifyEmail)
    return next(new AppError(400, 'Please check your mail and verify email to login'));

  // const token = createToken(user);

  sendJWT(res, 200, user);
  //* Storage the token on cookie
  // return res
  //   .cookie('access_token', token, {
  //     httpOnly: true, //http using during the development
  //     secure: process.env.NODE_ENV === 'production', //use using during the production
  //   })
  //   .status(200)
  //   .json({
  //     status: 'success',
  //     token,
  //   });
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
  // console.log(token);

  //!4, check if user change password after the jwt was issued(dc cap):
  //-->because if the password changed you need rejected this user we don't have any request for resset passowrd, maybe the 3rd party wanna change the password and wanna get your account(username, email very easy to get they can go to profile and can take it)
  const user = await User.findById(data.id).select('+password');
  if (!(await user.passwordCorrect(data.password, user.password)))
    return next(
      new AppError('The payload of token changed, warm the 3rd try to chan your info', 403),
    );
  // data.password = user.password;

  //!5,allow or rejected the request
  // console.log('Token is valid ');
  next();
});

const logout = (req, res) => {
  //  * send back cookie with exactly the same name but the value is empty
  res.cookie('accessToken', '', {
    // * with this cookie the expires time is short because it's not make any sense, we only check for logout
    // ! if the cookie expires the browser will automatically remove it, and when we reload it so it lost right
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  res.cookie('refreshToken', '', {
    // * with this cookie the expires time is short because it's not make any sense, we only check for logout
    // ! if the cookie expires the browser will automatically remove it, and when we reload it so it lost right
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({
    status: 'success',
    message: 'Successfully logged out',
  });
};

const protectManually = catchSync(async (req, res, next) => {
  //! 1, check token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];
  // * Get token when we manipulate with browser
  if (req.cookies.accessToken) token = req.cookies.accessToken;
  if (!req.cookies.accessToken) {
    token = req.cookies.refreshToken;
    const checkToken = await UserToken.findOne({ refreshToken: token });
    if (!checkToken)
      return next(new AppError(401, 'You are not logged in, please login to get access'));
  }

  //401 is http status code: means data is sent and request is correct but you must to login to use data(resoures)
  //-->https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401#:~:text=The%20HyperText%20Transfer%20Protocol%20(HTTP,credentials%20for%20the%20requested%20resource.

  // console.log(token);
  if (!token) return next(new AppError(401, 'You are not logged in, please login to get access'));
  //!2, verifitication token: token of user not valid(someone edit payload,...), token of user expiresed => logout and login again to have a new token to use
  //--! so jwt.verify() is a sync function but we wanna use async function because the sync maybe can block event loop and block server,... because of this we should consver this function to async function
  //--> we will use util model from nodejs, this model constain the method called promisify()
  //--> promisify() consvert the sync function to async and return a promise
  //--> promisify(jwt.verify) === async (jwt.verify) => (token, process.env.JWT_EXPRIES_IN)
  let decoded;
  if (!req.cookies.accessToken)
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  if (req.cookies.accessToken)
    decoded = await promisify(jwt.verify)(token, process.env.ACCESS_TOKEN_SECRET);
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
  const freshUser = await User.findById(decoded.id); //.select('+password');//! i use this to forced get password and pass to  freshUser, and finally send this to next middleware and we can use passowrd without get user via freshUser id, because if don't have this command password auto hide becasue we set it in schema
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

// * function is logged in only for render and it's using for the page like overview,... page which we not protected, (remember that we need the user data to display for header so we need this function)
const isLoggedIn = async (req, res, next) => {
  // * so why we need catch in here because this is middleware for render views, for server side not API
  // * and if we use Global error to catch error it's for API right so it'll return res.json()
  // * and therefore we need to custom this for local and manipulate this error with server side
  //! 1, check token
  let token;
  if (req.cookies.accessToken) token = req.cookies.accessToken;
  if (!req.cookies.accessToken) {
    token = req.cookies.refreshToken;
    // console.log(token);
    const checkToken = await UserToken.findOne({ refreshToken: token });
    if (!checkToken) return next();
  }
  if (!token) return next();
  try {
    //!2, verification token: token of user not valid(someone edit payload,...), token of user expiresed
    let decoded;
    if (!req.cookies.accessToken)
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    if (req.cookies.accessToken)
      decoded = await promisify(jwt.verify)(token, process.env.ACCESS_TOKEN_SECRET);

    //!3, check if user still exits

    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      decoded.iat += decoded.exp / 100; // with we will do decode.iat > decode.exp => token was expires
      return next();
    }

    //!4, check if user changed password after the token was issued(dc cap)

    if (freshUser.checkPasswordChangeAfter(decoded.iat)) {
      return next();
    }
    // *GRANT ACCESS TO PROTECTED ROUTE
    // req.user = freshUser;
    // ! we do not need to pass the user data then pass this data to render() and use in pug template
    // * instead we will put it in res.locals and every pug templates can access to res.locals and in pug template we can use user variable, just like when we pass data to render() method

    // !CHECK VERIFY EMAIL
    if (req.query.verifyEmail) {
      freshUser.verifyEmail = true;
      await freshUser.save({ validateBeforeSave: false });
      return res.redirect('/');
    }
    if (!freshUser.verifyEmail) return next();
    // req.user = freshUser;
    res.locals.user = freshUser;
    next();
  } catch (err) {
    // throw new Error('Logout successfully');
    console.log(err);
    return next();
  }
};

const passUserDataIntoView = (req, res, next) => {
  res.locals.user = req.user;
  next();
};

const checkVerifyEmail = catchSync(async (req, res, next) => {
  const user = await User.findById(req.user?.id);
  if (!user) return next();
  if (!req.query.verifyEmail && !user.verifyEmail) return next();
  user.verifyEmail = true;
  await user.save({ validateBeforeSave: false });
  res.locals.user = user;

  next();
});

const isLogout = catchSync(async (req, res, next) => {
  //  * send back cookie with exactly the same name but the value is empty
  res.cookie('jwt', '', {
    // * with this cookie the expires time is short because it's not make any sense, we only check for logout
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  res.locals.user = undefined;
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
    if (!roles.includes(req.user.role))
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
  // const message = `Forgot your password? submit a PATCH request with your new password and password confirm to ${resetURL}. \n If you didn't forgot your password, just ignore this email`;

  //* we need use try catch here because we need do more like send reset password token when the error occurs not only send error(if it's use catchSync())
  try {
    // * we can see that all things we do only call this method and then pass user and reset URL and don;t need pass things like message,... because it's abstraction by class Email right so it's huge effect and elegant of use class
    await new Email(user, resetURL).sendPasswordReset();

    // ! so in here we assume email is security place to change your password
    res.status(200).json({
      status: 'success',
      message: 'Your rest password token sent to your email',
      //of course we don't sen reset token in here because someone can try to access and seed your tokem easy and get it change password and control your account
    });
  } catch (err) {
    //!but it's also still end because when we send an email, maybe some errors can occurs and we must send password reset token again
    //* we need remove passwordResetToken and passwordResetExpires in process we get error
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    // 500 status code: because maybe this error can occurs in the server
    // console.log(err);
    return next(new AppError(500, 'There was an error sending email. Try again later!'));
  }
});

//?IMPLEMENTS SETTING PASSWORD FOR USER: We always should implememts this reset password features in most application because it’s nessecary

const resetPassword = catchSync(async (req, res, next) => {
  //!1,get user based on token
  //* i named it passwordResset token to easy pass in findOne({passwordResetToken}) in the same with field in DB
  //! this code create encrypt reset token is repeat two time so we should refactoring to one funtion and reuse
  const passwordResetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  //* we get resetToken(original) and we consvert to encrypt type to compare resetToken(encrypt) in DB, that's we use this token with passwordResetToken field and get use findOne
  // console.log(req.params.token);
  // console.log(passwordResetToken);
  //* if you pass any type of Date like 121442142 miliseconds, year-month-day, Date.now(),... mongo auto understand and may be it'll consvert to one type and compare so you don't worry abou this
  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //?mongo file user and then compare with passwordChangedAt if not => return user = null so mongo don't create this error so we can catch this and don't need to custom error for the production like we did before

  //!2, if token not expires we set new password and save it into DB
  if (!user) return next(new AppError(400, 'Token invalid or expiresd'));

  // if (Date.now() > user.passwordResetExpires)//! because this only related with data and we can implements this model so we should implements with model(seperate bussiness and app logic)
  //   return next(new AppError(404, 'The link is expiresed, please try again'));

  // const { password, passwordConfirm } = req.body;
  // if (!password || !passwordConfirm)//! we don't need check this because we have validator in the user schema and here we use save() and it's can turn on the schema validators
  //   return next(new AppError(400, 'Please fill in required fields'));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // ? why do we need to delete two passwordResetToken and passwordResetExpires because this is only use  for reset password, and when we reset password it's also create again and we can check
  //? but some people say that if we save in DB it's still ok, in fact it's not because this data use for reset password in certain time and after certain time(10 minutes) it's useless, so save it in DB do waste resources and lost more perfromance(need more money) to maintain data(especially when we have big application)
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  //* So with user authotetication we always use save() to update because we need validators in schema working, and we need the pre save hooks(middleware) to do something like consvert the password to encypt type when we reset password,.... and if you build features and need validator from schema, and pre save hooks,... you should use save() to update

  //!3, update passwordChangedAt for current user
  //* we shouldn't update passwordChangedAt in here because it's only related to data and we can do it in model with pre save hooks so do it in there
  // user.passwordChangedAt = Date.now();

  //!4, log the user in, send JWT
  const token = createToken('refresh-token', user); //we use this function in the login, signup and now it's in here maybe in future we will refactoting this as the better function

  res.status(200).json({
    status: 'success',
    token,
  });
});

const updatePassword = catchSync(async (req, res, next) => {
  //!1,get user and check current password correct
  //--> why do we need check current password: because if open computer and maybe you have work you go you forgot shutdow your computer so anyone person can use your commputer on web app and they change your password, if we don't check current => this person can change your password and then you will be logout in this web app and lost your accout if you don't link security(like phone, email,...)
  // const { user } = req; //* in this way we have password so we don't get data user again
  const user = await User.findById(req.user.id).select('+password'); //* the sencond way we need to get data from user id in req

  const { currentPassword } = req.body;
  if (!currentPassword) return next(new AppError(400, 'Please fill your current password '));

  const check = await user.passwordCorrect(currentPassword, user.password);
  if (!check)
    return next(new AppError(401, 'Your current password not correct, please check and try again'));

  //!2, check new password and new password confirm  then update in DB
  //* we don't need validation in here because in we validation with validators in user schema
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
  // await user.findByIdAndUpdate(); is not working
  //!3,log user and sen jwt in respose
  // const token = createToken(user);
  //?when you changed the password that's time the old token was not working because we check logic with timestamp of passwordChangedAt and decoded.iat right so if user still use old token and access to protect resources he will be loggout and must to login again to get access, so we need create new token and now this user loggin with this new token
  // res.status(201).json({
  //   status: 'success',
  //   token,
  // });
  //*Refactory for this code above was comments
  sendJWT(res, 201, user);
});

const generate2FA = catchSync(async (req, res, next) => {
  const secret = speakeasy.generateSecret({ length: 20 });

  const token = speakeasy.totp({
    secret: secret.base32,
    encoding: 'base32',
  });
  req.user.otp = token;

  const email = new Email(req.user, '#');
  await email.sendTwoFactorOTP();
  res.cookie('secret', secret, {
    ...cookieOptions,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.status(200).json({
    status: 'success',
    message: 'Sent the OTP code to your email',
  });
});

const verify2FA = catchSync(async (req, res, next) => {
  if (!req.cookies.secret) return next(new AppError(401, 'Your OTP code is expires'));
  const verified = speakeasy.totp.verify({
    secret: req.cookies.secret.base32,
    encoding: 'base32',
    token: req.body.otp,
    window: 60 * 1000, //the range of time we want to check in 60s
  });

  if (!verified) return next(new AppError(401, 'Your OTP code is invalid'));

  res.clearCookie('secret');
  res.json({
    status: 'success',
  });
  // next();
});

// const checkBookmark = (req,res, next)=>{
//   if(!req.cookies.bookmark) res.cookie('bookmark', [], )
// };

module.exports = {
  signup,
  login,
  protect,
  logout,
  protectManually,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  isLoggedIn,
  isLogout,
  passUserDataIntoView,
  checkVerifyEmail,
  generate2FA,
  verify2FA,
  // checkBookmark,
};
