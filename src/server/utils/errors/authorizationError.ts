import { ErrorTypes } from './errorTypes';

class AuthorizationError extends Error {
  statusCode: number;
  errorType: ErrorTypes;

  constructor(message: string) {
    super(message);
    this.statusCode = 401;
    this.errorType = ErrorTypes.AUTHORIZATION;
  }
}

export default AuthorizationError;
