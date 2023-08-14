//! REMEMBER WE MARK ALL THE ERRORS THAT WE CREATE USING APPERROR AS IS OPERATIONAL SET TO TRUE => THAT'S THE OPERATIONAL ERRORS AND THESE ALL ERROR WE WILL SEND FOR CLIENT, AT LEAST IN PRODUCTION
//?And with another errors as the programing error or unknown error as error with packages, libraries,... we don't send any error messages for client in production

class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = this.statusCode < 500 ? 'fails' : 'error';

    //* --> and isOperational will allow we do that in errors controller
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
