import { ErrorTypes } from './errorTypes';

class ValidationError extends Error {
  statusCode: number;
  errorType: ErrorTypes;

  constructor(message: string) {
    super(message);
    this.statusCode = 400;
    this.errorType = ErrorTypes.VALIDATION;
  }
}

export default ValidationError;
