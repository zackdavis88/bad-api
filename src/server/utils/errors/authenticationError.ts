import { ErrorTypes } from './errorTypes';

class AuthenticationError extends Error {
  statusCode: number;
  errorType: ErrorTypes;

  constructor(message: string) {
    super(message);
    this.statusCode = 403;
    this.errorType = ErrorTypes.AUTHENTICATION;
  }
}

export default AuthenticationError;
