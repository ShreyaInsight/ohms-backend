class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function assertFound(resource, message) {
  if (!resource) {
    throw new HttpError(404, message);
  }
  return resource;
}

module.exports = {
  HttpError,
  assertFound,
};
