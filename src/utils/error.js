class NotFoundError extends Error {
  constructor(message) {
    super(message), (this.statusCode = 404), (this.name = "NotFoundError");
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message), (this.statusCode = 400), (this.name = "BadRequestError");
  }
}

module.exports = { NotFoundError, BadRequestError };
