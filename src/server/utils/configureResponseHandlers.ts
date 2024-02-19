import { Response, Request, NextFunction } from 'express';
import {
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ErrorTypes,
} from './errors';

export type ThrownError =
  | ValidationError
  | NotFoundError
  | AuthenticationError
  | AuthorizationError
  | unknown;

/*
  NAME: Success
  CODE: 200
  DESC: Used to send a successful API response.
*/
const success = (res: Response) => {
  return (message: string, data = {}) => {
    res.statusCode = 200;
    if (!res.headersSent) {
      return res.json({ message, ...data });
    }
  };
};

/*
  NAME: SendError
  DESC: Receives a thrown error and sends an error response 
        based on the type of error received.
*/
const sendError = (res: Response) => (error: ThrownError) => {
  const isValidationError = error instanceof ValidationError;
  const isNotFoundError = error instanceof NotFoundError;
  const isAuthenticationError = error instanceof AuthenticationError;
  const isAuthorizationError = error instanceof AuthorizationError;

  const isKnownError =
    isValidationError || isNotFoundError || isAuthenticationError || isAuthorizationError;

  if (!res.headersSent) {
    if (isKnownError) {
      res.statusCode = error.statusCode;
      return res.json({
        error: error.message,
        errorType: error.errorType,
      });
    } else {
      res.statusCode = 500;
      res.json({
        error: 'an unknown error has occurred',
        errorType: ErrorTypes.FATAL,
        errorDetails: error,
      });
    }
  }
};

const configureResponseHandlersMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.success = success(res);
  res.sendError = sendError(res);
  next();
};

export default configureResponseHandlersMiddleware;
