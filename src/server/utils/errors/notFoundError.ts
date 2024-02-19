import { ErrorTypes } from './errorTypes';

class NotFoundError extends Error {
  statusCode: number;
  errorType: ErrorTypes;

  constructor(message: string) {
    super(message);
    this.statusCode = 404;
    this.errorType = ErrorTypes.NOT_FOUND;
  }
}

export default NotFoundError;
