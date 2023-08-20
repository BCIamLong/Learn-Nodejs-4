//? IMPLEMENTS SEND EMAIL FUNCTION
//* Because we can send email in many place in project so we should create it as helpers in utils
//---we need install nodemailer npm modules
const nodemailer = require('nodemailer');
// const catchSync = require('./catchSync');

const sendEmail = async options => {
  //!catchSync() we don't use catchSync funciton here because when the error occurs we need do something more than only send error like: reset password token and send again,...
  //!1, create transposter:
  //---a service to we can send email cuz nodejs not send email with itself, it's service we defined something like gmail
  const transposter = nodemailer.createTransport({
    //we only defined, and nodemailer know how it's work because this is modules and it's contains many code behide
    // service: 'gmail', //this is a type of service we also have many type of email like, .io,...
    host: process.env.EMAIL_HOST, //you also use gmai service if you want but in here we only development project so you fake email and testing before you deploy your application
    port: process.env.EMAIL_PORT,
    auth: {
      //so we should save the user and password in config file
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    //and in your gmail you need activate "less secure app option" to manipulate with nodemailer
    //? but should we use gmail?
    //--> gmail is popular but it's not at all a good ideal for a production up, because when we use gmail it's limited we only send 500 emails per day and also you will probaly marked as a spammer
    //--! it's also depend your application if you app wanna interact with email more you shouldn't use gmail
    //? and if your create private app and you only send email your self or some your friends but not more you can use another service like sendgrid and mailgun
    //* and now we will use special development service which bassically fakes to send email to real address but reality these emails end up trapped in a development inbox and this service called mailtrap
    // *  https://mailtrap.io/: you can fake to send email to client but these will then never reach these client and instead be trapped in your mail trap
  });
  //!2,define the email option
  //* we need defined the options for email like who's send, who's get, subject, content
  const emailOptions = {
    from: 'Lanh Hoa <lanhhoa21112002@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: we alo sepecify html here to do our email friendly and beautiful, of course this content must have html type <html>...</html>
  };
  //!3,actually send email
  await transposter.sendMail(emailOptions);
};

module.exports = sendEmail;
