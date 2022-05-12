// making a error handler class
class AppError extends Error {
  constructor(messasge, statusCode) {
    super();
    (this.message = messasge), (this.statusCode = statusCode);
  }
}

module.exports = AppError;
