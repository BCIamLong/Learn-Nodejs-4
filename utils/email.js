const pug = require('pug');
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
// * now we only have the simple mail handler which not take a lot of options so we will do it more robust solution
// * and to do it we will create class because now we create handler for handle many options but with the same field in email, and class candidate for this case
// ! we will create class like this: new Email(user,url).sendWelcome()
// * parameters: user will contain user name and user email, url for resetting password
// * we have some method for many options: sendWelcome() for new user signup, sendResetPassword(),....

class Email {
  constructor(user, url) {
    // * with class we have data fields needed in central place then use this for function without pass the parameters, and it's easy to manage fields
    this.user = user;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    // * because the email in from is our website(company) email therefore we should put it in email configure file and use this because in the future we(website, company, organization...) might change the email address
    this.from = `Natours website <${process.env.EMAIL_FROM}>`;
  }

  // async sendWelcome() {
  //   const transporter = this.createTransporter();
  //   const message = '';
  //   const emailOptions = {
  //     from: 'Lanh Hoa <lanhhoa21112002@gmail.com>',
  //     to: this.user.email,
  //     subject: `Welcome ${this.user.name} come to us`,
  //     text: message,
  //   };
  //   await transporter.sendEmail(emailOptions);
  // }

  // async sendPasswordReset() {
  //   const transporter = this.createTransporter();
  //   const message = `This is your password reset link: ${this.url}, please go to link and reset your password`;
  //   const emailOptions = {
  //     from: 'Lanh Hoa <lanhhoa21112002@gmail.com>',
  //     to: this.user.email,
  //     subject: `Welcome ${this.user.name} come to us`,
  //     text: message,
  //   };
  //   await transporter.sendEmail(emailOptions);
  // }

  // async sendVerifyEmail() {
  //   const subject = `Your verify email for signup new account`;
  //   const template = 'verifyEmail';
  //   await this.send(template, subject);
  // }
  async sendTwoFactorOTP() {
    const subject = `Your two factor verification (valid in 1 minute)`;
    const template = 'twoFactor';
    await this.send(template, subject);
  }

  async sendPasswordReset() {
    const subject = `Your password reset token (valid in 10 minutes)`;
    const template = 'passwordReset';
    await this.send(template, subject);
  }

  async sendWelcome() {
    // * we can see that the sendWelcome() and sendPasswordReset() are the same mechanism right
    // * therefore that's reason we create send()
    // * and with send() we can edit and create send email for many options with easy way
    // * by do it we won't worry about things like details implementation(template and subject) like pass the parameters like sendWelcome(template, subject)
    const subject = `Welcome to natours application`;
    const template = `welcome`; // this is type of template we will use

    await this.send(template, subject);
  }

  send(template, subject) {
    // * send method is will actual do send email
    // * it will have two parameters: one template and one subject
    //! 1 render the HTML based on pug template
    // * until this point we always render HTML use pug template: res.render('name_template')
    // * and behind the scenes this render() will create HTML from pug template then send it to client
    // * now in this case we do not render template, we basically create HTML for email then send back along with email with html option
    // ? why we use need to use pug in this case?
    // * well we can create directly HTML here, it's ok and create HTML in pug and render here it's ok but easy to manage the templates because email is also template of website right
    // ? why we need require pug module here?
    // * now we don't use res.render() and res really come from express and express have pug template in the box so it doesn't need to require
    // * and now we don't use res.render() from express so we need to import the pug module to use
    // * we can also put data to renderFile() like we did with render(), the data is important to we can inject real data to email template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      subject: subject,
      url: this.url,
      otp: this.user.otp ? this.user.otp : '',
    });
    //! 2 define email options
    const emailOptions = {
      from: this.from,
      to: this.user.email,
      subject,
      html,
      // * text is very important cuz it's better for email delivery rates and also for spam folds(thu rac)
      // * and some people perfect the plain email instead the format email HTML
      // * so therefore we need the way to convert all HTML to simple text, remove all HTML and only get content
      // * and to do that we will use another package which is called HTML to Text
      // !https://www.npmjs.com/package/html-to-text
      // !https://github.com/html-to-text/node-html-to-text/blob/master/packages/html-to-text/CHANGELOG.md
      text: htmlToText.convert(html),
    };
    // ! 3 create transporter and send email
    // ! notice that if the name of function is in the same with the name function from packages we need to consider to change this name cuz it can cause the misunderstand
    return this.newTransporter().sendMail(emailOptions);
  }

  newTransporter() {
    // * we divide this function is separate for send function only care about send email work
    // ! we will create transporter for production and development
    // * in production we will send the real email with send grid service
    // * but in development well we only want to test email feature that use the fake Email host is good like the mail trap we used
    if (process.env.NODE_ENV === 'production')
      // * nodemailer is predefine some services and send grid is one of them
      // * now we will use send grid service in nodemailer
      // * and to do that we will use service option and set to send grid
      return nodemailer.createTransport({
        // service: 'SendGrid',
        service: 'Gmail',
        // * so we do not need to specify host and port cuz nodemailer by default for send grid service and it knew port and host of send grid
        // host: process.env.EMAIL_HOST,
        // port: process.env.EMAIL_PORT,
        auth: {
          // user: process.env.SENDGRID_USERNAME,
          // pass: process.env.SENDGRID_PASSWORD,
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD,
        },
      });

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
}

module.exports = Email;

//? IMPLEMENTS SEND EMAIL FUNCTION
//* Because we can send email in many place in project so we should create it as helpers in utils
//---we need install nodemailer npm modules
// const nodemailer = require('nodemailer');
// const catchSync = require('./catchSync');

// const sendEmail = async options => {
//!catchSync() we don't use catchSync funciton here because when the error occurs we need do something more than only send error like: reset password token and send again,...
//!1, create transposter:
//---a service to we can send email cuz nodejs not send email with itself, it's service we defined something like gmail
// const transposter = nodemailer.createTransport({
//we only defined, and nodemailer know how it's work because this is modules and it's contains many code behide
// service: 'gmail', //this is a type of service we also have many type of email like, .io,...
// host: process.env.EMAIL_HOST, //you also use gmai service if you want but in here we only development project so you fake email and testing before you deploy your application
// port: process.env.EMAIL_PORT,
// auth: {
//so we should save the user and password in config file
// user: process.env.EMAIL_USERNAME,
// pass: process.env.EMAIL_PASSWORD,
// },
//and in your gmail you need activate "less secure app option" to manipulate with nodemailer
//? but should we use gmail?
//--> gmail is popular but it's not at all a good ideal for a production up, because when we use gmail it's limited we only send 500 emails per day and also you will probaly marked as a spammer
//--! it's also depend your application if you app wanna interact with email more you shouldn't use gmail
//? and if your create private app and you only send email your self or some your friends but not more you can use another service like sendgrid and mailgun
//* and now we will use special development service which bassically fakes to send email to real address but reality these emails end up trapped in a development inbox and this service called mailtrap
// *  https://mailtrap.io/: you can fake to send email to client but these will then never reach these client and instead be trapped in your mail trap
// });
//!2,define the email option
//* we need defined the options for email like who's send, who's get, subject, content
// const emailOptions = {
//   from: 'Lanh Hoa <lanhhoa21112002@gmail.com>',
//   to: options.email,
//   subject: options.subject,
//   text: options.message,
// html: we alo sepecify html here to do our email friendly and beautiful, of course this content must have html type <html>...</html>
// };
//!3,actually send email
// await transposter.sendMail(emailOptions);
// };

// module.exports = sendEmail;
