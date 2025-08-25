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

class ConflictError extends Error {
  constructor(message) {
    super(message), (this.statusCode = 409), (this.name = "ConflictError");
  }
}

module.exports = {
  NotFoundError,
  BadRequestError,
  ConflictError,
};
