class AppError extends Error {
  constructor(statusCode, message) {
    super(message); //to inherit message from Error class
    this.statusCode = statusCode;
    //we don't need pass status to constructor parameters because status depends on status code
    this.status = this.statusCode < 500 ? 'fails' : 'error';
    this.isOperational = true; //we can use this property to check and only send error mesage back to the client for these operational errors that we created using this class
    //-->this useful because some unexpected can occurs in your application for example programing error, some bugs in packages in our app
    //--> we need this property to distinguish operational error with other errors to know actually we should handle what's operational errors
    //--> example: if the programing error occurs and we send back for client so what's happen? the user don't know anything about code and they don't understand => we need to avoid this case

    //!When create instance for this class we don't add this instance and constructor is called to create properties and methods don't appear in stack and will not pollute(o nhiem) stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
